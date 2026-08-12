import { applyFmt } from '../data/format'

/**
 * Horizontal funnel: stage bars scaled to the first stage, with counts and
 * conversion from the prior stage. stages = [{ label, value }]
 */
export default function FunnelStrip({ stages, color = 'var(--seg-newly-enrolled)' }) {
  const max = stages[0]?.value || 1
  return (
    <div className="funnel">
      {stages.map((s, i) => (
        <div className="funnel-stage" key={s.label}>
          <div className="funnel-meta">
            <span className="funnel-label">{s.label}</span>
            <span className="funnel-value">{applyFmt('num', s.value)}</span>
            {i > 0 && stages[i - 1].value > 0 && (
              <span className="funnel-conv">{applyFmt('pct', s.value / stages[i - 1].value)} of previous</span>
            )}
          </div>
          <div className="funnel-track">
            <div
              className="funnel-bar"
              style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, background: color, opacity: 1 - i * 0.16 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
