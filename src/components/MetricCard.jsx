// Interaction wrapper for every reviewable metric: right-click (or the ⓘ
// button) opens the methodology + feedback panel. Shows a status chip once
// the reviewer has voted.

import { usePanel } from '../state/PanelContext'
import { useFeedback } from '../state/FeedbackContext'

const VOTE_GLYPH = { approve: '✓', needs_change: '△', question: '?' }

export default function MetricCard({ metricId, className = '', style, children }) {
  const { open } = usePanel()
  const { metrics } = useFeedback()
  const vote = metrics[metricId]?.vote

  return (
    <div
      className={`metric-card ${className}`}
      style={style}
      data-metric-id={metricId}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        open(metricId)
      }}
    >
      {children}
      <button
        type="button"
        className="info-btn"
        aria-label="Methodology and feedback"
        title="Methodology & feedback"
        onClick={(e) => {
          e.stopPropagation()
          open(metricId)
        }}
      >
        ⓘ
      </button>
      {vote && (
        <span className={`vote-chip vote-${vote}`} aria-label={`Feedback: ${vote}`}>
          {VOTE_GLYPH[vote]}
        </span>
      )}
    </div>
  )
}
