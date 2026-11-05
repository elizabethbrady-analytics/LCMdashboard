// Engagement Exposures — does journey engagement convert into upward
// migration and transactions. Requires Marketing Cloud journey data.

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { series, migrationMatrix } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from '../components/MetricCard'
import Scorecard from '../components/Scorecard'
import TrendChart from '../components/TrendChart'
import MigrationMatrix from '../components/MigrationMatrix'
import SegmentPopulationTrend from '../components/SegmentPopulationTrend'
import JourneyOptimization from '../components/JourneyOptimization'
import VocTiles from '../components/VocTiles'

const D = 'engagement-exposures'
const m = (k) => byId[`${D}.${k}`]

export default function EngagementExposures({ scope, priorScope, filter }) {
  const segFilter = useMemo(() => ({ ...filter, segments: ['Engagement Exposures'] }), [filter])
  const transSeries = useMemo(() => series('transactions', segFilter), [segFilter])
  const flows = useMemo(
    () =>
      migrationMatrix({ industries: filter.industries, products: filter.products, channels: filter.channels, months: filter.months })
        .filter((f) => f.from === 'Engagement Exposures'),
    [filter],
  )
  const delta = priorScope.transactions
    ? (scope.transactions - priorScope.transactions) / priorScope.transactions
    : null

  return (
    <>
      <div className="row-hero">
        <MetricCard metricId={m('trans').id} className="card chart-card hero-card">
          <div className="chart-head">
            <div>
              <div className="scorecard-name">{m('trans').name}</div>
              <div className="scorecard-value">{applyFmt('num', scope.transactions)}</div>
              {delta != null && (
                <div className={`scorecard-delta ${delta >= 0 ? 'up' : 'down'}`}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta * 100).toFixed(1)}% vs prior period
                </div>
              )}
            </div>
          </div>
          <TrendChart data={transSeries} color="#c74e33" fmtKind="num" height={260} />
        </MetricCard>
        <div className="hero-side">
          <Scorecard metric={m('upward')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('downward')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('emaileng')} scope={scope} priorScope={priorScope} />
        </div>
      </div>

      <section className="card">
        <div className="module-title">Executive / Funnel view</div>
        <div className="metric-grid">
          {['subs', 'ncs', 'ncslift', 'appsper', 'transper', 'repeat', 'mql', 'hand', 'product'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <SegmentPopulationTrend
        metricId="engagement-exposures.poptrend"
        segment="Engagement Exposures"
        color="#c74e33"
        filter={filter}
        scope={scope}
      />

      <div className="row-split">
        <section className="card">
          <div className="module-title">Engagement → behavior</div>
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}>
            <Scorecard metric={m('cta')} scope={scope} priorScope={priorScope} />
            <Scorecard metric={m('lag')} scope={scope} priorScope={priorScope} />
            <Scorecard metric={m('migration')} scope={scope} priorScope={priorScope} />
          </div>
        </section>
        <MetricCard metricId={m('migration').id} className="card chart-card">
          <div className="module-title">Segment migration — up or down from here</div>
          <MigrationMatrix flows={flows} height={300} />
        </MetricCard>
      </div>

      <VocTiles dashId={D} scope={scope} priorScope={priorScope} />
      <JourneyOptimization dashId={D} scope={scope} priorScope={priorScope} filter={filter} segments={['Engagement Exposures']} />
    </>
  )
}
