import { createContext, useContext, useMemo, useState } from 'react'
import { MONTHS, INDUSTRIES, PRODUCTS, CHANNELS, PROVIDER_TYPES } from '../data/synthetic.js'

const FiltersContext = createContext(null)

export const RANGE_PRESETS = [
  { key: 'l1m', label: 'Last month', months: () => MONTHS.slice(-1) },
  { key: 'l3m', label: 'Last 3 months', months: () => MONTHS.slice(-3) },
  { key: 'l6m', label: 'Last 6 months', months: () => MONTHS.slice(-6) },
  { key: 'l12m', label: 'Last 12 months', months: () => MONTHS.slice(-12) },
  { key: 'ytd', label: 'Year to date', months: () => MONTHS.filter((m) => m.startsWith('2026')) },
  { key: 'all', label: 'All time', months: () => MONTHS },
]

export function FiltersProvider({ children }) {
  const [rangeKey, setRangeKey] = useState('l12m')
  const [industry, setIndustry] = useState('All')
  const [product, setProduct] = useState('All')
  const [channel, setChannel] = useState('All')
  const [providerType, setProviderType] = useState('All')
  // Custom from/to month range (client feedback 8/5: custom date range)
  const [customFrom, setCustomFrom] = useState(MONTHS[0])
  const [customTo, setCustomTo] = useState(MONTHS[MONTHS.length - 1])

  const value = useMemo(() => {
    let months
    let rangeLabel
    if (rangeKey === 'custom') {
      const i0 = Math.min(MONTHS.indexOf(customFrom), MONTHS.indexOf(customTo))
      const i1 = Math.max(MONTHS.indexOf(customFrom), MONTHS.indexOf(customTo))
      months = MONTHS.slice(i0, i1 + 1)
      rangeLabel = `${MONTHS[i0]} → ${MONTHS[i1]}`
    } else {
      const preset = RANGE_PRESETS.find((r) => r.key === rangeKey) ?? RANGE_PRESETS[3]
      months = preset.months()
      rangeLabel = preset.label
    }
    return {
      rangeKey, setRangeKey, industry, setIndustry, product, setProduct, channel, setChannel, providerType, setProviderType,
      customFrom, setCustomFrom, customTo, setCustomTo,
      rangeLabel, months,
      industries: industry === 'All' ? undefined : [industry],
      products: product === 'All' ? undefined : [product],
      channels: channel === 'All' ? undefined : [channel],
      providerTypes: providerType === 'All' ? undefined : [providerType],
      INDUSTRIES, PRODUCTS, CHANNELS, PROVIDER_TYPES, MONTHS,
    }
  }, [rangeKey, industry, product, channel, providerType, customFrom, customTo])

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters outside FiltersProvider')
  return ctx
}
