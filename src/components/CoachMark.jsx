import { useState } from 'react'

const KEY = 'lcm.coach.v1'

export default function CoachMark() {
  const [seen, setSeen] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })
  if (seen) return null
  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch { /* ignore */ }
    setSeen(true)
  }
  return (
    <div className="coach" role="status">
      <div>
        <b>Right-click any metric</b> (or tap its ⓘ) to see exactly how it’s calculated —
        and leave your feedback on it.
      </div>
      <button type="button" onClick={dismiss}>Got it</button>
    </div>
  )
}
