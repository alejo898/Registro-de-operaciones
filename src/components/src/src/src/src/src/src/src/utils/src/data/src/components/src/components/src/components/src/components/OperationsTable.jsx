import { Pencil, Trash2 } from 'lucide-react';

function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export default function OperationsTable({ operations, onEdit, onDelete }) {
  if (operations.length === 0) {
    return <div className="card p-10 text-center text-gray-400"><p>No hay operaciones que coincidan con los filtros.</p></div>;
  }
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Historial de Operaciones</h2>
        <span className="text-sm text-gray-500">{operations.length} registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Ticker</th>
              <th className="px-4 py-3">Tipo</th><th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio</th><th className="px-4 py-3 text-right">Comisión</th>
              <th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">P&L</th>
              <th className="px-4 py-3 text-right">P&L %</th><th className="px-4 py-3">Notas</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[...operations].sort((a, b) => b.date.localeCompare(a.date)).map((op) => {
              const isBuy = op.type === 'BUY';
              const hasPnl = op.pnl !== null;
              return (
                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{op.date}</td>
                  <td className="px-4 py-3 font-bold text-blue-700">{op.ticker}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isBuy ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isBuy ? 'Compra' : 'Venta'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{fmt(op.quantity, 4)}</td>
                  <td className="px-4 py-3 text-right">${fmt(op.price)}</td>
                  <td className="px-4 py-3 text-right">{op.commission ? `$${fmt(op.commission)}` : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-right font-medium">${fmt(op.quantity * op.price)}</td>
                  <td className="px-4 py-3 text-right">
                    {hasPnl ? <span className={op.pnl >= 0 ? 'profit' : 'loss'}>{op.pnl >= 0 ? '+' : ''}${fmt(op.pnl)}</span> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {hasPnl ? <span className={op.pnlPct >= 0 ? 'profit' : 'loss'}>{op.pnlPct >= 0 ? '+' : ''}{fmt(op.pnlPct)}%</span> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{op.notes || ''}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(op)} className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => onDelete(op.id)} className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
