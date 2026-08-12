import { applyFmt } from '../data/format'

/** Activation by time-bucket table (30/60/90/120/180/181+). */
export default function BucketTable({ rows }) {
  const total = rows.reduce((s, r) => s + r.providers, 0)
  let cum = 0
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Days to first application</th>
          <th className="num">Providers</th>
          <th className="num">Share</th>
          <th className="num">Cumulative</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          cum += r.providers
          return (
            <tr key={r.bucket}>
              <td>{r.bucket}</td>
              <td className="num">{applyFmt('num', r.providers)}</td>
              <td className="num">{applyFmt('pct', total ? r.providers / total : 0)}</td>
              <td className="num">{applyFmt('pct', total ? cum / total : 0)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
