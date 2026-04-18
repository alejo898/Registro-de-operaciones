import { X } from 'lucide-react';

export default function Filters({ filters, onFiltersChange, tickers }) {
  function set(field, value) { onFiltersChange((prev) => ({ ...prev, [field]: value })); }
  const hasFilters = filters.ticker || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Ticker</label>
          <select value={filters.ticker} onChange={(e) => set('ticker', e.target.value)} className="input w-32">
            <option value="">Todos</option>
            {tickers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tipo</label>
          <select value={filters.type} onChange={(e) => set('type', e.target.value)} className="input w-32">
            <option value="">Todos</option>
            <option value="BUY">Compra</option>
            <option value="SELL">Venta</option>
          </select>
        </div>
        <div>
          <label className="label">Desde</label>
          <input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} className="input w-40" />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} className="input w-40" />
        </div>
        {hasFilters && (
          <button onClick={() => onFiltersChange({ ticker: '', type: '', dateFrom: '', dateTo: '' })} className="btn-secondary gap-1 mb-0.5">
            <X size={14} /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
