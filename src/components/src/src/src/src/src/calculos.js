const qty  = o => o.cantidad ?? o.quantity;
const prec = o => o.precio   ?? o.price;
const com  = o => o.comision ?? o.commission ?? 0;
const esCompra = o => (o.tipo ?? o.type) === 'COMPRA' || (o.tipo ?? o.type) === 'BUY';
const r2 = n => Math.round(n * 100)   / 100;
const r4 = n => Math.round(n * 10000) / 10000;

function estadoPorTicker(operaciones) {
  const sorted = [...operaciones].sort((a, b) => (a.fecha ?? a.date).localeCompare(b.fecha ?? b.date));
  const estado = {};
  for (const op of sorted) {
    const t = op.ticker;
    if (!estado[t]) estado[t] = { costoTotal: 0, cantidad: 0 };
    if (esCompra(op)) {
      estado[t].costoTotal += qty(op) * prec(op);
      estado[t].cantidad   += qty(op);
    } else {
      const prom = estado[t].cantidad > 0 ? estado[t].costoTotal / estado[t].cantidad : 0;
      estado[t].costoTotal -= prom * qty(op);
      estado[t].cantidad   -= qty(op);
    }
  }
  return estado;
}

export function calcularResumen(operaciones) {
  const mapa = {};
  for (const op of operaciones) {
    const t = op.ticker;
    if (!mapa[t]) mapa[t] = { cantidad: 0, cantidadComprada: 0, totalComprado: 0 };
    if (esCompra(op)) {
      mapa[t].cantidad         += qty(op);
      mapa[t].cantidadComprada += qty(op);
      mapa[t].totalComprado    += qty(op) * prec(op);
    } else {
      mapa[t].cantidad -= qty(op);
    }
  }
  const resumen = {};
  for (const [ticker, d] of Object.entries(mapa)) {
    if (d.cantidad < 0.0001) continue;
    resumen[ticker] = {
      cantidad:       r4(d.cantidad),
      precioPromedio: r2(d.cantidadComprada > 0 ? d.totalComprado / d.cantidadComprada : 0),
      totalInvertido: r2(d.totalComprado),
    };
  }
  return resumen;
}

