import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function CurrentPrices({ tickers, currentPrices, onUpdatePrice }) {
  const [drafts, setDrafts] = useState({});
  if (tickers.length === 0) return null;

  function handleChange(ticker, value) { setDrafts((prev) => ({ ...prev, [ticker]: value })); }
  function handleBlur(ticker) {
    const val = parseFloat(drafts[ticker]);
    if (!isNaN(val) && val > 0) onUpdatePrice(ticker, val);
    setDrafts((prev) => { const next = { ...prev }; delete next[ticker]; return next; });
  }
  function handleKey(e, ticker) { if (e.key === 'Enter') handleBlur(ticker); }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw size={16} className="text-gray-500" />
        <h3 className="font-medium text-gray-900 text-sm">Precios Actuales</h3>
        <span className="text-xs text-gray-400">(ingresá manualmente para calcular P&L no realizado)</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {tickers.map((ticker) => {
          const display = ticker in drafts ? drafts[ticker] : currentPrices[ticker] !== undefined ? String(currentPrices[ticker]) : '';
          return (
            <div key={ticker} className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-700 w-14">{ticker}</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                <input type="number" step="any" min="0" placeholder="0.00" value={display}
                  onChange={(e) => handleChange(ticker, e.target.value)}
                  onBlur={() => handleBlur(ticker)} onKeyDown={(e) => handleKey(e, ticker)}
                  className="w-28 pl-5 pr-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
