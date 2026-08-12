// Builds the markdown sign-off matrix from captured feedback. The exported
// file is what gets cataloged in the repo's feedback/ directory.

import { byId } from './registry'
import { DASHBOARDS } from '../dashboards/meta'
import { VOTES } from '../state/FeedbackContext'

const voteLabel = (key) => VOTES.find((v) => v.key === key)?.label ?? '—'

export function buildFeedbackMarkdown({ reviewer, metrics, dashboards }) {
  const now = new Date()
  const lines = []
  lines.push('# LCM Analytics — Metric sign-off feedback')
  lines.push('')
  lines.push(`- **Reviewer:** ${reviewer || '(not provided)'}`)
  lines.push(`- **Exported:** ${now.toISOString()}`)
  lines.push(`- **Source:** interactive review site (synthetic data)`)
  lines.push('')

  const votedIds = Object.keys(metrics).filter((id) => metrics[id]?.vote || metrics[id]?.comment)
  const counts = { approve: 0, needs_change: 0, question: 0 }
  votedIds.forEach((id) => {
    const v = metrics[id]?.vote
    if (v) counts[v]++
  })
  lines.push('## Summary')
  lines.push('')
  lines.push(`| Approve | Needs change | Question | Metrics with feedback |`)
  lines.push(`|---|---|---|---|`)
  lines.push(`| ${counts.approve} | ${counts.needs_change} | ${counts.question} | ${votedIds.length} |`)
  lines.push('')

  for (const dash of DASHBOARDS) {
    const dashMetricIds = votedIds.filter((id) => byId[id]?.dashboard === dash.id)
    const comp = dashboards[dash.id]
    if (!dashMetricIds.length && !comp) continue

    lines.push(`## ${dash.title}`)
    lines.push('')
    if (comp) {
      lines.push(`**Dashboard composition:** ${comp.verdict ?? '—'}`)
      if (comp.comment) lines.push(`> ${comp.comment}`)
      lines.push('')
    }
    if (dashMetricIds.length) {
      lines.push('| Module | Metric | Vote | Comment |')
      lines.push('|---|---|---|---|')
      for (const id of dashMetricIds) {
        const m = byId[id]
        const f = metrics[id]
        const comment = (f.comment ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
        lines.push(`| ${m.module} | ${m.name} | ${voteLabel(f.vote)} | ${comment} |`)
      }
      lines.push('')
    }
  }

  if (!votedIds.length && !Object.keys(dashboards).length) {
    lines.push('_No feedback captured yet._')
  }
  return lines.join('\n')
}

export function downloadFeedback(store) {
  const md = buildFeedbackMarkdown(store)
  const stamp = new Date().toISOString().slice(0, 10)
  const who = (store.reviewer || 'reviewer').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const blob = new Blob([md], { type: 'text/markdown' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `feedback-${stamp}-${who}.md`
  a.click()
  URL.revokeObjectURL(a.href)
  return md
}
