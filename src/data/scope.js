// buildScope(dashboardId, filters) → the operand bundle every registry
// equation draws from. The same bundle feeds the charts and the methodology
// panel's worked examples, so the number a reviewer sees on a card and the
// numbers substituted into its equation always agree.

import {
  SEGMENTS, MONTHS, agg, migrationMatrix, ttv, sentiment, controlComparison,
} from './synthetic.js'

export const DASHBOARD_SEGMENTS = {
  'executive-overview': SEGMENTS,
  'newly-enrolled': ['Newly Enrolled'],
  stars: ['Stars'],
  consistent: ['Consistent'],
  'engagement-exposures': ['Engagement Exposures'],
  'needs-attention': ['Needs Attention'],
  dormant: ['Dormant'],
}

// Quality ladder for "upward/downward" migration semantics.
export const RANK = { Stars: 5, Consistent: 4, 'Engagement Exposures': 3, 'Needs Attention': 2, Dormant: 1, 'Newly Enrolled': 0 }

/** Previous window of equal length, immediately before the selected months. */
export function priorWindow(months) {
  const first = MONTHS.indexOf(months[0])
  const n = months.length
  const start = Math.max(0, first - n)
  return MONTHS.slice(start, first)
}

const div = (a, b) => (b ? a / b : 0)

export function buildScope(dashboardId, filters = {}) {
  const segments = DASHBOARD_SEGMENTS[dashboardId] ?? SEGMENTS
  const months = filters.months ?? MONTHS
  const base = { industries: filters.industries, products: filters.products, channels: filters.channels }
  const f = { ...base, segments, months }

  const a = agg(f)
  const prior = agg({ ...base, segments, months: priorWindow(months) })
  const all = agg({ ...base, months })
  const healthy = agg({ ...base, segments: ['Stars', 'Consistent', 'Engagement Exposures'], months })
  const ctl = controlComparison(f)
  const t = ttv(f)
  const voc = sentiment({ ...f, segments })

  // Product split (independent of any product filter, so the split is always visible)
  const plcc = agg({ industries: filters.industries, channels: filters.channels, segments, months, products: ['PLCC'] })
  const pl = agg({ industries: filters.industries, channels: filters.channels, segments, months, products: ['PL'] })

  // Channel split (independent of any channel filter, so the split is always visible)
  const chAgg = (c) => agg({ industries: filters.industries, products: filters.products, segments, months, channels: [c] })
  const pcCh = chAgg('Provider Center')
  const isvCh = chAgg('ISV')
  const qrCh = chAgg('QR Code')

  // Migration flows involving this scope's segments
  const flows = migrationMatrix({ ...base, months })
  let movedUp = 0
  let movedDown = 0
  let retained = 0
  for (const fl of flows) {
    if (!segments.includes(fl.from)) continue
    if (fl.to === fl.from) retained += fl.providers
    else if (RANK[fl.to] > RANK[fl.from]) movedUp += fl.providers
    else movedDown += fl.providers
  }

  const appsPerActive = div(a.apps, a.active)
  const priorAppsPerActive = div(prior.apps, prior.active)
  const avgTicket = div(a.ncs, a.transactions)
  // Lifetime-value model placeholder: avg ticket × lifetime purchase multiplier.
  // Real model TBD with analytics (flagged in the LTV metric's methodology).
  const avgLtv = Math.round(avgTicket * 3.4)

  return {
    ...a,
    // prior period
    priorProviders: prior.providers || Math.round(a.providers * 0.97),
    priorYearProviders: (() => {
      const shifted = months
        .map((m) => `${Number(m.slice(0, 4)) - 1}${m.slice(4)}`)
        .filter((m) => MONTHS.includes(m))
      return shifted.length ? agg({ ...base, segments, months: shifted }).providers : Math.round(a.providers * 0.92)
    })(),
    priorTransactions: prior.transactions,
    priorNcs: prior.ncs,
    priorAppsPerActive: priorAppsPerActive || appsPerActive * 0.96,
    // cross-segment context
    allProviders: all.providers,
    retainedProviders: healthy.providers,
    // control / goal
    controlNcs: ctl.controlNcs,
    goal: Math.round(all.ncs / 0.35),
    // time to value
    ttvApp: t.ttvApp,
    ttvTran: t.ttvTran,
    // sentiment
    nps: voc.nps,
    csat: voc.csat,
    // product split
    plccRate: div(plcc.active, plcc.providers),
    plRate: div(pl.active, pl.providers),
    plccNcs: plcc.ncs,
    plNcs: pl.ncs,
    // channel split
    pcNcs: pcCh.ncs,
    isvNcs: isvCh.ncs,
    qrNcs: qrCh.ncs,
    // migration
    movedUp, movedDown, retained,
    // derived dollars
    avgTicket,
    avgFirstTicket: Math.round(avgTicket * 0.82),
    baselineNcs: Math.round(a.ncs * 2.2),
    postReactNcs: Math.round(avgTicket * a.reactivated * 0.6),
    // segment behavior
    appsPerActive,
    avgActiveMonths: Math.round(60 * Math.min(0.8, Math.max(0.3, appsPerActive / 2))) / 10,
    contentLag: 18 + Math.round(div(a.opens, Math.max(1, a.clicks))),
    // email meta
    emailCount: 12,
    // round-2 additions (activation semantics, LTV, deliverability, reactivation ops)
    appActivePct: div(a.appActive, a.providers),
    salesActivePct: div(a.salesActive, a.providers),
    fullyActivePct: div(a.fullyActive, a.providers),
    avgLtv,
    incrementalLtv: Math.round((a.active + a.reactivated) * avgLtv),
    incrementalLtvPct: div((a.active + a.reactivated) * avgLtv, all.providers * avgLtv),
    deliveryRate: div(a.delivered, a.emailsSent),
    repeatTransPct: div(a.repeatTrans, a.transactions),
    avgTransPerActive: div(a.transactions, a.active),
    suspendedPct: segments.includes('Dormant') ? 0.121 : segments.includes('Needs Attention') ? 0.064 : 0.021,
    avgEmailsToReactivate: segments.includes('Dormant') ? 9.4 : segments.includes('Needs Attention') ? 6.8 : 5.5,
    sunsetted: Math.round(a.inactive * 0.07),
  }
}
