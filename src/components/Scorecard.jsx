import MetricCard from './MetricCard'
import { applyFmt } from '../data/format'

/**
 * Registry-driven value tile. `metric` is a registry entry; `scope` and
 * `priorScope` are operand bundles — the same calc() feeds the tile and the
 * worked example in the methodology panel.
 */
function SplitScorecard({ metric, scope, priorScope, compact }) {
  return (
    <MetricCard metricId={metric.id} className={`scorecard scorecard-split${compact ? ' compact' : ''}`}>
      <div className="scorecard-name">{metric.name}</div>
      <div className="split-tiles">
        {metric.split.map(({ label, key }) => {
          const value = scope[key]
          const prior = priorScope ? priorScope[key] : null
          const showDelta = prior != null && Number.isFinite(prior) && prior !== 0
          const delta = showDelta ? (value - prior) / Math.abs(prior) : null
          return (
            <div className="split-tile" key={key}>
              <div className="scorecard-value">{applyFmt(metric.eq.fmtKind, value)}</div>
              {showDelta && (
                <div className={`scorecard-delta ${delta >= 0 ? 'up' : 'down'}`}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta * 100).toFixed(1)}%{compact ? '' : ' vs prior period'}
                </div>
              )}
              <div className="split-label">{label}</div>
            </div>
          )
        })}
      </div>
    </MetricCard>
  )
}

export default function Scorecard({ metric, scope, priorScope, compact = false }) {
  if (metric.split) return <SplitScorecard metric={metric} scope={scope} priorScope={priorScope} compact={compact} />
  const value = metric.eq.calc(scope)
  const prior = priorScope ? metric.eq.calc(priorScope) : null
  const showDelta =
    prior != null && Number.isFinite(prior) && prior !== 0 && metric.eq.fmtKind !== 'score'
  const delta = showDelta ? (value - prior) / Math.abs(prior) : null

  return (
    <MetricCard metricId={metric.id} className={`scorecard${compact ? ' compact' : ''}`}>
      <div className="scorecard-name">{metric.name}</div>
      <div className="scorecard-value">{applyFmt(metric.eq.fmtKind, value)}</div>
      {showDelta && (
        <div className={`scorecard-delta ${delta >= 0 ? 'up' : 'down'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta * 100).toFixed(1)}%{compact ? '' : ' vs prior period'}
        </div>
      )}
      {!compact && <div className="scorecard-plain">{metric.plain}</div>}
    </MetricCard>
  )
}
