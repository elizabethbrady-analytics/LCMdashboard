// Stars — top performers: retention, sustained NCS, Star criteria inputs,
// and where providers who left the segment went.

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

const D = 'stars'
const m = (k) => byId[`${D}.${k}`]

export default function Stars({ scope, priorScope, filter }) {
  const segFilter = useMemo(() => ({ ...filter, segments: ['Stars'] }), [filter])
  const ncsSeries = useMemo(() => series('ncs', segFilter), [segFilter])
  const flows = useMemo(
    () =>
      migrationMatrix({ industries: filter.industries, products: filter.products, channels: filter.channels, months: filter.months })
        .filter((f) => f.from === 'Stars'),
    [filter],
  )
  const heroDelta = priorScope.ncs ? (scope.ncs - priorScope.ncs) / priorScope.ncs : null

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
          <TrendChart data={ncsSeries} color="#b57614" fmtKind="usd" height={280} />
        </MetricCard>
        <div className="hero-side">
          <Scorecard metric={m('retention')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('starrate')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('avgtrans')} scope={scope} priorScope={priorScope} />
        </div>
      </div>

      <section className="card">
        <div className="module-title">Executive / Funnel view</div>
        <div className="metric-grid">
          {['subs', 'ncslift', 'appsper', 'transper', 'firstch', 'repeatch', 'repeat', 'mql', 'hand', 'handopen', 'product'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <SegmentPopulationTrend
        metricId="stars.poptrend"
        segment="Stars"
        color="#b57614"
        filter={filter}
        scope={scope}
      />

      <div className="row-split">
        <section className="card">
          <div className="module-title">Star criteria inputs (first 90 days)</div>
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}>
            {['churn', 'crit.ncs', 'crit.apps', 'crit.trans'].map((k) => (
              <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
            ))}
          </div>
        </section>
        <MetricCard metricId={m('migration').id} className="card chart-card">
          <div className="module-title">Segment migration — where Stars went</div>
          <MigrationMatrix flows={flows} height={300} />
        </MetricCard>
      </div>

      <VocTiles dashId={D} scope={scope} priorScope={priorScope} />
      <JourneyOptimization dashId={D} scope={scope} priorScope={priorScope} filter={filter} segments={['Stars']} />
    </>
  )
}
