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

module.exports = { calcularPosiciones, calcularGananciaRealizada };
