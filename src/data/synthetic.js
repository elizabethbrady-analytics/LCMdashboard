// Seeded synthetic data engine.
//
// Generates a monthly cube: segment × industry × product × channel × month, then exposes
// query helpers that the dashboards and the methodology panel's worked
// equations share — so the number on a chart and the numbers substituted into
// its equation always agree.
//
// Scale anchors come from the client documents:
//   Newly Enrolled ~4K, Stars ~16.4K, Consistent ~43K,
//   Engagement Exposures ~63K, Needs Attention ~73K, Dormant ~66K.
// All values are synthetic — no client data.

import { mulberry32, hashString, noisy, range } from './rng.js'

export const SEGMENTS = [
  'Newly Enrolled',
  'Stars',
  'Consistent',
  'Engagement Exposures',
  'Needs Attention',
  'Dormant',
]

export const SEGMENT_COLORS = {
  'Newly Enrolled': '#0e8a5f',
  Stars: '#b57614',
  Consistent: '#2f6bb0',
  'Engagement Exposures': '#c74e33',
  'Needs Attention': '#8a5fb5',
  Dormant: '#647a1f',
}

export const INDUSTRIES = ['Dental', 'Vision', 'Veterinary', 'Cosmetic', 'Audiology', 'Wellness']
export const PRODUCTS = ['PLCC', 'PL']
export const CHANNELS = ['Provider Center', 'ISV', 'QR Code']
export const PROVIDER_TYPES = ['Multi-location', 'Independent', 'Mid-market', 'Large client']

// Months Jan 2025 → Jul 2026 inclusive
export const MONTHS = (() => {
  const out = []
  for (let y = 2025; y <= 2026; y++) {
    const last = y === 2026 ? 7 : 12
    for (let m = 1; m <= last; m++) out.push(`${y}-${String(m).padStart(2, '0')}`)
  }
  return out
})()

// Provider-base scale per segment (from docs), and behavioral profiles.
const SEGMENT_PROFILE = {
  'Newly Enrolled': { base: 4000, appsPer: 0.55, transPerApp: 0.62, avgTicket: 640, openRate: 0.44, ctor: 0.19, mqlRate: 0.012, growth: 0.012 },
  Stars: { base: 16400, appsPer: 3.1, transPerApp: 0.86, avgTicket: 940, openRate: 0.41, ctor: 0.17, mqlRate: 0.01, growth: 0.006 },
  Consistent: { base: 43000, appsPer: 1.4, transPerApp: 0.78, avgTicket: 780, openRate: 0.34, ctor: 0.13, mqlRate: 0.008, growth: 0.004 },
  'Engagement Exposures': { base: 63000, appsPer: 0.38, transPerApp: 0.66, avgTicket: 610, openRate: 0.27, ctor: 0.09, mqlRate: 0.005, growth: 0.002 },
  'Needs Attention': { base: 73000, appsPer: 0.09, transPerApp: 0.55, avgTicket: 470, openRate: 0.2, ctor: 0.06, mqlRate: 0.003, growth: -0.001 },
  Dormant: { base: 66000, appsPer: 0.015, transPerApp: 0.5, avgTicket: 430, openRate: 0.14, ctor: 0.04, mqlRate: 0.001, growth: -0.002 },
}

// Industry mix per segment (docs: Vet biggest in Stars; vision/dental/cosmetic
// dominate Engagement Exposures; wellness/audiology majority in Needs Attention).
const INDUSTRY_MIX = {
  'Newly Enrolled': { Dental: 0.26, Vision: 0.16, Veterinary: 0.2, Cosmetic: 0.14, Audiology: 0.09, Wellness: 0.15 },
  Stars: { Dental: 0.2, Vision: 0.12, Veterinary: 0.34, Cosmetic: 0.16, Audiology: 0.06, Wellness: 0.12 },
  Consistent: { Dental: 0.27, Vision: 0.17, Veterinary: 0.22, Cosmetic: 0.13, Audiology: 0.08, Wellness: 0.13 },
  'Engagement Exposures': { Dental: 0.24, Vision: 0.27, Veterinary: 0.05, Cosmetic: 0.22, Audiology: 0.08, Wellness: 0.14 },
  'Needs Attention': { Dental: 0.15, Vision: 0.17, Veterinary: 0.04, Cosmetic: 0.1, Audiology: 0.24, Wellness: 0.3 },
  Dormant: { Dental: 0.18, Vision: 0.18, Veterinary: 0.07, Cosmetic: 0.14, Audiology: 0.18, Wellness: 0.25 },
}

