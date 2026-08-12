import { RANGE_PRESETS, useFilters } from '../state/FiltersContext'

export default function FilterBar() {
  const f = useFilters()
  return (
    <div className="filterbar">
      <div className="filter-group">
        <span className="filter-label">Date range</span>
        <select
          className="filter-select"
          value={f.rangeKey}
          onChange={(e) => f.setRangeKey(e.target.value)}
        >
          {RANGE_PRESETS.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
          <option value="custom">Custom range…</option>
        </select>
      </div>
      {f.rangeKey === 'custom' && (
        <div className="filter-group">
          <span className="filter-label">From</span>
          <select className="filter-select" value={f.customFrom} onChange={(e) => f.setCustomFrom(e.target.value)}>
            {f.MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="filter-label">To</span>
          <select className="filter-select" value={f.customTo} onChange={(e) => f.setCustomTo(e.target.value)}>
            {f.MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}
      <div className="filter-group">
        <span className="filter-label">Industry</span>
        <select
          className="filter-select"
          value={f.industry}
          onChange={(e) => f.setIndustry(e.target.value)}
        >
          <option value="All">All industries</option>
          {f.INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <span className="filter-label">Product</span>
        <select
          className="filter-select"
          value={f.product}
          onChange={(e) => f.setProduct(e.target.value)}
        >
          <option value="All">All products</option>
          {f.PRODUCTS.map((p) => (
            <option key={p} value={p}>{p === 'PL' ? 'PL (Pay Later)' : p}</option>
          ))}
        </select>
      </div>
      <span className="filter-note">
        Comparison: previous period of equal length · synthetic data
      </span>
    </div>
  )
}
