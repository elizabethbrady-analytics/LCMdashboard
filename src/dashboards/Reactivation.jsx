// Needs Attention and Dormant — split into two dashboards per client
// feedback 8/5–8/6. Shared reactivation layout; each segment adds its own
// KPIs (NA: retention / churn / migration-up; Dormant: reactivation trend
// vs prior year, emails-to-reactivate, sunsetted contacts).

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { series, migrationMatrix, MONTHS } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from '../components/MetricCard'
import Scorecard from '../components/Scorecard'
import TrendChart from '../components/TrendChart'
import MigrationMatrix from '../components/MigrationMatrix'
import SegmentPopulationTrend from '../components/SegmentPopulationTrend'
import JourneyOptimization from '../components/JourneyOptimization'

function RecoveryComparison({ scope, color }) {
  const pct = scope.baselineNcs ? scope.ncs / scope.baselineNcs : 0
  return (
    <div className="funnel" style={{ marginTop: 4 }}>
      <div className="funnel-stage">
        <div className="funnel-meta">
          <span className="funnel-label">Pre-lapse baseline NCS</span>
          <span className="funnel-value">{applyFmt('usd', scope.baselineNcs)}</span>
        </div>
        <div className="funnel-track">
          <div className="funnel-bar" style={{ width: '100%', background: 'var(--hairline-strong)' }} />
        </div>
      </div>
      <div className="funnel-stage">
        <div className="funnel-meta">
          <span className="funnel-label">Current-period NCS</span>
          <span className="funnel-value">{applyFmt('usd', scope.ncs)}</span>
          <span className="funnel-conv">{applyFmt('pct', pct)} of what these providers used to produce</span>
        </div>
        <div className="funnel-track">
          <div className="funnel-bar" style={{ width: `${Math.max(2, pct * 100)}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}

function ReactWindowsTable({ scope, metricId }) {
  // Window shares scale off the 90-day reactivation level
  const w90 = scope.inactive ? scope.reactivated / scope.inactive : 0
  const rows = [
    ['Within 30 days', w90 * 0.45],
    ['Within 60 days', w90 * 0.75],
    ['Within 90 days', w90],
  ]
  return (
    <MetricCard metricId={metricId} className="card chart-card">
      <div className="module-title">Active (apps and/or trans) by window</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Window</th>
            <th className="num">% of segment active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, v]) => (
            <tr key={label}>
              <td>{label}</td>
              <td className="num">{applyFmt('pct', v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </MetricCard>
  )
}

function ReactivationDashboard({ dashId, segment, segKpiKeys, scope, priorScope, filter, heroTrend }) {
  const m = (k) => byId[`${dashId}.${k}`]
  const color = segment === 'Dormant' ? 'var(--seg-dormant)' : 'var(--seg-needs-attention)'

  const flows = useMemo(
    () =>
      migrationMatrix({ industries: filter.industries, products: filter.products, channels: filter.channels, months: filter.months })
        .filter((f) => f.from === segment),
    [filter, segment],
  )

  const segFilter = useMemo(() => ({ ...filter, segments: [segment] }), [filter, segment])
  const reactSeries = useMemo(() => (heroTrend ? series('reactivated', segFilter) : null), [heroTrend, segFilter])
  const benchmark = useMemo(() => {
    if (!heroTrend) return null
    return (filter.months ?? MONTHS).map((month) => {
      const prior = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`
      if (!MONTHS.includes(prior)) return { month, value: null }
      const v = series('reactivated', { ...segFilter, months: [prior] })[0]?.value ?? null
      return { month, value: v }
    })
  }, [heroTrend, segFilter, filter.months])

  return (
    <>
      <div className="row-hero">
        <MetricCard metricId={m(heroTrend ? 'reactrate' : 'recovery').id} className="card chart-card hero-card">
          {heroTrend ? (
            <>
              <div className="chart-head">
                <div>
                  <div className="scorecard-name">Reactivated providers — vs same period prior year</div>
                  <div className="scorecard-value">{applyFmt('num', scope.reactivated)}</div>
                  <div className="scorecard-plain">Benchmark added per client feedback 8/6.</div>
                </div>
              </div>
              <TrendChart data={reactSeries} benchmark={benchmark} color="#647a1f" fmtKind="num" height={250} />
            </>
          ) : (
            <>
              <div className="chart-head">
                <div>
                  <div className="scorecard-name">{m('recovery').name}</div>
                  <div className="scorecard-value">{applyFmt('usd', scope.ncs)}</div>
                  <div className="scorecard-plain">{m('recovery').plain}</div>
                </div>
              </div>
              <RecoveryComparison scope={scope} color={color} />
            </>
          )}
        </MetricCard>
        <div className="hero-side">
          <Scorecard metric={m('reactrate')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('inactivity')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('avgtrans')} scope={scope} priorScope={priorScope} />
        </div>
      </div>

      {heroTrend && (
        <MetricCard metricId={m('recovery').id} className="card chart-card">
          <div className="module-title">{m('recovery').name}</div>
          <RecoveryComparison scope={scope} color={color} />
        </MetricCard>
      )}

      <section className="card">
        <div className="module-title">Executive View</div>
        <div className="metric-grid">
          {['subs', 'ncs', 'ncslift', 'ncsperactive', 'repeattrans', 'appsper', 'transperactive', 'repeat', 'mql', 'hand', 'product'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <SegmentPopulationTrend
        metricId={`${dashId}.poptrend`}
        segment={segment}
        color={segment === 'Dormant' ? '#647a1f' : '#8a5fb5'}
        filter={filter}
        scope={scope}
      />

      <div className="row-split">
        <section className="card">
          <div className="module-title">Segment KPIs</div>
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}>
            {[...segKpiKeys, 'suspended', 'postreact', 'migration'].map((k) => (
              <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
            ))}
          </div>
        </section>
        <div>
          <ReactWindowsTable scope={scope} metricId={m('reactwindows').id} />
          <MetricCard metricId={m('migration').id} className="card chart-card" style={{ marginTop: 12 }}>
            <div className="module-title">Segment migration — recovery paths</div>
            <MigrationMatrix flows={flows} height={220} />
          </MetricCard>
        </div>
      </div>

      <JourneyOptimization dashId={dashId} scope={scope} priorScope={priorScope} filter={filter} segments={[segment]} />
    </>
  )
}

export function NeedsAttention(props) {
  return (
    <ReactivationDashboard
      {...props}
      dashId="needs-attention"
      segment="Needs Attention"
      segKpiKeys={['retention', 'churn', 'migup']}
      heroTrend={false}
    />
  )
}

export function Dormant(props) {
  return (
    <ReactivationDashboard
      {...props}
      dashId="dormant"
      segment="Dormant"
      segKpiKeys={['migup', 'emailstoreact', 'sunsetted']}
      heroTrend
    />
  )
}
