export function fmt(n, decimals = 2) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function pnlClass(val) {
  if (val == null) return 'text-gray-400';
  return val >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
}

export function signo(val) { return val >= 0 ? '+' : ''; }

export function fmtPnl(val, decimals = 2) {
  if (val == null) return '—';
  return `${signo(val)}$${fmt(val, decimals)}`;
}

export function fmtPct(val) {
  if (val == null) return '—';
  return `${signo(val)}${fmt(val)}%`;
}

export function exportarCSV(datos, nombreArchivo) {
  if (!datos.length) return;
  const headers = Object.keys(datos[0]);
  const filas = datos.map(row =>
    headers.map(h => {
      const v = row[h] ?? '';
      return typeof v === 'string' && (v.includes(',') || v.includes('"'))
        ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')
  );
  const csv  = [headers.join(','), ...filas].join('\n');
  const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: nombreArchivo });
  link.click();
  URL.revokeObjectURL(url);
}
