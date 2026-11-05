// Methodology + feedback side panel. Opens via right-click or ⓘ on any
// metric. Concreteness principle: the equation is shown twice — once in
// words, once with the live filtered values substituted in — so reviewers
// see the actual math behind the number on screen, then vote on it.

import { useEffect, useState } from 'react'
import { byId } from '../data/registry'
import { applyFmt } from '../data/format'
import { usePanel } from '../state/PanelContext'
import { useFeedback, VOTES } from '../state/FeedbackContext'

function substituted(eq, scope) {
  let text = eq.text
  for (const [label, key, kind] of eq.parts) {
    const val = applyFmt(kind === 'pct' ? 'pct' : kind === 'usd' ? 'usd' : kind === 'days' ? 'days' : kind === 'num1' ? 'num1' : kind === 'score' ? 'score' : 'num', scope[key])
    const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    if (re.test(text)) text = text.replace(re, val)
  }
  return text
}

export default function MetricPanel({ scope }) {
  const { metricId, close } = usePanel()
  const { metrics, setMetricFeedback, reviewer, setReviewer } = useFeedback()
  const metric = metricId ? byId[metricId] : null
  const existing = metricId ? metrics[metricId] : null
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    setComment(existing?.comment ?? '')
    setName(reviewer)
  }, [metricId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  if (!metric || !scope) return null

  const value = metric.eq.calc(scope)
  const sub = substituted(metric.eq, scope)

  const saveComment = () => {
    if (name && name !== reviewer) setReviewer(name)
    setMetricFeedback(metric.id, { comment })
  }

  return (
    <>
      <div className="panel-scrim" onClick={close} />
      <aside className="panel" role="dialog" aria-label={`Methodology: ${metric.name}`}>
        <div className="panel-head">
          <div>
            <div className="panel-module">{metric.module}</div>
            <h2 className="panel-title">{metric.name}</h2>
          </div>
          <button type="button" className="panel-close" onClick={close} aria-label="Close">
            ×
          </button>
        </div>

        {metric.origin && (
          <span className="origin-chip">
            From your {metric.origin.date} feedback — {metric.origin.by}
          </span>
        )}
        <p className="panel-plain">{metric.plain}</p>

        <div className="panel-section">
          <div className="panel-label">How it’s calculated — with the numbers on screen</div>
          <div className="equation">
            <div className="eq-line eq-words">{metric.name} = {metric.eq.text}</div>
            {sub !== metric.eq.text && <div className="eq-line eq-sub">= {sub}</div>}
            {metric.split ? (
              metric.split.map(({ label, key }) => (
                <div className="eq-line eq-result" key={key}>{label} = {applyFmt(metric.eq.fmtKind, scope[key])}</div>
              ))
            ) : (
              <div className="eq-line eq-result">= {applyFmt(metric.eq.fmtKind, value)}</div>
            )}
          </div>
          {metric.modeled && (
            <div className="modeled-note">
              Illustrative model — the number is a synthetic placeholder; final methodology TBD with analytics.
            </div>
          )}
          <div className="operands">
            {metric.eq.parts.map(([label, key, kind]) => (
              <span className="operand" key={key + label}>
                <b>{label}</b>{' '}
                {applyFmt(kind === 'pct' ? 'pct' : kind === 'usd' ? 'usd' : kind === 'days' ? 'days' : kind === 'num1' ? 'num1' : kind === 'score' ? 'score' : 'num', scope[key])}
              </span>
            ))}
          </div>
        </div>

        <div className="panel-section">
          <div className="panel-label">Definition</div>
          <p>{metric.definition}</p>
          <div className="panel-label" style={{ marginTop: 10 }}>Measured as</div>
          <p>{metric.measure}</p>
        </div>

        <div className="panel-section">
          <div className="panel-label">Where the number comes from</div>
          <p>{metric.source.plain}</p>
          <p className="panel-system">{metric.source.system}</p>
        </div>

        <div className="panel-section panel-feedback">
          <div className="panel-label">Your feedback on this metric</div>
          <div className="vote-row">
            {VOTES.map((v) => (
              <button
                key={v.key}
                type="button"
                className={`vote-btn vote-${v.key} ${existing?.vote === v.key ? 'selected' : ''}`}
                onClick={() => setMetricFeedback(metric.id, { vote: v.key })}
              >
                {v.label}
              </button>
            ))}
          </div>
          <input
            className="reviewer-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="comment-input"
            placeholder="Comments — definition, equation, source, or how it should be cut…"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="button" className="save-btn" onClick={saveComment}>
            Save comment
          </button>
          {existing?.ts && (
            <div className="panel-saved">Saved {new Date(existing.ts).toLocaleString()}</div>
          )}
        </div>
      </aside>
    </>
  )
}
