import { resumenComoArray, calcularGananciaRealizadaSimple, calcularGananciaNoRealizadaSimple } from '../calculos';
import { fmt, fmtPnl, fmtPct, pnlClass } from '../ui';

function Pnl({ val, pct }) {
  return (
    <div className={pnlClass(val)}>
      <div>{fmtPnl(val)}</div>
      {pct != null && <div className="text-xs opacity-75">{fmtPct(pct)}</div>}
    </div>
  );
}

export default function ResumenTable({ operations, preciosActuales = {} }) {
  const filas       = resumenComoArray(operations);
  const realizada   = calcularGananciaRealizadaSimple(operations);
  const noRealizada = calcularGananciaNoRealizadaSimple(operations, preciosActuales);
  if (!filas.length) return null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Resumen por Ticker</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase text-gray-500 text-left">
              <th className="px-4 py-3">Ticker</th><th className="px-4 py-3 text-right">Cantidad</th>
              <th className="px-4 py-3 text-right">Precio Prom.</th><th className="px-4 py-3 text-right">Total Invertido</th>
              <th className="px-4 py-3 text-right">Precio Actual</th><th className="px-4 py-3 text-right">Valor Actual</th>
              <th className="px-4 py-3 text-right">Ganancia $/%</th><th className="px-4 py-3 text-right">Gan. Realizada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filas.map((f) => {
              const precioActual = preciosActuales[f.ticker] ?? null;
              const valorActual  = precioActual != null ? precioActual * f.cantidad : null;
              const ganancia     = noRealizada.porTicker[f.ticker] ?? null;
              const gananciaPct  = ganancia != null && f.totalInvertido > 0 ? (ganancia / f.totalInvertido) * 100 : null;
              return (
                <tr key={f.ticker} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-700">{f.ticker}</td>
                  <td className="px-4 py-3 text-right">{f.cantidad}</td>
                  <td className="px-4 py-3 text-right">${fmt(f.precioPromedio)}</td>
                  <td className="px-4 py-3 text-right">${fmt(f.totalInvertido)}</td>
                  <td className="px-4 py-3 text-right">{precioActual != null ? `$${fmt(precioActual)}` : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-right">{valorActual != null ? `$${fmt(valorActual)}` : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-right"><Pnl val={ganancia} pct={gananciaPct} /></td>
                  <td className="px-4 py-3 text-right"><Pnl val={realizada.porTicker[f.ticker] ?? null} pct={null} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-6 text-sm">
        <span className="text-gray-500">Gan. realizada: <strong className={pnlClass(realizada.total)}>{fmtPnl(realizada.total)}</strong></span>
        {Object.keys(noRealizada.porTicker).length > 0 && (
          <span className="text-gray-500">Gan. no realizada: <strong className={pnlClass(noRealizada.total)}>{fmtPnl(noRealizada.total)}</strong></span>
        )}
      </div>
    </div>
  );
}
