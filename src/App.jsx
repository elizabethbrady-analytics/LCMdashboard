import { useMemo } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { DASHBOARDS } from './dashboards/meta'
import { buildScope, priorWindow } from './data/scope.js'
import { FiltersProvider, useFilters } from './state/FiltersContext'
import { FeedbackProvider } from './state/FeedbackContext'
import { PanelProvider } from './state/PanelContext'
import FilterBar from './components/FilterBar'
import MetricPanel from './components/MetricPanel'
import CoachMark from './components/CoachMark'
import FeedbackDrawer from './components/FeedbackDrawer'
import CompositionCard from './components/CompositionCard'
import ExecutiveOverview from './dashboards/ExecutiveOverview'
import NewlyEnrolled from './dashboards/NewlyEnrolled'
import Stars from './dashboards/Stars'
import Consistent from './dashboards/Consistent'
import EngagementExposures from './dashboards/EngagementExposures'
import { NeedsAttention, Dormant } from './dashboards/Reactivation'
import Changelog from './dashboards/Changelog'

const CUSTOM = {
  'executive-overview': ExecutiveOverview,
  'newly-enrolled': NewlyEnrolled,
  stars: Stars,
  consistent: Consistent,
  'engagement-exposures': EngagementExposures,
  'needs-attention': NeedsAttention,
  dormant: Dormant,
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-name">
          LCM <em>Analytics</em>
        </div>
        <div className="brand-sub">LCM Measurement Framework</div>
      </div>
      <nav className="nav">
        <div className="nav-label">Dashboards</div>
        {DASHBOARDS.map((d) => (
          <NavLink
            key={d.id}
            to={d.path}
            end={d.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-dot" style={{ background: d.color }} />
            {d.short}
            <span className="nav-count">{d.kpiCount}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-foot">
        Synthetic data for review purposes only.
        <br />
        Right-click any metric for methodology.
        <br />
        <NavLink to="/changelog" className="foot-link">
          What changed
        </NavLink>
      </div>
    </aside>
  )
}

function Page() {
  const { pathname } = useLocation()
  const filters = useFilters()
  const dashboard = DASHBOARDS.find((d) => d.path === pathname) ?? DASHBOARDS[0]

  const { scope, priorScope, filter } = useMemo(() => {
    const f = { industries: filters.industries, products: filters.products, months: filters.months }
    return {
      filter: f,
      scope: buildScope(dashboard.id, f),
      priorScope: buildScope(dashboard.id, { ...f, months: priorWindow(filters.months) }),
    }
  }, [dashboard.id, filters.industries, filters.products, filters.months])

  const Custom = CUSTOM[dashboard.id]

  return (
    <div className="main">
      <div className="topbar">
        <div>
          <h1 className="page-title">{dashboard.title}</h1>
          <p className="page-purpose">{dashboard.purpose}</p>
        </div>
        <span className="badge">Draft for review</span>
      </div>
      <FilterBar />
      <div className="content">
        <Custom scope={scope} priorScope={priorScope} filter={filter} />
        <CompositionCard dashboard={dashboard} />
      </div>
      <MetricPanel scope={scope} />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <FiltersProvider>
        <FeedbackProvider>
          <PanelProvider>
            <div className="app">
              <Sidebar />
              <Routes>
                {DASHBOARDS.map((d) => (
                  <Route key={d.id} path={d.path} element={<Page />} />
                ))}
                <Route path="/changelog" element={<Changelog />} />
                <Route path="*" element={<Page />} />
              </Routes>
            </div>
            <CoachMark />
            <FeedbackDrawer />
          </PanelProvider>
        </FeedbackProvider>
      </FiltersProvider>
    </HashRouter>
  )
}
