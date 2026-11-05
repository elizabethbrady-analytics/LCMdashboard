export const fmt = {
  num: (v) => (v == null || Number.isNaN(v) ? '—' : Math.round(v).toLocaleString('en-US')),
  num1: (v) => (v == null || Number.isNaN(v) ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })),
  usd: (v) => (v == null || Number.isNaN(v) ? '—' : '$' + Math.round(v).toLocaleString('en-US')),
  usdM: (v) => (v == null || Number.isNaN(v) ? '—' : '$' + (v / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'M'),
  pct: (v) => (v == null || Number.isNaN(v) ? '—' : (v * 100).toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%'),
  pct2: (v) => (v == null || Number.isNaN(v) ? '—' : (v * 100).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + '%'),
  pct0: (v) => (v == null || Number.isNaN(v) ? '—' : Math.round(v * 100) + '%'),
  days: (v) => (v == null || Number.isNaN(v) ? '—' : Math.round(v) + ' days'),
  score: (v) => (v == null || Number.isNaN(v) ? '—' : String(v)),
  auto: (v) => (Math.abs(v) >= 1e6 ? fmt.usdM(v) : fmt.num(v)),
}

export function applyFmt(kind, v) {
  return (fmt[kind] ?? fmt.num)(v)
}
