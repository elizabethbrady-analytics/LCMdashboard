// Dashboard shell metadata. Titles use the client-doc naming verbatim (locked).
// The full metric registry (per-KPI definitions, equations, sources) lands in PR2.

export const DASHBOARDS = [
  {
    id: 'executive-overview',
    path: '/',
    title: 'Overall Executive View',
    short: 'Executive View',
    color: 'var(--brand)',
    kpiCount: 23,
    purpose:
      'Journey performance across all LCM journeys — reach, activation, retention, reactivation, NCS impact vs control, and segment movement.',
    modules: ['Executive View'],
  },
  {
    id: 'newly-enrolled',
    path: '/newly-enrolled',
    title: 'Newly Enrolled',
    short: 'Newly Enrolled',
    color: 'var(--seg-newly-enrolled)',
    kpiCount: 44,
    purpose:
      'Executive and funnel view of the onboarding & activation journey — activation, time-to-value, product split, and where providers land in segmentation after the journey.',
    modules: ['Executive / Funnel', 'Activation Deep Dive', 'VOC / Sentiment', 'Journey Optimization'],
  },
  {
    id: 'stars',
    path: '/stars',
    title: 'Stars',
    short: 'Stars',
    color: 'var(--seg-stars)',
    kpiCount: 27,
    purpose:
      'Top performers — retention, sustained Net Credit Sales, and movement out of the segment.',
    modules: ['Executive / Funnel', 'Segment KPIs', 'VOC / Sentiment', 'Journey Optimization'],
  },
  {
    id: 'consistent',
    path: '/consistent',
    title: 'Consistent',
    short: 'Consistent',
    color: 'var(--seg-consistent)',
    kpiCount: 25,
    purpose:
      'Sustained usage — expansion, product mix, and upward migration toward Stars.',
    modules: ['Executive / Funnel', 'Segment KPIs', 'VOC / Sentiment', 'Journey Optimization'],
  },
  {
    id: 'engagement-exposures',
    path: '/engagement-exposures',
    title: 'Engagement Exposures',
    short: 'Engagement Exposures',
    color: 'var(--seg-engagement)',
    kpiCount: 26,
    purpose:
      'Does journey engagement convert to upward migration and transaction activity.',
    modules: ['Executive / Funnel', 'Segment KPIs', 'VOC / Sentiment', 'Journey Optimization'],
  },
  {
    id: 'needs-attention',
    path: '/needs-attention',
    title: 'Needs Attention',
    short: 'Needs Attention',
    color: 'var(--seg-needs-attention)',
    kpiCount: 31,
    purpose:
      'Early reactivation — retain what can be retained, catch providers before they drop to Dormant.',
    modules: ['Executive View', 'Segment KPIs', 'Journey Optimization'],
  },
  {
    id: 'dormant',
    path: '/dormant',
    title: 'Dormant',
    short: 'Dormant',
    color: 'var(--seg-dormant)',
    kpiCount: 31,
    purpose:
      'Deep reactivation — recovery vs prior-year benchmark, reactivation economics, and list health.',
    modules: ['Executive View', 'Segment KPIs', 'Journey Optimization'],
  },
]
