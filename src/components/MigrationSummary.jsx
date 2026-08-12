// The comprehension view for segment migration (client feedback 8/5–8/6):
// per origin segment, what % of its prior-period providers moved UP, STAYED,
// or moved DOWN — one 100% stacked bar per segment. Tableau-native
// (100% stacked bar). Complements the detailed highlight table.

import { SEGMENTS, SEGMENT_COLORS } from '../data/synthetic.js'
import { RANK } from '../data/scope.js'
import { applyFmt } from '../data/format'

const DIR_COLORS = { up: '#1e7a3c', stayed: '#cfc9b8', down: '#b3401e' }

export default function MigrationSummary({ flows }) {
  const froms = SEGMENTS.filter((s) => flows.some((f) => f.from === s) && s !== 'Newly Enrolled')

  const rows = froms.map((from) => {
    let up = 0
    let stayed = 0
    let down = 0
    for (const f of flows) {
      if (f.from !== from) continue
      if (f.to === from) stayed += f.providers
      else if (RANK[f.to] > RANK[from]) up += f.providers
      else down += f.providers
    }
    const total = up + stayed + down || 1
    return { from, up, stayed, down, total }
  })

  return (
    <div className="mig-summary">
      {rows.map((r) => (
        <div className="mig-row" key={r.from}>
          <div className="mig-label">
            <span className="nav-dot" style={{ background: SEGMENT_COLORS[r.from], display: 'inline-block', marginRight: 6 }} />
            {r.from}
          </div>
          <div className="mig-bar">
            {['up', 'stayed', 'down'].map((dir) => (
              <div
                key={dir}
                className="mig-seg"
                style={{ width: `${(r[dir] / r.total) * 100}%`, background: DIR_COLORS[dir] }}
                title={`${dir}: ${r[dir].toLocaleString()} providers (${applyFmt('pct', r[dir] / r.total)})`}
              />
            ))}
          </div>
          <div className="mig-pcts">
            <span className="mig-up">▲ {applyFmt('pct', r.up / r.total)}</span>
            <span className="mig-stay">{applyFmt('pct', r.stayed / r.total)} stayed</span>
            <span className="mig-down">▼ {applyFmt('pct', r.down / r.total)}</span>
          </div>
        </div>
      ))}
      <div className="matrix-note">
        Share of each segment’s prior-period providers that moved up, stayed, or moved down this period.
      </div>
    </div>
  )
}
