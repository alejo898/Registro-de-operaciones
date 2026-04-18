import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';

function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

function Card({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={20} /></div>
      </div>
    </div>
  );
}

export default function SummaryCards({ positions, tradeResults }) {
  const posArr = Object.values(positions);
  const totalInvested      = posArr.reduce((s, p) => s + (p.quantity > 0 ? p.totalCost : 0), 0);
  const totalRealizedPnl   = posArr.reduce((s, p) => s + p.realizedPnl, 0);
  const totalCurrentValue  = posArr.reduce((s, p) => s + (p.currentValue ?? 0), 0);
  const totalUnrealizedPnl = posArr.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0);
  const hasAnyPrice        = posArr.some((p) => p.currentPrice !== null);
  const sells    = tradeResults.filter((t) => t.type === 'SELL');
  const winRate  = sells.length > 0
    ? ((sells.filter((t) => t.pnl > 0).length / sells.length) * 100).toFixed(1) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card icon={DollarSign} label="Capital invertido" value={`$${fmt(totalInvested)}`}
        sub="en posiciones abiertas" color="blue" />
      <Card icon={totalRealizedPnl >= 0 ? TrendingUp : TrendingDown} label="P&L Realizado"
        value={`${totalRealizedPnl >= 0 ? '+' : ''}$${fmt(totalRealizedPnl)}`}
        sub={`en ${sells.length} venta${sells.length !== 1 ? 's' : ''}`}
        color={totalRealizedPnl >= 0 ? 'green' : 'red'} />
      <Card icon={BarChart2} label="P&L No Realizado"
        value={hasAnyPrice ? `${totalUnrealizedPnl >= 0 ? '+' : ''}$${fmt(totalUnrealizedPnl)}` : '—'}
        sub={hasAnyPrice ? `Valor actual: $${fmt(totalCurrentValue)}` : 'Cargá precios actuales'}
        color={totalUnrealizedPnl >= 0 ? 'green' : 'red'} />
      <Card icon={TrendingUp} label="Win Rate"
        value={winRate !== null ? `${winRate}%` : '—'}
        sub={sells.length > 0 ? `${sells.filter((t) => t.pnl > 0).length}/${sells.length} ganadoras` : 'Sin ventas aún'}
        color="purple" />
    </div>
  );
}
