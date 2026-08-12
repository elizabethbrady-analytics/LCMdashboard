// Data-layer sanity checks:
//  1. Determinism — cube JSON hashes identically across module reloads
//  2. Scale — segment provider counts land near the doc anchors
//  3. Registry integrity — every equation operand resolves to a finite value
//     in its dashboard's scope, and every calc() returns a finite number
//
// Run: node scripts/sanity.mjs   (exits non-zero on any failure)

import { createHash } from 'node:crypto'

const { CUBE, SEGMENTS, agg, MONTHS } = await import('../src/data/synthetic.js')
const { REGISTRY } = await import('../src/data/registry.js')
const { buildScope, DASHBOARD_SEGMENTS } = await import('../src/data/scope.js')

let failures = 0
const fail = (msg) => { failures++; console.error('FAIL', msg) }
const ok = (msg) => console.log(' ok ', msg)

// 1. Determinism — fresh import via cache-busting query param
const hash1 = createHash('sha256').update(JSON.stringify(CUBE)).digest('hex')
const fresh = await import('../src/data/synthetic.js?bust=' + Math.floor(Date.now()))
const hash2 = createHash('sha256').update(JSON.stringify(fresh.CUBE)).digest('hex')
hash1 === hash2 ? ok(`determinism: cube hash stable (${hash1.slice(0, 12)}…)`) : fail('cube hash differs across loads')

// 2. Scale anchors (±20%)
const ANCHORS = {
  'Newly Enrolled': 4100, Stars: 16400, Consistent: 43000,
  'Engagement Exposures': 63000, 'Needs Attention': 73000, Dormant: 66000,
}
for (const seg of SEGMENTS) {
  const p = agg({ segments: [seg], months: MONTHS.slice(-3) }).providers
  const target = ANCHORS[seg]
  Math.abs(p - target) / target < 0.2
    ? ok(`scale: ${seg} ≈ ${p.toLocaleString()} (anchor ${target.toLocaleString()})`)
    : fail(`scale: ${seg} = ${p}, anchor ${target}`)
}

// 3. Registry integrity across every dashboard scope
const scopes = Object.fromEntries(
  Object.keys(DASHBOARD_SEGMENTS).map((d) => [d, buildScope(d, { months: MONTHS.slice(-12) })]),
)
let checked = 0
for (const m of REGISTRY) {
  const scope = scopes[m.dashboard]
  if (!scope) { fail(`${m.id}: unknown dashboard ${m.dashboard}`); continue }
  for (const [label, key] of m.eq.parts) {
    const v = scope[key]
    if (v == null || (typeof v === 'number' && !Number.isFinite(v))) {
      fail(`${m.id}: operand '${key}' (${label}) unresolved`)
    }
  }
  const value = m.eq.calc(scope)
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${m.id}: calc() returned ${value}`)
  }
  checked++
}
ok(`registry: ${checked} metrics checked across ${Object.keys(scopes).length} dashboards`)

// 4. Per-dashboard row counts (guards layout/registry refactors)
const EXPECTED_COUNTS = {
  'executive-overview': 23, 'newly-enrolled': 44, stars: 27, consistent: 25,
  'engagement-exposures': 26, 'needs-attention': 31, dormant: 31,
}
const counts = {}
for (const m of REGISTRY) counts[m.dashboard] = (counts[m.dashboard] ?? 0) + 1
for (const [d, n] of Object.entries(EXPECTED_COUNTS)) {
  counts[d] === n ? ok(`count: ${d} = ${n}`) : fail(`count: ${d} = ${counts[d]}, expected ${n}`)
}

// 5. Modeled metrics must disclose it; origin fields must be well-formed
const modeled = REGISTRY.filter((m) => m.modeled)
modeled.length === 5
  ? ok(`modeled: ${modeled.length} placeholder metrics flagged`)
  : fail(`modeled: ${modeled.length} flagged, expected 5`)
for (const m of modeled) {
  const t = (m.definition + m.plain).toLowerCase()
  if (!t.includes('placeholder') && !t.includes('tbd') && !t.includes('model')) {
    fail(`${m.id}: modeled but definition/plain does not disclose it`)
  }
}
for (const m of REGISTRY.filter((x) => x.origin)) {
  if (!m.origin.source || !m.origin.date || !m.origin.by) fail(`${m.id}: malformed origin`)
}
ok(`origin: ${REGISTRY.filter((m) => m.origin).length} metrics carry structured provenance`)

// 6. Definitions stay clean of provenance prose (belongs in origin)
const dirty = REGISTRY.filter((m) => /per client feedback|client 8\/[56]/i.test(m.definition))
dirty.length === 0
  ? ok('definitions: no provenance prose')
  : fail(`definitions contain provenance prose: ${dirty.map((m) => m.id).join(', ')}`)

console.log(failures ? `\n${failures} failure(s)` : '\nAll sanity checks passed.')
process.exit(failures ? 1 : 0)
