// Running catalog of everything the reviewer has voted on or commented,
// with Export .md (the sign-off matrix) and a mailto shortcut.

import { useState } from 'react'
import { byId } from '../data/registry'
import { DASHBOARDS } from '../dashboards/meta'
import { useFeedback, VOTES } from '../state/FeedbackContext'
import { downloadFeedback } from '../data/exportMd'

const voteLabel = (key) => VOTES.find((v) => v.key === key)?.label ?? '—'

export default function FeedbackDrawer() {
  const [open, setOpen] = useState(false)
  const fb = useFeedback()
  const entries = Object.entries(fb.metrics).filter(([, f]) => f.vote || f.comment)
  const compEntries = Object.entries(fb.dashboards)
  const count = entries.length + compEntries.length

  const mailto = () => {
    const subject = encodeURIComponent('LCM Analytics — metric sign-off feedback')
    const body = encodeURIComponent(
      `Feedback from ${fb.reviewer || 'reviewer'}: ${entries.length} metric votes/comments, ` +
      `${compEntries.length} dashboard composition notes.\n\n` +
      'The exported feedback .md file is attached.',
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <>
      <button type="button" className="drawer-fab" onClick={() => setOpen(true)}>
        Feedback{count > 0 && <span className="fab-count">{count}</span>}
      </button>
      {open && (
        <>
          <div className="panel-scrim" onClick={() => setOpen(false)} />
          <aside className="panel" role="dialog" aria-label="Feedback catalog">
            <div className="panel-head">
              <div>
                <div className="panel-module">Sign-off catalog</div>
                <h2 className="panel-title">Your feedback</h2>
              </div>
              <button type="button" className="panel-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>

            {count === 0 && (
              <p className="panel-plain">
                Nothing captured yet. Right-click any metric (or tap its ⓘ) to vote and comment;
                each dashboard also has a composition question at the bottom.
              </p>
            )}

            {DASHBOARDS.map((dash) => {
              const dashEntries = entries.filter(([id]) => byId[id]?.dashboard === dash.id)
              const comp = fb.dashboards[dash.id]
              if (!dashEntries.length && !comp) return null
              return (
                <div className="panel-section" key={dash.id}>
                  <div className="panel-label">{dash.title}</div>
                  {comp && (
                    <p className="drawer-comp">
                      <b>Composition:</b> {comp.verdict ?? '—'}
                      {comp.comment ? ` — ${comp.comment}` : ''}
                    </p>
                  )}
                  {dashEntries.map(([id, f]) => (
                    <div className="drawer-entry" key={id}>
                      <span className={`drawer-vote vote-${f.vote ?? 'none'}`}>{voteLabel(f.vote)}</span>
                      <div>
                        <div className="drawer-metric">{byId[id].name}</div>
                        {f.comment && <div className="drawer-comment">{f.comment}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}

            <div className="panel-section panel-feedback">
              <div className="panel-label">Send it back</div>
              <p style={{ marginBottom: 10 }}>
                Export downloads a markdown sign-off matrix. Email it to the project team —
                it gets cataloged in the project's <code>feedback/</code> directory.
              </p>
              <div className="vote-row">
                <button type="button" className="save-btn" style={{ flex: 1 }} onClick={() => downloadFeedback(fb)}>
                  Export .md
                </button>
                <button type="button" className="vote-btn" style={{ flex: 1 }} onClick={mailto}>
                  Open email
                </button>
              </div>
              {count > 0 && (
                <button
                  type="button"
                  className="drawer-clear"
                  onClick={() => window.confirm('Clear all captured feedback on this browser?') && fb.clearAll()}
                >
                  Clear all feedback
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  )
}
