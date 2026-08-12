// Consistent — sustained usage: expansion, offer frequency trend, and the
// upward path to Stars.

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { agg, migrationMatrix, MONTHS } from '../data/synthetic.js'
import MetricCard from '../components/MetricCard'
import Scorecard from '../components/Scorecard'
import TrendChart from '../components/TrendChart'
import MigrationMatrix from '../components/MigrationMatrix'
import SegmentPopulationTrend from '../components/SegmentPopulationTrend'
import JourneyOptimization from '../components/JourneyOptimization'
import VocTiles from '../components/VocTiles'

const D = 'consistent'
const m = (k) => byId[`${D}.${k}`]

export default function Consistent({ scope, priorScope, filter }) {
  // Offer frequency: avg applications per active account, per month
  const offerSeries = useMemo(() => {
    const months = filter.months ?? MONTHS
    return months.map((month) => {
      const a = agg({ segments: ['Consistent'], industries: filter.industries, products: filter.products, months: [month] })
      return { month, value: a.active ? Math.round((a.apps / a.active) * 100) / 100 : 0 }
    })
  }, [filter])

  const flows = useMemo(
    () =>
      migrationMatrix({ industries: filter.industries, products: filter.products, months: filter.months })
        .filter((f) => f.from === 'Consistent'),
    [filter],
  )

  return (
    <>
      <div className="row-hero">
        <MetricCard metricId={m('offerfreq').id} className="card chart-card hero-card">
          <div className="chart-head">
            <div>
              <div className="scorecard-name">Offer frequency trend — avg applications per active account</div>
              <div className="scorecard-value">{scope.appsPerActive.toFixed(2)}</div>
              <div className="scorecard-plain">{m('offerfreq').plain}</div>
            </div>
          </div>
          <TrendChart data={offerSeries} color="#2f6bb0" fmtKind="num1" height={260} />
        </MetricCard>
        <div className="hero-side">
          <Scorecard metric={m('retention')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('upward')} scope={scope} priorScope={priorScope} />
          <Scorecard metric={m('avgtrans')} scope={scope} priorScope={priorScope} />
        </div>
      </div>

      <section className="card">
        <div className="module-title">Executive / Funnel view</div>
        <div className="metric-grid">
          {['subs', 'ncs', 'ncslift', 'appsper', 'repeat', 'mql', 'hand', 'product'].map((k) => (
            <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <SegmentPopulationTrend
        metricId="consistent.poptrend"
        segment="Consistent"
        color="#2f6bb0"
        filter={filter}
        scope={scope}
      />

      <div className="row-split">
        <section className="card">
          <div className="module-title">Segment KPIs</div>
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}>
            <Scorecard metric={m('activemonths')} scope={scope} priorScope={priorScope} />
            <Scorecard metric={m('migration')} scope={scope} priorScope={priorScope} />
          </div>
        </section>
        <MetricCard metricId={m('upward').id} className="card chart-card">
          <div className="module-title">Segment migration — the path to Stars</div>
          <MigrationMatrix flows={flows} height={300} />
        </MetricCard>
      </div>

      <VocTiles dashId={D} scope={scope} priorScope={priorScope} />
      <JourneyOptimization dashId={D} scope={scope} priorScope={priorScope} filter={filter} segments={['Consistent']} />
    </>
  )
}