const PRODUCT_SHARE = { PLCC: 0.72, PL: 0.28 }

// Channel mix per segment (synthetic). Shares sum to 1 per segment, so with the
// Channel filter on "All channels" the totals are unchanged by the split.
const CHANNEL_SHARE = {
  'Newly Enrolled': { 'Provider Center': 0.46, ISV: 0.24, 'QR Code': 0.3 },
  Stars: { 'Provider Center': 0.58, ISV: 0.31, 'QR Code': 0.11 },
  Consistent: { 'Provider Center': 0.55, ISV: 0.3, 'QR Code': 0.15 },
  'Engagement Exposures': { 'Provider Center': 0.52, ISV: 0.28, 'QR Code': 0.2 },
  'Needs Attention': { 'Provider Center': 0.5, ISV: 0.27, 'QR Code': 0.23 },
  Dormant: { 'Provider Center': 0.5, ISV: 0.25, 'QR Code': 0.25 },
}
// Provider type mix per segment (synthetic). Shares sum to 1 per segment, so with
// the Provider Type filter on "All provider types" totals are unchanged.
const TYPE_SHARE = {
  'Newly Enrolled': { 'Multi-location': 0.16, Independent: 0.6, 'Mid-market': 0.17, 'Large client': 0.07 },
  Stars: { 'Multi-location': 0.26, Independent: 0.4, 'Mid-market': 0.19, 'Large client': 0.15 },
  Consistent: { 'Multi-location': 0.21, Independent: 0.5, 'Mid-market': 0.19, 'Large client': 0.1 },
  'Engagement Exposures': { 'Multi-location': 0.18, Independent: 0.55, 'Mid-market': 0.18, 'Large client': 0.09 },
  'Needs Attention': { 'Multi-location': 0.15, Independent: 0.62, 'Mid-market': 0.15, 'Large client': 0.08 },
  Dormant: { 'Multi-location': 0.12, Independent: 0.7, 'Mid-market': 0.12, 'Large client': 0.06 },
}
// Activity over/under-index by provider type (larger practices transact more).
const TYPE_TILT = { 'Multi-location': 1.08, Independent: 0.9, 'Mid-market': 1.04, 'Large client': 1.18 }
// Activity over/under-index by channel, so rates (not just volumes) differ.
const CHANNEL_TILT = { 'Provider Center': 1.0, ISV: 1.12, 'QR Code': 0.82 }
const ACTIVITY_FIELDS = new Set([
  'active', 'appActive', 'salesActive', 'fullyActive', 'apps', 'approvals',
  'transactions', 'ncs', 'newCH', 'firstTransIn30', 'firstTransIn90',
  'firstPurchases', 'conversions', 'mqls', 'handRaisers', 'repeatApps',
  'repeatTrans', 'reactivated',
])
const SPLIT_FIELDS = [
  'providers', 'inJourney', 'qualified', 'active', 'appActive', 'salesActive',
  'fullyActive', 'apps', 'approvals', 'transactions', 'ncs', 'newCH',
  'firstTransIn30', 'firstTransIn90', 'firstPurchases', 'emailsSent', 'delivered',
  'opens', 'clicks', 'unsubs', 'conversions', 'mqls', 'handRaisers', 'repeatApps',
  'repeatTrans', 'inactive', 'reactivated',
]

// [subset, superset] pairs that must hold inside every cell.
const SUBSET_PAIRS = [['active', 'providers'], ['appActive', 'active'], ['salesActive', 'active'], ['fullyActive', 'appActive'], ['approvals', 'apps']]

/** Keep parts[small][i] <= parts[big][i] by moving any excess to parts with room. */
function capSubset(parts, small, big) {
  const n = parts[small].length
  for (let i = 0; i < n; i++) {
    let excess = parts[small][i] - parts[big][i]
    while (excess > 0) {
      let j = -1, best = 0
      for (let k = 0; k < n; k++) {
        const room = parts[big][k] - parts[small][k]
        if (k !== i && room > best) { best = room; j = k }
      }
      if (j < 0) break
      const mv = Math.min(excess, best)
      parts[small][i] -= mv; parts[small][j] += mv; excess -= mv
    }
  }
}

