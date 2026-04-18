function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function PnlCell({ value, pct }) {
  if (value === null) return <span className="text-gray-400 text-sm">—</span>;
  const cls = value >= 0 ? 'profit' : 'loss';
  const sign = value >= 0 ? '+' : '';
  return (
    <div className={cls}>
      <div>{sign}${fmt(value)}</div>
      {pct !== null && <div className="text-xs opacity-80">{sign}{fmt(pct)}%</div>}
    </div>
  );
}

export default function PortfolioTable({ positions }) {
  const posArr = Object.values(positions).filter((p) => p.quantity > 0.0001 || p.realizedPnl !== 0);

  if (posArr.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <p className="text-lg mb-1">Sin posiciones registradas</p>
        <p className="text-sm">Agregá tu primera operación usando el botón "Nueva operación".</p>
      </div>
    );
  }

  const open   = posArr.filter((p) => p.quantity > 0.0001);
  const closed = posArr.filter((p) => p.quantity <= 0.0001 && p.realizedPnl !== 0);

  return (
    <div className="space-y-4">
      {open.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Posiciones Abiertas</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-3">Ticker</th><th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Precio Prom.</th><th className="px-4 py-3 text-right">Costo Total</th>
                  <th className="px-4 py-3 text-right">Precio Actual</th><th className="px-4 py-3 text-right">Valor Actual</th>
                  <th className="px-4 py-3 text-right">P&L No Real.</th><th className="px-4 py-3 text-right">P&L Realizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {open.map((p) => (
                  <tr key={p.ticker} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-blue-700">{p.ticker}</td>
                    <td className="px-4 py-3 text-right">{fmt(p.quantity, 4)}</td>
                    <td className="px-4 py-3 text-right">${fmt(p.avgCost)}</td>
                    <td className="px-4 py-3 text-right">${fmt(p.totalCost)}</td>
                    <td className="px-4 py-3 text-right">{p.currentPrice !== null ? `$${fmt(p.currentPrice)}` : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-right">{p.currentValue !== null ? `$${fmt(p.currentValue)}` : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-right"><PnlCell value={p.unrealizedPnl} pct={p.unrealizedPnlPct} /></td>
                    <td className="px-4 py-3 text-right"><PnlCell value={p.realizedPnl !== 0 ? p.realizedPnl : null} pct={null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {closed.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Posiciones Cerradas</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-3">Ticker</th><th className="px-4 py-3 text-right">Total Comprado</th>
                  <th className="px-4 py-3 text-right">Total Vendido</th><th className="px-4 py-3 text-right">P&L Realizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closed.map((p) => (
                  <tr key={p.ticker} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-700">{p.ticker}</td>
                    <td className="px-4 py-3 text-right">{fmt(p.totalBought, 4)}</td>
                    <td className="px-4 py-3 text-right">{fmt(p.totalSold, 4)}</td>
                    <td className="px-4 py-3 text-right"><PnlCell value={p.realizedPnl} pct={null} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
