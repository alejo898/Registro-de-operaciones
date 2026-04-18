import { Plus, Download } from 'lucide-react';
import { exportarCSV } from '../ui';

export default function Header({ onNewOperation, operations, tradeResults }) {
  function handleExport() {
    const rows = tradeResults.map(op => ({
      Fecha: op.date, Ticker: op.ticker,
      Tipo: op.type === 'BUY' ? 'Compra' : 'Venta',
      Cantidad: op.quantity, Precio: op.price, Comision: op.commission || 0,
      'P&L': op.pnl != null ? op.pnl.toFixed(2) : '',
      'P&L%': op.pnlPct != null ? op.pnlPct.toFixed(2) : '',
      Notas: op.notes || '',
    }));
    exportarCSV(rows, `operaciones_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Registro de Operaciones</h1>
            <p className="text-xs text-gray-500">{operations.length} operación{operations.length !== 1 ? 'es' : ''} registrada{operations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={tradeResults.length === 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={16} /> Exportar CSV
          </button>
          <button onClick={onNewOperation} className="btn-primary">
            <Plus size={16} /> Nueva operación
          </button>
        </div>
      </div>
    </header>
  );
}
