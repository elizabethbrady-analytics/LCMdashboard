// Feedback capture — votes + comments per metric, composition feedback per
// dashboard, reviewer name. Persisted to localStorage; exported to a
// markdown sign-off matrix (PR 8) that gets cataloged in feedback/.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'lcm.feedback.v1'
const FeedbackContext = createContext(null)

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export const VOTES = [
  { key: 'approve', label: 'Approve' },
  { key: 'needs_change', label: 'Needs change' },
  { key: 'question', label: 'Question' },
]

export function FeedbackProvider({ children }) {
  const [store, setStore] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
      /* private-mode browsers: feedback stays in memory for the session */
    }
  }, [store])

  const value = useMemo(() => ({
    reviewer: store.reviewer ?? '',
    setReviewer: (name) => setStore((s) => ({ ...s, reviewer: name })),
    metrics: store.metrics ?? {},
    setMetricFeedback: (metricId, patch) =>
      setStore((s) => ({
        ...s,
        metrics: {
          ...(s.metrics ?? {}),
          [metricId]: { ...(s.metrics ?? {})[metricId], ...patch, ts: new Date().toISOString() },
        },
      })),
    dashboards: store.dashboards ?? {},
    setDashboardFeedback: (dashId, patch) =>
      setStore((s) => ({
        ...s,
        dashboards: {
          ...(s.dashboards ?? {}),
          [dashId]: { ...(s.dashboards ?? {})[dashId], ...patch, ts: new Date().toISOString() },
        },
      })),
    clearAll: () => setStore((s) => ({ reviewer: s.reviewer })),
  }), [store])

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback outside FeedbackProvider')
  return ctx
}
