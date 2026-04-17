let operaciones = [];
let nextId = 1;

function crearOperacion(fecha, ticker, tipo, cantidad, precio, comision) {
  if (!["Compra", "Venta"].includes(tipo)) {
    throw new Error('El tipo debe ser "Compra" o "Venta"');
  }
  return {
    id: nextId++,
    fecha,
    ticker: ticker.toUpperCase(),
    tipo,
    cantidad,
    precio,
    comision,
  };
}

function agregar(fecha, ticker, tipo, cantidad, precio, comision) {
  const op = crearOperacion(fecha, ticker, tipo, cantidad, precio, comision);
  operaciones.push(op);
  return op;
}

function eliminar(id) {
  const idx = operaciones.findIndex((op) => op.id === id);
  if (idx === -1) return null;
  return operaciones.splice(idx, 1)[0];
}

function listar() {
  return [...operaciones];
}

module.exports = { agregar, eliminar, listar };