export function resumenComoArray(operaciones) {
  return Object.entries(calcularResumen(operaciones))
    .map(([ticker, v]) => ({ ticker, ...v }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export function calcularGananciaRealizadaSimple(operaciones) {
  const promedios = {};
  for (const op of operaciones) {
    const t = op.ticker;
    if (!promedios[t]) promedios[t] = { totalComprado: 0, cantidadComprada: 0 };
    if (esCompra(op)) {
      promedios[t].totalComprado    += qty(op) * prec(op);
      promedios[t].cantidadComprada += qty(op);
    }
  }
  const porTicker = {};
  for (const op of operaciones) {
    if (esCompra(op)) continue;
    const t    = op.ticker;
    const prom = promedios[t]?.cantidadComprada > 0
      ? promedios[t].totalComprado / promedios[t].cantidadComprada : 0;
    porTicker[t] = (porTicker[t] ?? 0) + (prec(op) - prom) * qty(op);
  }
  return { porTicker, total: r2(Object.values(porTicker).reduce((s, v) => s + v, 0)) };
}

export function calcularGananciaRealizada(operaciones) {
  const sorted = [...operaciones].sort((a, b) => (a.fecha ?? a.date).localeCompare(b.fecha ?? b.date));
  const estado = {};
  const porTicker = {};
  for (const op of sorted) {
    const t = op.ticker;
    if (!estado[t])    estado[t]    = { costoTotal: 0, cantidad: 0 };
    if (!porTicker[t]) porTicker[t] = 0;
    if (esCompra(op)) {
      estado[t].costoTotal += qty(op) * prec(op);
      estado[t].cantidad   += qty(op);
    } else {
      const prom = estado[t].cantidad > 0 ? estado[t].costoTotal / estado[t].cantidad : 0;
      porTicker[t]        += (prec(op) - prom) * qty(op) - com(op);
      estado[t].costoTotal -= prom * qty(op);
      estado[t].cantidad   -= qty(op);
    }
  }
  return { porTicker, total: r2(Object.values(porTicker).reduce((s, v) => s + v, 0)) };
}

export function calcularGananciaNoRealizadaSimple(operaciones, preciosActuales = {}) {
  const resumen = calcularResumen(operaciones);
  const porTicker = {};
  for (const [ticker, { cantidad, precioPromedio }] of Object.entries(resumen)) {
    const actual = preciosActuales[ticker];
    if (actual == null) continue;
    porTicker[ticker] = r2((actual - precioPromedio) * cantidad);
  }
  return { porTicker, total: r2(Object.values(porTicker).reduce((s, v) => s + v, 0)) };
}

export function calcularGananciaNoRealizada(operaciones, preciosActuales = {}) {
  const estado = estadoPorTicker(operaciones);
  const porTicker = {};
  for (const [ticker, { costoTotal, cantidad }] of Object.entries(estado)) {
    if (cantidad <= 0.0001) continue;
    const actual = preciosActuales[ticker];
    if (actual == null) continue;
    porTicker[ticker] = r2((actual - costoTotal / cantidad) * cantidad);
  }
  return { porTicker, total: r2(Object.values(porTicker).reduce((s, v) => s + v, 0)) };
}

export function procesarOperacionesFIFO(operaciones) {
  const sorted = [...operaciones].sort((a, b) => {
    const d = (a.date ?? a.fecha).localeCompare(b.date ?? b.fecha);
    return d !== 0 ? d : (a.createdAt ?? a.creadoEn ?? '').localeCompare(b.createdAt ?? b.creadoEn ?? '');
  });
  const tickerState = {};
  const tradeResults = [];
  for (const op of sorted) {
    const ticker = op.ticker;
    if (!tickerState[ticker]) tickerState[ticker] = { lots: [], realizedPnl: 0, totalBought: 0, totalSold: 0 };
    const state = tickerState[ticker];
    if (esCompra(op)) {
      const commPerShare = qty(op) > 0 ? com(op) / qty(op) : 0;
      state.lots.push({ quantity: qty(op), price: prec(op), commPerShare });
      state.totalBought += qty(op);
      tradeResults.push({ ...op, pnl: null, pnlPct: null });
    } else {
      let remaining = qty(op);
      let costBasis = 0;
      while (remaining > 0.00001 && state.lots.length > 0) {
        const lot      = state.lots[0];
        const consumed = Math.min(remaining, lot.quantity);
        costBasis     += consumed * (lot.price + lot.commPerShare);
        lot.quantity  -= consumed;
        remaining     -= consumed;
        if (lot.quantity < 0.00001) state.lots.shift();
      }
      const netRevenue = qty(op) * prec(op) - com(op);
      const pnl    = netRevenue - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      state.realizedPnl += pnl;
      state.totalSold   += qty(op);
      tradeResults.push({ ...op, pnl, pnlPct, costBasis });
    }
  }
  const positions = {};
  for (const [ticker, state] of Object.entries(tickerState)) {
    const currentQty = state.lots.reduce((s, l) => s + l.quantity, 0);
    const totalCost  = state.lots.reduce((s, l) => s + l.quantity * (l.price + l.commPerShare), 0);
    positions[ticker] = {
      ticker, quantity: r4(currentQty),
      avgCost: r4(currentQty > 0.00001 ? totalCost / currentQty : 0),
      totalCost, realizedPnl: state.realizedPnl,
      totalBought: state.totalBought, totalSold: state.totalSold, lots: state.lots,
    };
  }
  return { positions, tradeResults };
}

export function enrichWithCurrentPrices(positions, preciosActuales) {
  const enriched = {};
  for (const [ticker, pos] of Object.entries(positions)) {
    const currentPrice     = preciosActuales[ticker] ?? null;
    const currentValue     = currentPrice != null ? pos.quantity * currentPrice : null;
    const unrealizedPnl    = currentValue != null ? currentValue - pos.totalCost : null;
    const unrealizedPnlPct = unrealizedPnl != null && pos.totalCost > 0
      ? (unrealizedPnl / pos.totalCost) * 100 : null;
    enriched[ticker] = { ...pos, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPct,
      totalPnl: unrealizedPnl != null ? pos.realizedPnl + unrealizedPnl : null };
  }
  return enriched;
}

export function serieAcumulada(tradeResults) {
  let cum = 0;
  return tradeResults
    .filter(o => !esCompra(o) && o.pnl != null)
    .sort((a, b) => (a.date ?? a.fecha).localeCompare(b.date ?? b.fecha))
    .map(o => ({ date: o.date ?? o.fecha, pnl: r2(o.pnl), cumulativePnl: r2(cum += o.pnl), ticker: o.ticker }));
}

export function pnlPorTicker(positions) {
  return Object.values(positions).map(p => ({
    ticker: p.ticker,
    realizedPnl:   r2(p.realizedPnl),
    unrealizedPnl: p.unrealizedPnl != null ? r2(p.unrealizedPnl) : 0,
  }));
}
