// "What changed" — shown to reviewers between review rounds so revisions
// driven by their feedback are visible, not silent.

const ENTRIES = [
  {
    version: 'v2.2 — segment trend vs last year',
    date: 'August 12, 2026',
    items: [
      'Every segment dashboard now opens its migration section with a population trend: providers in the segment by month, overlaid with the same period last year — parallel lines read as seasonality, a widening gap as journey impact (requested 8/12). It sits directly above the existing up/down migration view so the pair reads together.',
      'Production note carried on the chart: segment labels refresh quarterly, so real counts will step at refresh dates; this view also needs 13+ months of segmentation snapshots (logged in Build Prerequisites).',
    ],
  },
  {
    version: 'v2.1 — review polish',
    date: 'August 7, 2026',
    items: [
      'Metrics added or changed from your feedback now show a provenance chip in their methodology panel ("From your 8/5 feedback — client reviewer"), so it\'s always clear which metrics you shaped.',
      'The five placeholder-modeled metrics (Incremental LTV, % suspended, avg emails to reactivate, sunsetted contacts) now say so explicitly — an "illustrative model" note in the panel keeps the worked-equation promise honest.',
      'The shared framework workbook gained a "Build Prerequisites" sheet: the nine decisions (grain/join key, segment snapshots, NCS-lift holdout design, journey-overlap counting, and five scoped items) the Tableau build needs before it can start.',
    ],
  },
  {
    version: 'v2.0 — round 2, built from your feedback',
    date: 'August 7, 2026',
    items: [
      'Activation now reads "≥1 application and/or ≥1 transaction" everywhere, with a new "Fully activated (app + transaction)" companion KPI — from client reviewer (8/5), client reviewer, and the 8/6 review.',
      'Renamed "Total Sales Active Providers %" and added "Total App Active Providers %" (client reviewer 8/5).',
      'New executive KPIs: Incremental LTV, First Purchase (cardholder first transactions per month), Unsubscribe rate, and a PLCC / PayLater / ISV product-mix bar with the Combined share (client reviewer 8/5, client reviewer).',
      'Executive NCS trend gained a same-period-prior-year benchmark line alongside the goal line (client reviewer 8/5).',
      'Segment migration: every view now shows % alongside counts, plus a new at-a-glance "% up / stayed / down" summary (client reviewer, client reviewer, 8/6 review).',
      'Needs Attention and Dormant are now separate dashboards, each with the KPIs requested 8/6 — retention/churn/migration rates, 30/60/90-day activity windows, % suspended, avg emails to reactivate, sunsetted contacts, and a reactivation-vs-prior-year benchmark.',
      'Newly Enrolled: 0–15 and 16–30 day activation buckets, funnel measured at 90 days, app vs sales activation split, Avg NCS per activated provider, First transaction CH, enrollment-source breakdown table, % of enrolled by industry; eligibility tier and enrollment type removed per client.',
      'Date controls: new Last-month preset and a custom from/to month range (client reviewer 8/5).',
      'Delivery rate added to Journey Optimization on every dashboard (8/6 review).',
      'Stars: Churn rate KPI added; Star criteria windows moved from first 180 to first 90 days to match the quarterly refresh (client reviewer 8/5).',
      'Note: votes cast on the old combined Needs Attention / Dormant dashboard were exported with round 1 and are archived in the project record.',
    ],
  },
  {
    version: 'v1.2.1',
    date: 'July 29, 2026',
    items: [
      'Full metric coverage: Newly Enrolled gains Enrollment profile and Volume & channel detail sections, so every metric from the program documents is now clickable and voteable — verified 151 of 151 across all six dashboards.',
    ],
  },
  {
    version: 'v1.2',
    date: 'July 29, 2026',
    items: [
      'Every chart is now something Tableau builds natively. Segment migration switched from a sankey to a highlight table (from × to matrix) on the Executive View, and to destination bars on segment dashboards; trendlines use straight segments like Tableau line marks.',
    ],
  },
  {
    version: 'v1.1',
    date: 'July 29, 2026',
    items: [
      'New on Newly Enrolled: practice-location state map — a concrete rendering of the "practice industry / location / size" KPI’s location cut. Granularity and source are open questions; right-click the map to weigh in.',
      'Tighter, more Tableau-like layout: compact KPI banner, denser tiles and panes, flatter cards with divided worksheet titles.',
    ],
  },
  {
    version: 'v1.0',
    date: 'July 29, 2026',
    items: [
      'Initial review release: all six dashboards (Overall Executive View, Newly Enrolled, Stars, Consistent, Engagement Exposures, Needs Attention / Dormant) with synthetic data.',
      'Right-click (or ⓘ) methodology panel on every metric: plain-language explanation, the equation worked with the live on-screen numbers, definition, and data source.',
      'Per-metric feedback (Approve / Needs change / Question + comment) and a per-dashboard composition question; everything exports to a markdown sign-off matrix.',
      'Filters: date range, industry, product — every number and worked example recomputes.',
    ],
  },
]

export default function Changelog() {
  return (
    <div className="main">
      <div className="topbar">
        <div>
          <h1 className="page-title">What changed</h1>
          <p className="page-purpose">
            Revisions between review rounds, driven by the feedback cataloged in this project.
          </p>
        </div>
      </div>
      <div className="content">
        {ENTRIES.map((e) => (
          <section className="card" key={e.version}>
            <div className="module-title">
              {e.version} — {e.date}
            </div>
            <ul className="changelog-list">
              {e.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
