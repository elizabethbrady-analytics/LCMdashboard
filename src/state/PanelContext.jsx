import { createContext, useContext, useMemo, useState } from 'react'

const PanelContext = createContext(null)

export function PanelProvider({ children }) {
  const [metricId, setMetricId] = useState(null)
  const value = useMemo(
    () => ({ metricId, open: setMetricId, close: () => setMetricId(null) }),
    [metricId],
  )
  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
}

export function usePanel() {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel outside PanelProvider')
  return ctx
}