/** Split an integer across weights so the parts always sum to the total. */
function splitInt(total, weights) {
  const wSum = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (total * w) / wSum)
  const out = raw.map(Math.floor)
  let rem = total - out.reduce((a, b) => a + b, 0)
  const order = raw.map((v, i) => [v - out[i], i]).sort((a, b) => b[0] - a[0])
  for (let k = 0; rem > 0; k = (k + 1) % order.length, rem--) out[order[k][1]]++
  return out
}

// Mild seasonality (elective care dips mid-summer/December, spikes Q1/Q4-start)
const SEASON = [1.06, 1.02, 1.04, 1.0, 0.98, 0.94, 0.92, 0.96, 1.02, 1.05, 1.03, 0.9]

/** The cube: rows keyed segment × industry × product × channel × month */
function buildCube() {
  const rows = []
  for (const seg of SEGMENTS) {
    const prof = SEGMENT_PROFILE[seg]
    for (const ind of INDUSTRIES) {
      const mix = INDUSTRY_MIX[seg][ind]
      for (const prod of PRODUCTS) {
        const share = PRODUCT_SHARE[prod]
        const rng = mulberry32(hashString(`lcm|${seg}|${ind}|${prod}`))
        MONTHS.forEach((month, mi) => {
          const season = SEASON[mi % 12]
          const drift = 1 + prof.growth * mi
          const providers = Math.round(noisy(rng, prof.base * mix * share * drift, 0.03))
          // "In journey" = share of segment enrolled into the LCM journey
          const inJourney = Math.round(providers * range(rng, 0.55, 0.72))
          const qualified = Math.round(inJourney / range(rng, 0.78, 0.9))
          // Activation semantics (round-2 client decision): activated = ≥1 app
          // AND/OR ≥1 transaction. appActive = submitted an app; salesOnly =
          // app-blocked providers who transact without applying; fullyActive =
          // both; active = the union.
          const appActive = Math.round(providers * clamp(prof.appsPer * 0.35 + 0.08, 0.02, 0.85) * range(rng, 0.9, 1.1))
          const fullyActive = Math.round(appActive * range(rng, 0.68, 0.82))
          const salesOnly = Math.round(providers * range(rng, 0.02, 0.05))
          const salesActive = fullyActive + salesOnly
          const active = appActive + salesOnly
          const apps = Math.round(noisy(rng, providers * prof.appsPer * season * (prod === 'PL' ? 0.82 : 1), 0.08))
          const approvals = Math.round(apps * range(rng, 0.62, 0.74))
          const transactions = Math.round(apps * prof.transPerApp * range(rng, 0.92, 1.08))
          const ncs = Math.round(transactions * noisy(rng, prof.avgTicket * (prod === 'PL' ? 0.76 : 1.05), 0.06))
          const newCH = Math.round(approvals * range(rng, 0.86, 0.95))
          const firstTransIn30 = Math.round(newCH * range(rng, 0.52, 0.66))
          const firstTransIn90 = Math.round(newCH * range(rng, 0.72, 0.84))
          const firstPurchases = Math.round(newCH * range(rng, 0.55, 0.7))
          const emailsSent = Math.round(inJourney * range(rng, 3.4, 4.2))
          const delivered = Math.round(emailsSent * range(rng, 0.955, 0.985))
          const opens = Math.round(emailsSent * noisy(rng, prof.openRate, 0.07))
          const clicks = Math.round(opens * noisy(rng, prof.ctor, 0.09))
          const unsubs = Math.round(emailsSent * range(rng, 0.0009, 0.0022))
          const conversions = Math.round(clicks * range(rng, 0.07, 0.13))
          const mqls = Math.round(providers * prof.mqlRate * season * range(rng, 0.85, 1.15))
          const handRaisers = Math.round(mqls * range(rng, 0.55, 0.8))
          const repeatApps = Math.round(apps * (seg === 'Stars' ? 0.46 : seg === 'Consistent' ? 0.38 : 0.22) * range(rng, 0.9, 1.1))
          const repeatTrans = Math.round(transactions * (seg === 'Stars' ? 0.52 : seg === 'Consistent' ? 0.44 : 0.28) * range(rng, 0.9, 1.1))
          // Reactivation flows only meaningful for Needs Attention / Dormant
          // Monthly reactivation shares sized so a 12-month window lands near
          // the doc targets (reactivation conversion 8–20% depending on segment)
          const inactive = Math.round(providers * (seg === 'Needs Attention' ? 0.62 : seg === 'Dormant' ? 0.94 : 0.1))
          const reactivated = Math.round(inactive * (seg === 'Needs Attention' ? range(rng, 0.008, 0.014) : seg === 'Dormant' ? range(rng, 0.0015, 0.0035) : range(rng, 0.004, 0.008)))
          const cell = {
            providers, inJourney, qualified, active, appActive, salesActive,
            fullyActive, apps, approvals, transactions,
            ncs, newCH, firstTransIn30, firstTransIn90, firstPurchases,
            emailsSent, delivered, opens, clicks, unsubs,
            conversions, mqls, handRaisers, repeatApps, repeatTrans,
            inactive, reactivated,
          }
          // Split the cell across channels (separate rng so the draws above are
          // untouched). Each field's parts sum exactly to the original value.
          const chRng = mulberry32(hashString(`lcm-ch|${seg}|${ind}|${prod}|${month}`))
          const w = CHANNELS.map((c) => CHANNEL_SHARE[seg][c] * range(chRng, 0.94, 1.06))
          // Tilt fades as a cell nears 100% active, so no channel can be pushed
          // past its own provider count.
          const headroom = 1 - Math.min(1, cell.active / Math.max(1, cell.providers))
          const wAct = CHANNELS.map((c, i) => w[i] * (1 + (CHANNEL_TILT[c] - 1) * headroom))
          const parts = {}
          for (const f of SPLIT_FIELDS) {
            parts[f] = splitInt(cell[f], ACTIVITY_FIELDS.has(f) ? wAct : w)
          }
          // Safety net: active can never exceed providers within a channel.
          for (let i = 0; i < CHANNELS.length; i++) {
            let excess = parts.active[i] - parts.providers[i]
            while (excess > 0) {
              let j = -1, best = 0
              for (let k = 0; k < CHANNELS.length; k++) {
                const room = parts.providers[k] - parts.active[k]
                if (k !== i && room > best) { best = room; j = k }
              }
              if (j < 0) break
              const mv = Math.min(excess, best)
              parts.active[i] -= mv; parts.active[j] += mv; excess -= mv
            }
          }
          CHANNELS.forEach((channel, ci) => {
            // Split each channel's values across provider types the same way
            // (own rng, so the channel-level figures above are untouched).
            const tRng = mulberry32(hashString(`lcm-pt|${seg}|${ind}|${prod}|${month}|${channel}`))
            const wT = PROVIDER_TYPES.map((t) => TYPE_SHARE[seg][t] * range(tRng, 0.94, 1.06))
            const tHead = 1 - Math.min(1, parts.active[ci] / Math.max(1, parts.providers[ci]))
            const wTAct = PROVIDER_TYPES.map((t, i) => wT[i] * (1 + (TYPE_TILT[t] - 1) * tHead))
            const tParts = {}
            for (const f of SPLIT_FIELDS) {
              tParts[f] = splitInt(parts[f][ci], ACTIVITY_FIELDS.has(f) ? wTAct : wT)
            }
            // Safety net: in every provider type a count can never exceed the
            // count it is a subset of (moves the excess to a type with room).
            for (const [small, big] of SUBSET_PAIRS) capSubset(tParts, small, big)
            PROVIDER_TYPES.forEach((providerType, ti) => {
              const row = { segment: seg, industry: ind, product: prod, channel, providerType, month }
              for (const f of SPLIT_FIELDS) row[f] = tParts[f][ti]
              rows.push(row)
            })
          })
        })
      }
    }
  }
  return rows
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export const CUBE = buildCube()

const SUM_FIELDS = [
  'providers', 'inJourney', 'qualified', 'active', 'appActive', 'salesActive',
  'fullyActive', 'apps', 'approvals',
  'transactions', 'ncs', 'newCH', 'firstTransIn30', 'firstTransIn90',
  'firstPurchases', 'emailsSent', 'delivered', 'opens',
  'clicks', 'unsubs', 'conversions', 'mqls', 'handRaisers', 'repeatApps',
  'repeatTrans', 'inactive', 'reactivated',
]

/**
 * Aggregate the cube under a filter.
 * filter: { segments?, industries?, products?, channels?, providerTypes?, months? } — arrays or undefined (= all)
 */
export function agg(filter = {}) {
  const segs = filter.segments, inds = filter.industries, prods = filter.products, chans = filter.channels, ptypes = filter.providerTypes, months = filter.months
  const out = Object.fromEntries(SUM_FIELDS.map((f) => [f, 0]))
  for (const r of CUBE) {
    if (segs && !segs.includes(r.segment)) continue
    if (inds && !inds.includes(r.industry)) continue
    if (prods && !prods.includes(r.product)) continue
    if (chans && !chans.includes(r.channel)) continue
    if (ptypes && !ptypes.includes(r.providerType)) continue
    if (months && !months.includes(r.month)) continue
    for (const f of SUM_FIELDS) out[f] += r[f]
  }
  // providers/inJourney/etc. are point-in-time counts, not flows — average
  // them over the number of months instead of summing.
  const nMonths = (months ?? MONTHS).length
  for (const f of ['providers', 'inJourney', 'qualified', 'active', 'appActive', 'salesActive', 'fullyActive', 'inactive']) {
    out[f] = Math.round(out[f] / Math.max(1, nMonths))
  }
  return out
}

/** Monthly series of one summed field under a filter (for trendlines). */
export function series(field, filter = {}) {
  const months = filter.months ?? MONTHS
  return months.map((m) => {
    const a = agg({ ...filter, months: [m] })
    return { month: m, value: a[field] }
  })
}

/** Deterministic per-scope helper streams (buckets, migration, emails, TTV). */
function scopeRng(scopeKey) {
  return mulberry32(hashString(`lcm-scope|${scopeKey}`))
}

/** Activation-window distribution over the standard time buckets. */
// Early buckets set to 0–15 / 16–30 / 31–60 (client request); 30-day steps and
// the long tail kept after that.
export const TIME_BUCKETS = ['0–15', '16–30', '31–60', '61–90', '91–120', '121–150', '151–180', '181+']

export function activationBuckets(filter = {}, scopeKey = 'act') {
  const rng = scopeRng(scopeKey + JSON.stringify(filter.industries ?? []))
  const a = agg(filter)
  const weights = [0.2, 0.14, 0.21, 0.13, 0.09, 0.07, 0.06, 0.1].map((w) => w * range(rng, 0.92, 1.08))
  const total = weights.reduce((s, w) => s + w, 0)
  const activated = Math.round(a.active * 1.0)
  return TIME_BUCKETS.map((bucket, i) => ({
    bucket,
    providers: Math.round((activated * weights[i]) / total),
    rate: (weights[i] / total) * (a.providers ? activated / a.providers : 0),
  }))
}

/** Segment migration matrix (prior period → current period) for sankey/tables. */
export function migrationMatrix(filter = {}) {
  const rng = scopeRng('mig' + JSON.stringify([filter.industries, filter.products, ...(filter.channels ? [filter.channels] : []), ...(filter.providerTypes ? [filter.providerTypes] : []), (filter.months ?? []).join(',')]))
  // Stay-rates on the diagonal; movement mass distributed to neighbors.
  const stay = { 'Newly Enrolled': 0.0, Stars: 0.84, Consistent: 0.78, 'Engagement Exposures': 0.72, 'Needs Attention': 0.74, Dormant: 0.88 }
  const flows = []
  for (const from of SEGMENTS) {
    const size = agg({ ...filter, segments: [from] }).providers
    let remaining = size
    const s = from === 'Newly Enrolled' ? 0 : Math.round(size * stay[from] * range(rng, 0.97, 1.03))
    if (s > 0) { flows.push({ from, to: from, providers: s }); remaining -= s }
    const targets = SEGMENTS.filter((t) => t !== from)
    const rawW = targets.map((t) => {
      const di = Math.abs(SEGMENTS.indexOf(t) - SEGMENTS.indexOf(from))
      let w = 1 / (di + 1)
      if (from === 'Newly Enrolled' && (t === 'Consistent' || t === 'Engagement Exposures')) w *= 3.2
      if (from === 'Newly Enrolled' && t === 'Stars') w *= 1.6
      if (t === 'Dormant') w *= 0.5
      return w * range(rng, 0.85, 1.15)
    })
    const wSum = rawW.reduce((x, y) => x + y, 0)
    targets.forEach((t, i) => {
      const p = Math.max(0, Math.round((remaining * rawW[i]) / wSum))
      if (p > 0) flows.push({ from, to: t, providers: p })
    })
  }
  return flows
}

/** Ranked synthetic email list for a journey (top/bottom performers). */
const EMAIL_NAMES = [
  'Welcome to the program', 'Your first application walkthrough', 'Meet your growth dashboard',
  'Patients want payment options', 'Your monthly performance snapshot', 'New: Pay Later for your practice',
  'Three behaviors of top practices', 'Your quarterly benchmark report', 'Staff training in 15 minutes',
  'Unlock your next milestone', 'A patient story worth sharing', 'Your reactivation checklist',
  'We saved your spot', 'What changed since you left', 'Your practice toolkit refresh',
]

export function emailPerformance(filter = {}, scopeKey = 'emails') {
  const rng = scopeRng(scopeKey + JSON.stringify(filter.segments ?? []))
  const a = agg(filter)
  const n = 12
  const rows = Array.from({ length: n }, (_, i) => {
    const sent = Math.round((a.emailsSent / n) * range(rng, 0.6, 1.5))
    const or_ = clamp(noisy(rng, a.emailsSent ? a.opens / a.emailsSent : 0.3, 0.28), 0.05, 0.72)
    const ctor = clamp(noisy(rng, a.opens ? a.clicks / a.opens : 0.12, 0.32), 0.015, 0.4)
    return {
      name: EMAIL_NAMES[i % EMAIL_NAMES.length],
      sent,
      openRate: or_,
      ctor,
      conversions: Math.round(sent * or_ * ctor * range(rng, 0.06, 0.14)),
    }
  })
  return rows.sort((x, y) => y.openRate * y.ctor - x.openRate * x.ctor)
}

/** Top landing pages / URLs by clicks. */
const URLS = [
  '/provider/performance-report', '/enroll/pay-later', '/resources/patient-financing-kit',
  '/training/front-desk-scripts', '/promo/milestone-reward', '/benchmarks/specialty',
  '/reactivate/quick-start', '/materials/order-display-kit',
]

export function topUrls(filter = {}, scopeKey = 'urls') {
  const rng = scopeRng(scopeKey + JSON.stringify(filter.segments ?? []))
  const a = agg(filter)
  return URLS.map((url) => ({ url, clicks: Math.round((a.clicks / URLS.length) * range(rng, 0.4, 1.9)) }))
    .sort((x, y) => y.clicks - x.clicks)
    .slice(0, 5)
}

/**
 * Sales active rate by month vs the same month a year earlier.
 * The cube starts Jan 2025, so prior-year values for 2025 months are modeled
 * (deterministic, slightly below the current rate) — for this chart only.
 */
export function salesActiveYoY(filter = {}) {
  const months = filter.months ?? MONTHS
  const rateFor = (m) => {
    const a = agg({ ...filter, months: [m] })
    return a.providers ? a.salesActive / a.providers : 0
  }
  return months.map((month) => {
    const current = rateFor(month)
    const priorMonth = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`
    if (MONTHS.includes(priorMonth)) {
      return { month, current, prior: rateFor(priorMonth), priorModeled: false }
    }
    const rng = scopeRng(`sa-yoy|${month}|${JSON.stringify(filter.industries ?? [])}`)
    return { month, current, prior: current * range(rng, 0.88, 1.04), priorModeled: true }
  })
}

/** Enrollment source breakdown (sales-led / self-serve / referral / marketing). */
const ENROLL_SOURCES = [
  ['Sales-led', 0.38], ['Self-serve', 0.27], ['Marketing campaign', 0.23], ['Referral', 0.12],
]
// How each source over/under-indexes on sales activity and on ticket size.
const SOURCE_TILT = {
  'Sales-led': { sales: 1.18, ticket: 1.1 },
  'Self-serve': { sales: 0.82, ticket: 0.92 },
  'Marketing campaign': { sales: 0.95, ticket: 0.96 },
  Referral: { sales: 1.12, ticket: 1.05 },
}

export function sourceBreakdown(filter = {}, scopeKey = 'enroll-src') {
  const rng = scopeRng(scopeKey + JSON.stringify(filter.industries ?? []))
  const a = agg(filter)
  const entries = ENROLL_SOURCES.map(([name, w]) => [name, w * range(rng, 0.88, 1.12)])
  const total = entries.reduce((s, [, w]) => s + w, 0)
  // Sales-active providers and NCS are split across sources with the tilts above,
  // so each total reconciles to the dashboard-level figure.
  const tiltRng = scopeRng(scopeKey + 'tilt' + JSON.stringify(filter.industries ?? []))
  const tilts = entries.map(([name]) => ({
    sales: SOURCE_TILT[name].sales * range(tiltRng, 0.97, 1.03),
    ticket: SOURCE_TILT[name].ticket * range(tiltRng, 0.97, 1.03),
  }))
  const salesActive = splitInt(a.salesActive, entries.map(([, w], i) => w * tilts[i].sales))
  const ncs = splitInt(a.ncs, entries.map(([, w], i) => w * tilts[i].sales * tilts[i].ticket))
  const inJourney = splitInt(a.inJourney, entries.map(([, w]) => w))
  return entries.map(([name, w], i) => {
    const providers = Math.round((a.providers * w) / total)
    return {
      name,
      providers,
      share: w / total,
      salesActiveRate: providers ? Math.min(1, salesActive[i] / providers) : 0,
      avgTransPerProvider: inJourney[i] ? ncs[i] / inJourney[i] : 0,
    }
  })
}

/** Time-to-value (days) — enrollment → first app / first transaction. */
export function ttv(filter = {}) {
  const rng = scopeRng('ttv' + JSON.stringify(filter.industries ?? []))
  return {
    ttvApp: Math.round(range(rng, 31, 44)),
    ttvTran: Math.round(range(rng, 52, 71)),
  }
}

/** NPS / CSAT per segment scope. */
export function sentiment(filter = {}) {
  const rng = scopeRng('voc' + JSON.stringify(filter.segments ?? []))
  const seg = (filter.segments ?? [])[0]
  const base = { Stars: 62, Consistent: 48, 'Engagement Exposures': 31, 'Newly Enrolled': 44, 'Needs Attention': 18, Dormant: 8 }[seg] ?? 40
  return {
    nps: Math.round(noisy(rng, base, 0.12)),
    csat: Math.round(clamp(noisy(rng, 3.6 + base / 60, 0.06), 2.8, 4.9) * 10) / 10,
  }
}

/** Deterministic state-level allocation of a scope's providers/sales.
    Granularity and source for the real location cut are open items — this
    exists so the client can react to a concrete rendering of "location". */
const STATE_WEIGHTS = {
  California: 11.7, Texas: 9.1, Florida: 7.8, 'New York': 5.9, Pennsylvania: 3.9,
  Illinois: 3.7, Ohio: 3.5, Georgia: 3.3, 'North Carolina': 3.2, Michigan: 3.0,
}
const OTHER_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'Colorado', 'Connecticut', 'Delaware',
  'Hawaii', 'Idaho', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
  'Maryland', 'Massachusetts', 'Minnesota', 'Mississippi', 'Missouri', 'Montana',
  'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'North Dakota',
  'Oklahoma', 'Oregon', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
  'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]

export function stateBreakdown(filter = {}, scopeKey = 'geo') {
  const rng = scopeRng(scopeKey + JSON.stringify([filter.industries, filter.products, ...(filter.channels ? [filter.channels] : []), ...(filter.providerTypes ? [filter.providerTypes] : [])]))
  const a = agg(filter)
  const entries = [
    ...Object.entries(STATE_WEIGHTS),
    ...OTHER_STATES.map((s) => [s, range(rng, 0.4, 1.6)]),
  ].map(([name, w]) => [name, w * range(rng, 0.85, 1.15)])
  const total = entries.reduce((s, [, w]) => s + w, 0)
  return entries.map(([name, w]) => ({
    name,
    providers: Math.round((a.providers * w) / total),
    ncs: Math.round((a.ncs * w) / total),
  }))
}

/** Control-group comparison for NCS lift (synthetic 'holdout'). */
export function controlComparison(filter = {}) {
  const rng = scopeRng('ctl' + JSON.stringify([filter.segments, (filter.months ?? []).join(',')]))
  const a = agg(filter)
  const liftPct = range(rng, 0.06, 0.16)
  const control = Math.round(a.ncs / (1 + liftPct))
  return { journeyNcs: a.ncs, controlNcs: control, lift: a.ncs - control, liftPct }
}

/** Same months, one year earlier — for YoY benchmark overlays.
    Months without prior-year data return null (gap in the line). */
export function priorYearSeries(field, filter = {}) {
  return (filter.months ?? MONTHS).map((month) => {
    const prior = `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`
    if (!MONTHS.includes(prior)) return { month, value: null }
    const a = agg({ ...filter, months: [prior] })
    return { month, value: a[field] }
  })
}
