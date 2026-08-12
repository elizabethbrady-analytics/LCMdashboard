// Dashboard-composition feedback — the dimension that IS open for review:
// KPI names are locked to the client docs, but which views merit their own
// dashboard is the client's call.

import { useEffect, useState } from 'react'
import { useFeedback } from '../state/FeedbackContext'

const OPTIONS = [
  'Keep as its own dashboard',
  'Combine with another dashboard',
  'Split into more than one dashboard',
  'Not sure yet',
]

export default function CompositionCard({ dashboard }) {
  const { dashboards, setDashboardFeedback } = useFeedback()
  const existing = dashboards[dashboard.id]
  const [comment, setComment] = useState('')

  useEffect(() => setComment(existing?.comment ?? ''), [dashboard.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="card comp-card">
      <div className="module-title">Dashboard construction — your call</div>
      <p className="comp-question">
        Metric names and definitions follow the program docs. What can change is how they're
        grouped: should “{dashboard.title}” stay a dashboard of its own?
      </p>
      <div className="comp-options">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`vote-btn ${existing?.verdict === opt ? 'selected comp-selected' : ''}`}
            onClick={() => setDashboardFeedback(dashboard.id, { verdict: opt })}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="comp-comment">
        <input
          className="reviewer-input"
          placeholder="Why? e.g. combine with Stars, split deep-dive into its own view…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="button" className="save-btn" onClick={() => setDashboardFeedback(dashboard.id, { comment })}>
          Save
        </button>
      </div>
      {existing?.ts && <div className="panel-saved">Saved {new Date(existing.ts).toLocaleString()}</div>}
    </section>
  )
}
