// Segment migration rendered Tableau-native:
// - multiple origin segments → highlight table (from × to, color-intensity cells)
// - single origin segment → destination bars
// Replaces the earlier sankey, which Tableau only supports via a 2024.2+
// viz extension or densification workarounds.

import { SEGMENTS, SEGMENT_COLORS } from '../data/synthetic.js'
import { applyFmt } from '../data/format'

function cellBg(share) {
  // Sequential single-hue ramp: paper → brand green, intensity = share of row
  const alpha = Math.min(0.85, share * 1.4)
  return `rgba(14, 91, 74, ${alpha})`
}

function Dot({ seg }) {
  return <span className="nav-dot" style={{ background: SEGMENT_COLORS[seg], display: 'inline-block', marginRight: 6 }} />
}

export default function MigrationMatrix({ flows, height }) {
  const froms = [...new Set(flows.map((f) => f.from))]

  if (froms.length === 1) {
    const from = froms[0]
    const rows = [...flows].sort((a, b) => b.providers - a.providers)
    const max = Math.max(1, ...rows.map((r) => r.providers))
    return (
      <div className="funnel" style={{ minHeight: height }}>
        {rows.map((r) => (
          <div className="funnel-stage" key={r.to}>
            <div className="funnel-meta">
              <span className="funnel-label">
                <Dot seg={r.to} />
                {r.to === from ? `Stayed in ${from}` : `→ ${r.to}`}
              </span>
              <span className="funnel-value">{applyFmt('num', r.providers)}</span>
              <span className="funnel-conv">{applyFmt('pct', r.providers / rows.reduce((s, x) => s + x.providers, 0))} of segment</span>
            </div>
            <div className="funnel-track">
              <div
                className="funnel-bar"
                style={{ width: `${Math.max(2, (r.providers / max) * 100)}%`, background: SEGMENT_COLORS[r.to] }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const cell = (from, to) => flows.find((f) => f.from === from && f.to === to)?.providers ?? 0
  const rowTotals = Object.fromEntries(
    froms.map((f) => [f, flows.filter((x) => x.from === f).reduce((s, x) => s + x.providers, 0)]),
  )

  return (
    <div style={{ overflowX: 'auto', minHeight: height }}>
      <table className="data-table matrix-table">
        <thead>
          <tr>
            <th>Prior period ↓ / Current →</th>
            {SEGMENTS.map((s) => (
              <th className="num" key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SEGMENTS.filter((s) => froms.includes(s)).map((from) => (
            <tr key={from}>
              <td><Dot seg={from} />{from}</td>
              {SEGMENTS.map((to) => {
                const v = cell(from, to)
                const share = rowTotals[from] ? v / rowTotals[from] : 0
                return (
                  <td className="num matrix-cell" key={to} style={{ background: v ? cellBg(share) : 'transparent', color: share > 0.45 ? '#fff' : undefined }}>
                    {v ? `${applyFmt('num', v)} (${applyFmt('pct', share)})` : '—'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="matrix-note">Cell shading = share of the origin segment’s providers. Diagonal = stayed.</div>
    </div>
  )
}
