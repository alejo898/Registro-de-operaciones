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

module.exports = { calcularPosiciones };
