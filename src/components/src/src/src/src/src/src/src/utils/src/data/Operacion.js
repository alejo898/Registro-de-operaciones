export const TIPOS = Object.freeze({ COMPRA: 'COMPRA', VENTA: 'VENTA' });

export function crearOperacion({ fecha, ticker, tipo, cantidad, precio, comision = 0, notas = '' }) {
  if (!fecha || isNaN(Date.parse(fecha))) throw new Error('fecha inválida.');
  if (!ticker || typeof ticker !== 'string' || !ticker.trim()) throw new Error('ticker es obligatorio.');
  if (!Object.values(TIPOS).includes(tipo)) throw new Error(`tipo debe ser "COMPRA" o "VENTA".`);
  if (typeof cantidad !== 'number' || cantidad <= 0) throw new Error('cantidad debe ser > 0.');
  if (typeof precio !== 'number' || precio <= 0) throw new Error('precio debe ser > 0.');
  if (typeof comision !== 'number' || comision < 0) throw new Error('comision debe ser >= 0.');
  return {
    id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fecha, ticker: ticker.trim().toUpperCase(), tipo, cantidad, precio, comision,
    notas: notas.trim(), creadoEn: new Date().toISOString(),
  };
}
