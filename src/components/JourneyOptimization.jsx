// Shared Journey Optimization module — identical KPI set on every journey
// dashboard: OR/CTOR/unsub/conversion tiles, top & bottom 5 emails, top URLs.

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { emailPerformance, topUrls } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from './MetricCard'
import Scorecard from './Scorecard'

function EmailTable({ rows }) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Email</th>
          <th className="num">Sent</th>
          <th className="num">OR %</th>
          <th className="num">CTOR %</th>
          <th className="num">Conversions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name}>
            <td>{r.name}</td>
            <td className="num">{applyFmt('num', r.sent)}</td>
            <td className="num">{applyFmt('pct', r.openRate)}</td>
            <td className="num">{applyFmt('pct', r.ctor)}</td>
            <td className="num">{applyFmt('num', r.conversions)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function JourneyOptimization({ dashId, scope, priorScope, filter, segments }) {
  const emails = useMemo(
    () => emailPerformance({ ...filter, segments }, `emails-${dashId}`),
    [filter, segments, dashId],
  )
  const urls = useMemo(
    () => topUrls({ ...filter, segments }, `urls-${dashId}`),
    [filter, segments, dashId],
  )
  const m = (k) => byId[`${dashId}.jo.${k}`]

  return (
    <section className="card">
      <div className="module-title">Journey Optimization</div>
      <div className="metric-grid" style={{ marginBottom: 16 }}>
        {['delivery', 'or', 'ctor', 'unsub', 'conv'].map((k) => (
          <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
        ))}
      </div>
      <div className="row-split">
        <MetricCard metricId={m('top5').id} className="chart-card sub-card">
          <div className="module-title">Top 5 performing emails</div>
          <EmailTable rows={emails.slice(0, 5)} />
        </MetricCard>
        <MetricCard metricId={m('bottom5').id} className="chart-card sub-card">
          <div className="module-title">Top 5 underperforming emails</div>
          <EmailTable rows={emails.slice(-5).reverse()} />
        </MetricCard>
      </div>
      <MetricCard metricId={m('urls').id} className="chart-card sub-card" style={{ marginTop: 14 }}>
        <div className="module-title">Top 5 URLs / landing pages</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Landing page</th>
              <th className="num">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((u) => (
              <tr key={u.url}>
                <td>{u.url}</td>
                <td className="num">{applyFmt('num', u.clicks)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </MetricCard>
    </section>
  )
}
