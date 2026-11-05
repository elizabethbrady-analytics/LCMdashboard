// Overall Executive View — hero NCS trend, KPI grid, activation buckets,
// segment migration. Every block wraps in MetricCard so right-click
// methodology + feedback works on charts exactly like on tiles.

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { series, activationBuckets, migrationMatrix, MONTHS } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from '../components/MetricCard'
import Scorecard from '../components/Scorecard'
import TrendChart from '../components/TrendChart'
import MigrationMatrix from '../components/MigrationMatrix'
import MigrationSummary from '../components/MigrationSummary'
import BucketTable from '../components/BucketTable'

const D = 'executive-overview'
const m = (key) => byId[`${D}.${key}`]

const PRODUCT_COLORS = { PLCC: '#0e5b4a', PayLater: '#2f6bb0' }
const CHANNEL_COLORS = { 'Provider Center': '#2a7f9e', ISV: '#b57614', 'QR Code': '#8a5fb5' }

// 100% stacked bar of NCS share across a set of [name, ncs] parts
function MixBar({ parts, colors }) {
  const total = parts.reduce((sum, [, v]) => sum + v, 0) || 1
  return (
    <div className="mig-summary">
      <div className="mig-row">
        <div className="mig-label">NCS share</div>
        <div className="mig-bar">
          {parts.map(([name, v]) => (
            <div
              key={name}
              className="mig-seg"
              style={{ width: `${(v / total) * 100}%`, background: colors[name] }}
              title={`${name}: ${applyFmt('usd', v)} (${applyFmt('pct', v / total)})`}
            />
          ))}
        </div>
        <div className="mig-pcts">
          {parts.map(([name, v]) => (
            <span key={name} style={{ color: colors[name], fontWeight: 600 }}>
              {name} {applyFmt('pct', v / total)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductMixBar({ scope }) {
  return (
    <MixBar
      colors={PRODUCT_COLORS}
      parts={[['PLCC', scope.plccNcs], ['PayLater', scope.plNcs]]}
    />
  )
}

function ChannelMixBar({ scope }) {
  return (
    <MixBar
      colors={CHANNEL_COLORS}
      parts={[['Provider Center', scope.pcNcs], ['ISV', scope.isvNcs], ['QR Code', scope.qrNcs]]}
    />
  )
}

export default function ExecutiveOverview({ scope, priorScope, filter }) {
  const ncsSeries = useMemo(() => series('ncs', filter), [filter])
  // Benchmark: same months, prior year (client 8/5 — "benchmark trend line")
  const ncsBenchmark = useMemo(
    () =>
      (filter.months ?? MONTHS).map((month) => {
        const prior = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`
        if (!MONTHS.includes(prior)) return { month, value: null }
        return { month, value: series('ncs', { ...filter, months: [prior] })[0]?.value ?? null }
      }),
    [filter],
  )
  const buckets = useMemo(() => activationBuckets(filter, 'exec-act'), [filter])
  const flows = useMemo(
    () => migrationMatrix({ industries: filter.industries, products: filter.products, channels: filter.channels, months: filter.months }),
    [filter],
  )

  const heroDelta = priorScope.ncs ? (scope.ncs - priorScope.ncs) / priorScope.ncs : null

  // Goal line pinned just above the series peak, rounded to a clean figure,
  // so it reads as a target near the top of the chart under any filter.
  const ncsGoal = useMemo(() => {
    const peak = Math.max(...ncsSeries.map((d) => d.value), 1)
    const step = 5 * Math.pow(10, Math.floor(Math.log10(peak)) - 1)
    return Math.ceil((peak * 1.02) / step) * step
  }, [ncsSeries])

  return (
    <>
      <div className="row-hero">
        <MetricCard metricId={m('ncs').id} className="card chart-card hero-card">
          <div className="chart-head">
            <div>
              <div className="scorecard-name">{m('ncs').name}</div>
              <div className="scorecard-value">{applyFmt('usd', scope.ncs)}</div>
              {heroDelta != null && (
                <div className={`scorecard-delta ${heroDelta >= 0 ? 'up' : 'down'}`}>
                  {heroDelta >= 0 ? '▲' : '▼'} {Math.abs(heroDelta * 100).toFixed(1)}% vs prior period
                </div>
              )}
            </div>
          </div>
          <TrendChart data={ncsSeries} benchmark={ncsBenchmark} fmtKind="usd" height={300} goal={ncsGoal} goalLabel={`Goal ${applyFmt('usdM', ncsGoal)}`} />
        </MetricCard>
        <div className="hero-side">
          <Scorecard metric={m('ncslift')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('goals')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('entered')} scope={scope} priorScope={priorScope} />
        </div>
      </div>

      <section className="card">
        <div className="module-title">Journey health</div>
        <div className="metric-grid">
          {['activated', 'actrate', 'fullyact', 'retention', 'reactivation', 'activepct', 'appactivepct', 'appsper', 'transper', 'repeat', 'ltv', 'firstpurchase'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="module-title">Demand & email</div>
        <div className="metric-grid">
          {['mql', 'hand', 'or', 'ctor', 'unsub', 'unsubclick'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <MetricCard metricId={m('productmix').id} className="card chart-card">
        <div className="module-title">Total product mix — NCS share by product</div>
        <ProductMixBar scope={scope} />
      </MetricCard>

      <MetricCard metricId={m('channelmix').id} className="card chart-card">
        <div className="module-title">Total channel mix — NCS share by channel</div>
        <ChannelMixBar scope={scope} />
      </MetricCard>

      <div className="row-split">
        <MetricCard metricId={m('actrate').id} className="card chart-card">
          <div className="module-title">Activation rate by time bucket</div>
          <BucketTable rows={buckets} />
        </MetricCard>
        <MetricCard metricId={m('migration').id} className="card chart-card">
          <div className="module-title">Segment migration — % up / stayed / down</div>
          <MigrationSummary flows={flows} />
          <div className="module-title" style={{ marginTop: 18 }}>Detail — prior period → current (count and % of origin)</div>
          <MigrationMatrix flows={flows} height={260} />
        </MetricCard>
      </div>
    </>
  )
}
