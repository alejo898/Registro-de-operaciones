function calcularPosiciones(operaciones) {
  const posiciones = {};

  for (const op of operaciones) {
    if (!posiciones[op.ticker]) {
      posiciones[op.ticker] = { cantidad: 0, costoTotal: 0, precioPromedio: 0 };
    }

    const pos = posiciones[op.ticker];

    if (op.tipo === "Compra") {
      pos.cantidad += op.cantidad;
      pos.costoTotal += op.cantidad * op.precio;
      pos.precioPromedio = pos.costoTotal / pos.cantidad;
    } else {
      pos.cantidad -= op.cantidad;
    }
  }

  return posiciones;
}

function calcularGananciaRealizada(operaciones) {
  const posiciones = calcularPosiciones(operaciones);
  let ganancia = 0;

  for (const op of operaciones) {
    if (op.tipo === "Venta") {
      const precioPromedio = posiciones[op.ticker]?.precioPromedio ?? 0;
      ganancia += (op.precio - precioPromedio) * op.cantidad;
    }
  }

  return ganancia;
}

function calcularGananciaNoRealizada(operaciones, preciosActuales) {
  const posiciones = calcularPosiciones(operaciones);
  let ganancia = 0;

  for (const [ticker, pos] of Object.entries(posiciones)) {
    const precioActual = preciosActuales[ticker] ?? 0;
    ganancia += (precioActual - pos.precioPromedio) * pos.cantidad;
  }

  return ganancia;
}

function calcularRendimientoPorActivo(operaciones, preciosActuales) {
  const posiciones = calcularPosiciones(operaciones);
  const resultado = {};

  for (const [ticker, pos] of Object.entries(posiciones)) {
    const valorActual = (preciosActuales[ticker] ?? 0) * pos.cantidad;
    const inversion = pos.costoTotal;
    resultado[ticker] = {
      rendimiento: inversion > 0 ? ((valorActual - inversion) / inversion) * 100 : 0,
    };
  }

  return resultado;
}

module.exports = { calcularPosiciones, calcularGananciaRealizada, calcularGananciaNoRealizada, calcularRendimientoPorActivo };
