import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { serieAcumulada as buildCumulativePnlSeries, pnlPorTicker as buildPnlByTicker } from '../calculos';

const COLORS = ['#3b82f6','#f97316','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16'];
const fmt = n => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((entry) => <p key={entry.name} style={{ color: entry.color }}>{entry.name}: ${fmt(entry.value)}</p>)}
    </div>
  );
}

function PnlByTickerChart({ positions }) {
  const data = buildPnlByTicker(positions);
  if (!data.length) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">P&L por Ticker</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="realizedPnl" name="P&L Realizado" radius={[4,4,0,0]}>
            {data.map((entry, index) => <Cell key={index} fill={entry.realizedPnl >= 0 ? '#16a34a' : '#dc2626'} />)}
          </Bar>
          <Bar dataKey="unrealizedPnl" name="P&L No Realizado" fill="#94a3b8" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AllocationChart({ positions }) {
  const data = Object.values(positions).filter((p) => p.quantity > 0.0001 && p.totalCost > 0)
    .map((p) => ({ name: p.ticker, value: Math.round(p.totalCost * 100) / 100 }));
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Distribución del Portfolio</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value"
            label={({ name, value }) => `${name} (${((value/total)*100).toFixed(1)}%)`} labelLine>
            {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => `$${fmt(v)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CumulativePnlChart({ tradeResults }) {
  const data = buildCumulativePnlSeries(tradeResults);
  if (data.length < 2) return null;
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">P&L Realizado Acumulado</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                <p className="font-medium">{label} — {d.ticker}</p>
                <p>Venta: <span className={d.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>${fmt(d.pnl)}</span></p>
                <p>Acumulado: <span className={d.cumulativePnl >= 0 ? 'text-green-600' : 'text-red-600'}>${fmt(d.cumulativePnl)}</span></p>
              </div>
            );
          }} />
          <Line type="monotone" dataKey="cumulativePnl" name="P&L Acumulado" stroke="#3b82f6"
            strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Charts({ positions, tradeResults }) {
  if (Object.keys(positions).length === 0) {
    return <div className="card p-10 text-center text-gray-400"><p>Registrá operaciones para ver los gráficos.</p></div>;
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PnlByTickerChart positions={positions} />
      <AllocationChart positions={positions} />
      <div className="lg:col-span-2"><CumulativePnlChart tradeResults={tradeResults} /></div>
    </div>
  );
}
