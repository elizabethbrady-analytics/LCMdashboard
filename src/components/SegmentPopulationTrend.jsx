// Segment population vs same period last year (client request 8/12):
// parallel curves = seasonality, widening gap = journey impact. Pairs with
// the up/down migration view directly below it on each segment dashboard.

import { useMemo } from 'react'
import { series, priorYearSeries } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from './MetricCard'
import TrendChart from './TrendChart'

export default function SegmentPopulationTrend({ metricId, segment, color, filter, scope }) {
  const segFilter = useMemo(() => ({ ...filter, segments: [segment] }), [filter, segment])
  const current = useMemo(() => series('providers', segFilter), [segFilter])
  const priorYear = useMemo(() => priorYearSeries('providers', segFilter), [segFilter])

  return (
    <MetricCard metricId={metricId} className="card chart-card">
      <div className="chart-head">
        <div>
          <div className="scorecard-name">Providers in {segment} — vs same period last year</div>
          <div className="scorecard-value">{applyFmt('num', scope.providers)}</div>
          <div className="scorecard-plain">
            Parallel lines suggest seasonality; a widening gap suggests journey impact. In production,
            counts step at the quarterly segment refresh — shown monthly here with synthetic data.
          </div>
        </div>
      </div>
      <TrendChart data={current} benchmark={priorYear} color={color} fmtKind="num" height={210} />
    </MetricCard>
  )
}
