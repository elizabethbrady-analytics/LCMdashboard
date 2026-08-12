// Deduped metrics master CSV, generated from the registry.
// Committed to the repo (was scratchpad-only — lost once to a session
// restart). Attribution comes from each metric's structured `origin`
// field; concept-level dedupe from `concept` keys.
//
// Usage: node scripts/build-metrics-csv.mjs [outputPath]
//   default output: ../CareCredit_LCM_Metrics_Master.csv relative to repo root
// Also writes scripts/.registry-dump.json for build-framework-xlsx.py.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const { REGISTRY } = await import(join(here, '../src/data/registry.js'))

const OUT = process.argv[2] ?? join(here, '../../CareCredit_LCM_Metrics_Master.csv')

const DASH_TITLES = {
  'executive-overview': 'Overall Executive View',
  'newly-enrolled': 'Newly Enrolled',
  stars: 'Stars',
  consistent: 'Consistent',
  'engagement-exposures': 'Engagement Exposures',
  'needs-attention': 'Needs Attention',
  dormant: 'Dormant',
}

const TXT = 'Client KPI Wish List (B2B_Lifecycle KPI Wish_List.txt)'
const XLSX = 'Measurement Framework workbook (internal xlsx)'

// Pre-feedback attributions that are not derivable from `origin`
const STATIC_OVERRIDES = {
  'executive-overview.activated': XLSX + ' — Executive View sheet',
  'executive-overview.transper': XLSX + ' — Executive View sheet',
  'newly-enrolled.dd.location': 'Derived — approved split of the Wish List row "Practice industry / location / size (generated sales)"; granularity/source open for review',
}

function requestSource(m) {
  if (STATIC_OVERRIDES[m.id]) return STATIC_OVERRIDES[m.id]
  if (m.origin) return `${m.origin.source} 2026-${m.origin.date.replace('/', '-')} (${m.origin.by})`
  return TXT
}

// Locked-name drift that predates concept keys
const ALIASES = {
  'avg app / active provider': 'Avg apps / active provider',
  'product activation mix info (plcc vs pl)': 'Product activation (PLCC vs PL)',
  'total # hand raiser generated': 'Total # hand raisers generated',
  'ttv-app by industry': 'TTV-App',
  'ttv-tran by industry': 'TTV-Tran',
  'activation rate % by time bucket': 'Activation rate',
}

const groupKey = (m) => m.concept ?? (ALIASES[m.name.toLowerCase()] ?? m.name).toLowerCase()

const groups = new Map()
for (const m of REGISTRY) {
  const key = groupKey(m)
  if (!groups.has(key)) {
    groups.set(key, {
      name: ALIASES[m.name.toLowerCase()] ?? m.name,
      variants: new Set(), dashboards: new Set(), modules: new Set(),
      defs: [], plains: [], calcs: new Set(), measures: new Set(), vizzes: new Set(),
      sources: new Set(), reqSources: new Set(), modeled: false,
    })
  }
  const g = groups.get(key)
  if (m.name !== g.name) g.variants.add(m.name)
  g.dashboards.add(DASH_TITLES[m.dashboard])
  g.modules.add(m.module)
  if (!g.defs.some(([, d]) => d === m.definition)) g.defs.push([DASH_TITLES[m.dashboard], m.definition])
  if (m.plain && !g.plains.includes(m.plain)) g.plains.push(m.plain)
  g.calcs.add(m.eq.text)
  g.measures.add(m.measure)
  g.vizzes.add(m.viz)
  g.sources.add(m.source.system)
  g.reqSources.add(requestSource(m))
  if (m.modeled) g.modeled = true
}

const esc = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

const HEADERS = [
  'Metric', 'Request Source', 'Dashboards', 'Module(s)',
  'Plain-language description', 'Definition', 'Calculation',
  'Measure / Cuts', 'Visualization', 'Data Source (system)',
  'Setup Notes / Open Items', 'Name Variants (locked per doc)',
]

const DASH_ORDER = Object.values(DASH_TITLES)

const rows = [...groups.values()]
  .sort((a, b) => {
    const da = DASH_ORDER.findIndex((t) => a.dashboards.has(t))
    const db = DASH_ORDER.findIndex((t) => b.dashboards.has(t))
    return da - db || a.name.localeCompare(b.name)
  })
  .map((g) => {
    const defMain = g.defs[0][1]
    const defVariants = g.defs.slice(1).map(([d, def]) => `VARIANT (${d}): ${def}`).join(' | ')
    const notes = []
    const allText = (defMain + ' ' + defVariants).toLowerCase()
    if (allText.includes('tbd') || allText.includes('definition required') || allText.includes('open:') || allText.includes('to be defined') || allText.includes('formula open')) {
      notes.push('OPEN ITEM — definition/methodology needs client or analytics decision')
    }
    if (g.modeled) notes.push('ILLUSTRATIVE MODEL — placeholder methodology, flagged in the review site')
    if (g.defs.length > 1) notes.push('Definition varies by dashboard — see variants in Definition column')
    if (g.name === 'Retention rate') notes.push('CONFLICT: wish list defines as combined Stars+Consistent+Engagement Exposure; framework workbook defines as active in current AND previous period')
    if (g.name === 'Avg apps / active provider') notes.push('Terminology drift in docs: "per active provider" (executive) vs "per active account" (deep dives) — confirm same entity')
    return [
      g.name,
      [...g.reqSources].join(' | '),
      DASH_ORDER.filter((t) => g.dashboards.has(t)).join('; '),
      [...g.modules].join('; '),
      g.plains[0] ?? '',
      defVariants ? `${defMain} | ${defVariants}` : defMain,
      [...g.calcs].join(' | '),
      [...g.measures].join(' | '),
      [...g.vizzes].join(' | '),
      [...g.sources].join(' | '),
      notes.join('; '),
      [...g.variants].join('; '),
    ]
  })

const csv = [HEADERS, ...rows].map((r) => r.map(esc).join(',')).join('\n') + '\n'
writeFileSync(OUT, csv)
console.log('csv rows:', rows.length, '(from', REGISTRY.length, 'registry entries) →', OUT)

writeFileSync(
  join(here, '.registry-dump.json'),
  JSON.stringify(REGISTRY.map((m) => ({
    id: m.id, dashboard: DASH_TITLES[m.dashboard], module: m.module, name: m.name,
    definition: m.definition, measure: m.measure, viz: m.viz, source: m.source.system,
    origin: m.origin ?? null, modeled: !!m.modeled,
  }))),
)
console.log('registry dump written for build-framework-xlsx.py')
