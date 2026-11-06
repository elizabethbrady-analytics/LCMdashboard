// METRIC REGISTRY — single source of truth for every reviewable metric.
//
// Generated from the approved measurement-framework workbook; KPI names,
// module names, and dashboard names follow the client documents verbatim
// (locked). Each entry describes:
//   plain      one-sentence "what this tells you" (concreteness principle)
//   definition formal definition from the framework docs
//   eq         worked equation: text template + operand keys into the scope
//              bundle + calc(scope) → value. The methodology panel substitutes
//              the LIVE filtered values so reviewers see the math, not algebra.
//   measure    how the framework says it should be cut
//   viz        visualization type from the framework
//   source     { plain, system } — human phrasing first, system name second
//
// Scope bundle = agg(filter) + derived rates (see buildScope in scope.js).

const DWH_APP = 'DWH application_fact (enterprise DWH)'
const DWH_TRX = 'DWH transaction_fact / sales tables (enterprise DWH)'
const SEGT = 'Segmentation tables (quarterly refresh)'
const MKTC = 'Marketing Cloud'
const SFDC = 'Salesforce (report — CRM reporting)'

const src = (plain, system) => ({ plain, system })

// Structured provenance (round-2 review): rendered as a chip in the
// methodology panel; keeps definition strings clean for spec export.
const FB_K85 = { source: 'Client feedback', date: '8/5', by: 'client reviewer' }
const FB_R86 = { source: 'Client feedback', date: '8/6', by: 'review session' }
const FB_KA = { source: 'Client feedback', date: '8/5–8/6', by: 'client reviewers' }
const SRC = {
  apps: src('Counted from application records in the data warehouse', DWH_APP),
  trx: src('Summed from transaction records in the data warehouse', DWH_TRX),
  seg: src('Read from the quarterly the segmentation model segmentation tables', SEGT),
  mktc: src('Measured from journey email activity in Marketing Cloud', MKTC),
  sfdc: src('Reported from Salesforce enrollment and lead records', SFDC),
  voc: src('Collected from provider surveys', 'VOC platform (source TBD)'),
}

// ---------------------------------------------------------------------------
// Shared module factories (identical KPI sets repeated across dashboards)
// ---------------------------------------------------------------------------

function joModule(dash) {
  const m = 'Journey Optimization'
  return [
    {
      id: `${dash}.jo.or`, dashboard: dash, module: m, name: 'Overall OR %', viz: 'scorecard',
      plain: 'Of all journey emails delivered, the share that got opened.',
      definition: 'Email open rate across journey sends.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'emails opened ÷ emails delivered', parts: [['Emails opened', 'opens', 'num'], ['Emails delivered', 'emailsSent', 'num']], calc: (s) => s.opens / s.emailsSent, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.ctor`, dashboard: dash, module: m, name: 'Overall CTOR %', viz: 'scorecard',
      plain: 'Of the providers who opened an email, the share that clicked something in it.',
      definition: 'Click-to-open rate across journey sends.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'emails clicked ÷ emails opened', parts: [['Emails clicked', 'clicks', 'num'], ['Emails opened', 'opens', 'num']], calc: (s) => s.clicks / s.opens, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.delivery`, dashboard: dash, module: m, name: 'Delivery rate', viz: 'scorecard', origin: FB_R86,
      plain: 'Of all journey emails sent, the share that actually reached an inbox.',
      definition: 'Delivered emails ÷ sent emails.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'emails delivered ÷ emails sent', parts: [['Emails delivered', 'delivered', 'num'], ['Emails sent', 'emailsSent', 'num']], calc: (s) => s.delivered / s.emailsSent, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.unsub`, dashboard: dash, module: m, name: 'Unsubscribe rate', viz: 'scorecard',
      plain: 'Of all journey emails delivered, the share that led to an unsubscribe.',
      definition: 'Unsubscribes ÷ delivered across journey sends.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'unsubscribes ÷ emails delivered', parts: [['Unsubscribes', 'unsubs', 'num'], ['Emails delivered', 'emailsSent', 'num']], calc: (s) => s.unsubs / s.emailsSent, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.unsubclick`, dashboard: dash, module: m, name: 'Unsubscribe to click rate', viz: 'scorecard',
      plain: 'Of the people who clicked a journey email, how many unsubscribed — a read on whether engaged recipients are opting out.',
      definition: 'Number of unsubscribes ÷ number of unique clicks across journey sends.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'unsubscribes ÷ unique clicks', parts: [['Unsubscribes', 'unsubs', 'num'], ['Unique clicks', 'clicks', 'num']], calc: (s) => s.unsubs / s.clicks, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.conv`, dashboard: dash, module: m, name: 'Conversion rate (to desired goal)', viz: 'scorecard',
      plain: 'Of the providers who clicked, the share that completed the journey’s goal action.',
      definition: 'Journey members completing the desired goal action ÷ clickers.',
      measure: '% overall',
      source: SRC.mktc,
      eq: { text: 'goal completions ÷ emails clicked', parts: [['Goal completions', 'conversions', 'num'], ['Emails clicked', 'clicks', 'num']], calc: (s) => s.conversions / s.clicks, fmtKind: 'pct' },
    },
    {
      id: `${dash}.jo.top5`, dashboard: dash, module: m, name: 'Top 5 performing emails', viz: 'table',
      plain: 'The five journey emails doing the most work, ranked by open and click engagement.',
      definition: 'Emails ranked by combined engagement (open rate × click-to-open).',
      measure: 'Top 5 list',
      source: SRC.mktc,
      eq: { text: 'rank all journey emails by open rate × CTOR, keep the top 5', parts: [['Emails ranked', 'emailCount', 'num']], calc: (s) => s.emailCount, fmtKind: 'num' },
    },
    {
      id: `${dash}.jo.bottom5`, dashboard: dash, module: m, name: 'Top 5 underperforming emails', viz: 'table',
      plain: 'The five journey emails engaging the least — candidates for rewrite or removal.',
      definition: 'Emails ranked by combined engagement, lowest five.',
      measure: 'Bottom 5 list',
      source: SRC.mktc,
      eq: { text: 'rank all journey emails by open rate × CTOR, keep the bottom 5', parts: [['Emails ranked', 'emailCount', 'num']], calc: (s) => s.emailCount, fmtKind: 'num' },
    },
    {
      id: `${dash}.jo.urls`, dashboard: dash, module: m, name: 'Top 5 URLs / clicks (landing pages)', viz: 'table',
      plain: 'The five destinations providers click through to most from journey emails.',
      definition: 'Landing pages ranked by clicks from journey emails.',
      measure: 'Top 5 list',
      source: SRC.mktc,
      eq: { text: 'sum clicks per landing page, keep the top 5', parts: [['Total clicks', 'clicks', 'num']], calc: (s) => s.clicks, fmtKind: 'num' },
    },
  ]
}

function vocModule(dash) {
  const m = 'VOC / Sentiment'
  return [
    {
      id: `${dash}.voc.nps`, dashboard: dash, module: m, name: 'NPS', viz: 'scorecard',
      plain: 'How likely providers in this journey are to recommend the program (−100 to +100).',
      definition: 'Net Promoter Score: % promoters − % detractors among surveyed providers.',
      measure: 'Score',
      source: SRC.voc,
      eq: { text: '% promoters − % detractors', parts: [['NPS', 'nps', 'score']], calc: (s) => s.nps, fmtKind: 'score' },
    },
    {
      id: `${dash}.voc.csat`, dashboard: dash, module: m, name: 'CSAT', viz: 'scorecard',
      plain: 'Average satisfaction score providers give the program (1–5).',
      definition: 'Customer satisfaction score among surveyed providers in this journey.',
      measure: 'Score',
      source: SRC.voc,
      eq: { text: 'average satisfaction rating across survey responses', parts: [['CSAT', 'csat', 'score']], calc: (s) => s.csat, fmtKind: 'score' },
    },
  ]
}

// Executive/funnel rows shared by several segment dashboards
function commonExecRows(dash, opts = {}) {
  const m = opts.moduleName ?? 'Executive / Funnel'
  const rows = [
    {
      id: `${dash}.subs`, dashboard: dash, module: m, name: 'Total subscribers in journey', viz: 'scorecard',
      plain: 'How many providers were in this journey during the selected period.',
      definition: 'Providers subscribed to this journey during the selected period.',
      measure: 'Total',
      source: SRC.mktc,
      eq: { text: 'count of providers in the journey this period', parts: [['Providers in journey', 'inJourney', 'num']], calc: (s) => s.inJourney, fmtKind: 'num' },
    },
    {
      id: `${dash}.ncs`, dashboard: dash, module: m, name: 'Total $ NCS', viz: 'scorecard+trend',
      plain: 'Total Net Credit Sales generated by providers in this journey.',
      definition: 'Net Credit Sales attributed to journey members in the period.',
      measure: 'Total $',
      source: SRC.trx,
      eq: { text: 'sum of Net Credit Sales across journey providers', parts: [['Net Credit Sales', 'ncs', 'usd']], calc: (s) => s.ncs, fmtKind: 'usd' },
    },
    {
      id: `${dash}.ncslift`, dashboard: dash, module: m, name: 'NCS lift %', viz: 'scorecard',
      plain: 'How much more NCS journey providers produced than a comparable holdout group.',
      definition: 'NCS of journey members vs a control group not receiving the journey. Methodology to be finalized with analytics.',
      measure: '% lift vs control',
      source: src('Journey NCS compared against a matched control group', DWH_TRX + ' + control design TBD'),
      eq: { text: '(journey NCS − control NCS) ÷ control NCS', parts: [['Journey NCS', 'ncs', 'usd'], ['Control NCS', 'controlNcs', 'usd']], calc: (s) => (s.ncs - s.controlNcs) / s.controlNcs, fmtKind: 'pct' },
    },
    {
      id: `${dash}.appsper`, dashboard: dash, module: m, name: 'Avg apps / active provider', viz: 'scorecard',
      plain: 'On average, how many applications each active provider submitted.',
      definition: 'Applications ÷ active providers.',
      measure: 'Avg per provider; total overall',
      source: SRC.apps,
      eq: { text: 'applications ÷ active providers', parts: [['Applications', 'apps', 'num'], ['Active providers', 'active', 'num']], calc: (s) => s.apps / s.active, fmtKind: 'num1' },
    },
    ...(opts.noTransPer ? [] : [{
      id: `${dash}.transper`, dashboard: dash, module: m, name: 'Transactions per active provider', viz: 'scorecard',
      plain: 'On average, how many transactions each active provider ran.',
      definition: 'Transactions ÷ active providers.',
      measure: 'Avg per provider; total overall',
      source: SRC.trx,
      eq: { text: 'transactions ÷ active providers', parts: [['Transactions', 'transactions', 'num'], ['Active providers', 'active', 'num']], calc: (s) => s.transactions / s.active, fmtKind: 'num1' },
    }]),
    {
      id: `${dash}.repeat`, dashboard: dash, module: m, name: 'Repeat app %', viz: 'scorecard',
      plain: 'Of all applications, the share that came from providers applying more than once.',
      definition: 'Repeat applications ÷ total applications.',
      measure: '% overall',
      source: SRC.apps,
      eq: { text: 'repeat applications ÷ total applications', parts: [['Repeat applications', 'repeatApps', 'num'], ['Total applications', 'apps', 'num']], calc: (s) => s.repeatApps / s.apps, fmtKind: 'pct' },
    },
    {
      id: `${dash}.mql`, dashboard: dash, module: m, name: 'Total # MQL generated', viz: 'scorecard',
      plain: 'Marketing-qualified leads generated from this journey.',
      definition: 'Total MQLs generated by journey activity in the period.',
      measure: 'Total overall',
      source: SRC.sfdc,
      eq: { text: 'count of MQLs created this period', parts: [['MQLs', 'mqls', 'num']], calc: (s) => s.mqls, fmtKind: 'num' },
    },
    {
      id: `${dash}.hand`, dashboard: dash, module: m, name: 'Total # hand raisers generated', viz: 'scorecard',
      plain: 'Providers who actively asked to be contacted.',
      definition: 'Total hand raisers generated by journey activity in the period.',
      measure: 'Total overall',
      source: SRC.sfdc,
      eq: { text: 'count of hand raisers this period', parts: [['Hand raisers', 'handRaisers', 'num']], calc: (s) => s.handRaisers, fmtKind: 'num' },
    },
    {
      id: `${dash}.handopen`, dashboard: dash, module: m, name: 'Hand raiser to open rate', viz: 'scorecard',
      plain: 'For every unique open of a journey email, how many unique hand raisers were generated.',
      definition: 'Number of unique hand raisers ÷ number of unique opens across journey sends.',
      measure: '% overall',
      source: SRC.sfdc,
      eq: { text: 'unique hand raisers ÷ unique opens', parts: [['Unique hand raisers', 'handRaisers', 'num'], ['Unique opens', 'opens', 'num']], calc: (s) => s.handRaisers / s.opens, fmtKind: 'pct2' },
    },
    {
      id: `${dash}.migration`, dashboard: dash, module: m, name: 'Segment migration', viz: 'highlight table / destination bars',
      plain: 'Where providers in this journey moved in segmentation — stayed, moved up, or dropped.',
      definition: opts.migrationDef ?? 'Movement between the segmentation model segments: prior period vs current period, count and % per destination.',
      measure: 'Count & % by destination segment',
      source: SRC.seg,
      eq: { text: 'providers per destination segment ÷ providers at period start', parts: [['Providers at period start', 'providers', 'num']], calc: (s) => s.providers, fmtKind: 'num' },
    },
    {
      id: `${dash}.product`, dashboard: dash, module: m, name: opts.productName ?? 'Product activation (PLCC vs PL)', viz: 'two scorecards (PLCC, PL)',
      plain: 'Activation split by product: private label credit card vs Pay Later.',
      definition: 'Total activation rate PLCC; total activation rate PL. OPEN: definition of "activation" at the product level to be confirmed.',
      measure: 'Rate per product',
      source: SRC.apps,
      split: [{ label: 'PLCC', key: 'plccRate' }, { label: 'PL (Pay Later)', key: 'plRate' }],
      eq: { text: 'activated on product ÷ enrolled on product, for PLCC and PayLater separately', parts: [['PLCC activation rate', 'plccRate', 'pct'], ['PL activation rate', 'plRate', 'pct']], calc: (s) => s.plccRate, fmtKind: 'pct' },
    },
  ]
  if (opts.avgTrans) {
    rows.splice(3, 0, {
      id: `${dash}.avgtrans`, dashboard: dash, module: m, name: 'Avg Trans $ / provider', viz: 'scorecard',
      plain: 'On average, how many transaction dollars each provider produced.',
      definition: 'NCS ÷ providers in journey.',
      measure: 'Avg $',
      source: SRC.trx,
      eq: { text: 'Net Credit Sales ÷ providers', parts: [['Net Credit Sales', 'ncs', 'usd'], ['Providers', 'inJourney', 'num']], calc: (s) => s.ncs / s.inJourney, fmtKind: 'usd' },
    })
  }
  return rows
}

// ---------------------------------------------------------------------------
// 1. Overall Executive View
// ---------------------------------------------------------------------------
const EXEC = 'executive-overview'
const execView = [
  {
    id: `${EXEC}.entered`, dashboard: EXEC, module: 'Executive View', name: 'Total subscribers that entered journey', viz: 'scorecard',
    plain: 'How many providers entered any LCM journey — shown against the qualified pool they came from.',
    definition: 'Providers entering LCM journeys: total qualified vs in actual journey. This is the total MID count combined across all journeys (client-confirmed).',
    measure: 'Total; qualified vs in-journey',
    source: SRC.mktc,
    eq: { text: 'count of providers in journey (of the qualified pool)', parts: [['In journey', 'inJourney', 'num'], ['Qualified', 'qualified', 'num']], calc: (s) => s.inJourney, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.activated`, dashboard: EXEC, module: 'Executive View', name: 'Total activated providers', viz: 'scorecard+trend+table',
    plain: 'Providers who have submitted at least one application and/or run at least one transaction.',
    definition: 'Activated = ≥1 application AND/OR ≥1 transaction (provider level). Transaction-only activation covers app-blocked providers under local restrictions/laws.',
    measure: 'Total; % of total; by industry; by activation channel',
    source: SRC.apps,
    eq: { text: 'count of providers with ≥1 application and/or ≥1 transaction', parts: [['Activated providers', 'active', 'num']], calc: (s) => s.active, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.fullyact`, dashboard: EXEC, module: 'Executive View', name: 'Fully activated providers (app + transaction)', viz: 'scorecard', origin: FB_KA,
    plain: 'Providers who have BOTH submitted an application and run a transaction — the stricter cut alongside the and/or headline.',
    definition: 'Providers with ≥1 application AND ≥1 transaction — the stricter cut, kept alongside the and/or headline so both readings stay visible.',
    measure: 'Total; % of enrolled',
    source: SRC.apps,
    eq: { text: 'providers with both an application and a transaction', parts: [['Fully activated', 'fullyActive', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.fullyActive, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.actrate`, dashboard: EXEC, module: 'Executive View', name: 'Activation rate', viz: 'scorecard+buckets',
    plain: 'Of every 100 enrolled providers, how many have activated (first application and/or first transaction).',
    definition: 'Total activated providers ÷ total enrolled providers (activated = ≥1 app and/or ≥1 transaction).',
    measure: '% overall; % by time bucket (7/15/30/45/60/90/120/150/180/181+)',
    source: SRC.apps,
    eq: { text: 'activated providers ÷ enrolled providers', parts: [['Activated providers', 'active', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.active / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.retention`, dashboard: EXEC, module: 'Executive View', name: 'Retention rate', viz: 'scorecard',
    plain: 'The share of the provider base sitting in the healthy segments (Stars, Consistent, Engagement Exposures).',
    definition: 'Combined Stars, Consistent & Engagement Exposure. (Formula open: framework workbook also defines retention as “active in current AND previous period.”)',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: '(Stars + Consistent + Engagement Exposures providers) ÷ all providers', parts: [['Healthy-segment providers', 'retainedProviders', 'num'], ['All providers', 'allProviders', 'num']], calc: (s) => s.retainedProviders / s.allProviders, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.reactivation`, dashboard: EXEC, module: 'Executive View', name: 'Reactivation rate', viz: 'scorecard', concept: 'reactivation-rate',
    plain: 'Of the inactive providers (Needs Attention + Dormant), the share that came back — sales active and/or app active.',
    definition: 'Combined Needs Attention & Dormant, aggregate. Reactivated = sales active and/or app active.',
    measure: '% overall (aggregate)',
    source: SRC.seg,
    eq: { text: 'reactivated providers ÷ inactive providers', parts: [['Reactivated providers', 'reactivated', 'num'], ['Inactive providers', 'inactive', 'num']], calc: (s) => s.reactivated / s.inactive, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.ncs`, dashboard: EXEC, module: 'Executive View', name: 'Total $ NCS', viz: 'scorecard+trend',
    plain: 'Total Net Credit Sales across all LCM journeys in the period.',
    definition: 'Net Credit Sales attributed to journeys.',
    measure: 'Total $',
    source: SRC.trx,
    eq: { text: 'sum of Net Credit Sales across journey providers', parts: [['Net Credit Sales', 'ncs', 'usd']], calc: (s) => s.ncs, fmtKind: 'usd' },
  },
  {
    id: `${EXEC}.ncslift`, dashboard: EXEC, module: 'Executive View', name: 'NCS lift %', viz: 'scorecard',
    plain: 'How much more NCS journey providers produced than a comparable control group.',
    definition: 'Total revenue to journeys vs control; overall incremental lift; lift attributed to campaign/journey. Methodology to be finalized with analytics.',
    measure: '% lift vs control',
    source: src('Journey NCS compared against a matched control group', DWH_TRX + ' + control design TBD'),
    eq: { text: '(journey NCS − control NCS) ÷ control NCS', parts: [['Journey NCS', 'ncs', 'usd'], ['Control NCS', 'controlNcs', 'usd']], calc: (s) => (s.ncs - s.controlNcs) / s.controlNcs, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.goals`, dashboard: EXEC, module: 'Executive View', name: 'Contribution to goals %', viz: 'scorecard',
    plain: 'The share of the business goal that LCM journeys account for.',
    definition: 'Share of business goals attributable to LCM. OPEN: no clear attribution model exists yet for the journey NCS number — approach to be defined with analytics.',
    measure: '% of goal',
    source: src('Journey NCS measured against the period business goal', 'Goal source TBD'),
    eq: { text: 'journey NCS ÷ period goal', parts: [['Journey NCS', 'ncs', 'usd'], ['Period goal', 'goal', 'usd']], calc: (s) => s.ncs / s.goal, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.activepct`, dashboard: EXEC, module: 'Executive View', name: 'Total Sales Active Providers %', viz: 'scorecard', origin: FB_K85,
    plain: 'Of the whole provider base, the share that ran at least one transaction this period.',
    definition: 'Sales-active providers (≥1 transaction) as a share of the total provider base.',
    measure: '% overall',
    source: SRC.trx,
    eq: { text: 'sales-active providers ÷ total provider base', parts: [['Sales-active providers', 'salesActive', 'num'], ['Provider base', 'allProviders', 'num']], calc: (s) => s.salesActive / s.allProviders, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.appactivepct`, dashboard: EXEC, module: 'Executive View', name: 'Total App Active Providers %', viz: 'scorecard', origin: FB_K85,
    plain: 'Of the whole provider base, the share that submitted at least one application this period.',
    definition: 'App-active providers (≥1 application) as a share of the total provider base. Companion to Total Sales Active Providers %.',
    measure: '% overall',
    source: SRC.apps,
    eq: { text: 'app-active providers ÷ total provider base', parts: [['App-active providers', 'appActive', 'num'], ['Provider base', 'allProviders', 'num']], calc: (s) => s.appActive / s.allProviders, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.ltv`, dashboard: EXEC, module: 'Executive View', name: 'Incremental LTV', viz: 'scorecard', origin: FB_KA, modeled: true,
    plain: 'The lifetime value added by providers the journeys activated or reactivated this period.',
    definition: '(Activated + reactivated providers) × average provider LTV. LTV model is a placeholder (avg ticket × lifetime purchase multiplier) — final model to be defined with analytics.',
    measure: 'Total $; % of base LTV (small font)',
    source: src('Activated and reactivated provider counts × the average provider lifetime value', 'DWH + LTV model TBD'),
    eq: { text: '(activated + reactivated) × average provider LTV', parts: [['Activated providers', 'active', 'num'], ['Reactivated providers', 'reactivated', 'num'], ['Avg provider LTV', 'avgLtv', 'usd']], calc: (s) => (s.active + s.reactivated) * s.avgLtv, fmtKind: 'usd' },
  },
  {
    id: `${EXEC}.firstpurchase`, dashboard: EXEC, module: 'Executive View', name: 'First Purchase (cardholder first transaction)', viz: 'scorecard+trend', origin: FB_KA,
    plain: 'How many new cardholders made their first purchase — counted per month.',
    definition: 'Cardholder first transactions (activated cardholders), # per month.',
    measure: 'Total per month',
    source: src('First transaction records for new cardholder accounts', 'DWH (application + transaction join)'),
    eq: { text: 'count of cardholder first transactions in the period', parts: [['First purchases', 'firstPurchases', 'num']], calc: (s) => s.firstPurchases, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.unsub`, dashboard: EXEC, module: 'Executive View', name: 'Unsubscribe rate', viz: 'scorecard', origin: FB_K85,
    plain: 'Across all journeys, the share of delivered emails that led to an unsubscribe.',
    definition: 'Unsubscribes ÷ delivered across all journey sends.',
    measure: '% overall',
    source: SRC.mktc,
    eq: { text: 'unsubscribes ÷ emails delivered', parts: [['Unsubscribes', 'unsubs', 'num'], ['Emails delivered', 'emailsSent', 'num']], calc: (s) => s.unsubs / s.emailsSent, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.unsubclick`, dashboard: EXEC, module: 'Executive View', name: 'Unsubscribe to click rate', viz: 'scorecard',
    plain: 'Across all journeys, of the people who clicked an email, how many unsubscribed.',
    definition: 'Number of unsubscribes ÷ number of unique clicks across all journey sends.',
    measure: '% overall',
    source: SRC.mktc,
    eq: { text: 'unsubscribes ÷ unique clicks', parts: [['Unsubscribes', 'unsubs', 'num'], ['Unique clicks', 'clicks', 'num']], calc: (s) => s.unsubs / s.clicks, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.appsper`, dashboard: EXEC, module: 'Executive View', name: 'Avg apps / active provider', viz: 'scorecard+trend',
    plain: 'On average, how many applications each active provider submitted.',
    definition: 'Applications ÷ active providers.',
    measure: 'Avg per provider; total overall',
    source: SRC.apps,
    eq: { text: 'applications ÷ active providers', parts: [['Applications', 'apps', 'num'], ['Active providers', 'active', 'num']], calc: (s) => s.apps / s.active, fmtKind: 'num1' },
  },
  {
    id: `${EXEC}.transper`, dashboard: EXEC, module: 'Executive View', name: 'Transactions per active provider', viz: 'scorecard+trend',
    plain: 'On average, how many transactions each active provider ran.',
    definition: 'Transactions ÷ active providers.',
    measure: 'Avg per provider; total overall',
    source: SRC.trx,
    eq: { text: 'transactions ÷ active providers', parts: [['Transactions', 'transactions', 'num'], ['Active providers', 'active', 'num']], calc: (s) => s.transactions / s.active, fmtKind: 'num1' },
  },
  {
    id: `${EXEC}.repeat`, dashboard: EXEC, module: 'Executive View', name: 'Repeat app %', viz: 'scorecard',
    plain: 'Of all applications, the share from providers applying more than once.',
    definition: 'Repeat applications ÷ total applications.',
    measure: '% overall',
    source: SRC.apps,
    eq: { text: 'repeat applications ÷ total applications', parts: [['Repeat applications', 'repeatApps', 'num'], ['Total applications', 'apps', 'num']], calc: (s) => s.repeatApps / s.apps, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.mql`, dashboard: EXEC, module: 'Executive View', name: 'Total # MQL generated', viz: 'scorecard',
    plain: 'Marketing-qualified leads generated across all journeys.',
    definition: 'Total MQLs generated in the period.',
    measure: 'Total overall',
    source: SRC.sfdc,
    eq: { text: 'count of MQLs created this period', parts: [['MQLs', 'mqls', 'num']], calc: (s) => s.mqls, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.hand`, dashboard: EXEC, module: 'Executive View', name: 'Total # hand raiser generated', viz: 'scorecard',
    plain: 'Providers who actively asked to be contacted.',
    definition: 'Total hand raisers generated in the period.',
    measure: 'Total overall',
    source: SRC.sfdc,
    eq: { text: 'count of hand raisers this period', parts: [['Hand raisers', 'handRaisers', 'num']], calc: (s) => s.handRaisers, fmtKind: 'num' },
  },
  {
    id: `${EXEC}.handopen`, dashboard: EXEC, module: 'Executive View', name: 'Hand raiser to open rate', viz: 'scorecard',
    plain: 'Across all journeys, for every unique open of an email, how many unique hand raisers were generated.',
    definition: 'Number of unique hand raisers ÷ number of unique opens across all journey sends.',
    measure: '% overall',
    source: SRC.sfdc,
    eq: { text: 'unique hand raisers ÷ unique opens', parts: [['Unique hand raisers', 'handRaisers', 'num'], ['Unique opens', 'opens', 'num']], calc: (s) => s.handRaisers / s.opens, fmtKind: 'pct2' },
  },
  {
    id: `${EXEC}.migration`, dashboard: EXEC, module: 'Executive View', name: 'Segment migration', viz: 'highlight table + scorecards',
    plain: 'How many providers each segment gained or lost vs the prior period — and where the newly enrolled landed.',
    definition: 'Total providers in each segment prior period vs this period, % change, drops, upward migration; plus # and % of newly enrolled falling into the current period.',
    measure: 'Count & % change per segment',
    source: SRC.seg,
    eq: { text: '(providers this period − prior period) ÷ prior period, per segment', parts: [['Providers this period', 'providers', 'num'], ['Providers prior period', 'priorProviders', 'num']], calc: (s) => (s.providers - s.priorProviders) / s.priorProviders, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.productmix`, dashboard: EXEC, module: 'Executive View', name: 'Total product mix (PLCC / PayLater)', viz: '100% stacked bar', origin: FB_K85,
    plain: 'How Net Credit Sales split across products — PLCC and PayLater.',
    definition: 'NCS share by product: PLCC and PayLater.',
    measure: '% share per product',
    source: SRC.trx,
    eq: { text: 'NCS per product ÷ total NCS', parts: [['PLCC NCS', 'plccNcs', 'usd'], ['PayLater NCS', 'plNcs', 'usd']], calc: (s) => s.plccNcs / (s.plccNcs + s.plNcs), fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.channelmix`, dashboard: EXEC, module: 'Executive View', name: 'Total channel mix (Provider Center / ISV / QR Code)', viz: '100% stacked bar',
    plain: 'How Net Credit Sales split across enrollment channels — Provider Center, ISV, and QR Code.',
    definition: 'NCS share by channel: Provider Center, ISV, and QR Code.',
    measure: '% share per channel',
    source: SRC.trx,
    eq: { text: 'NCS per channel ÷ total NCS', parts: [['Provider Center NCS', 'pcNcs', 'usd'], ['ISV NCS', 'isvNcs', 'usd'], ['QR Code NCS', 'qrNcs', 'usd']], calc: (s) => s.pcNcs / (s.pcNcs + s.isvNcs + s.qrNcs), fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.or`, dashboard: EXEC, module: 'Executive View', name: 'Overall OR %', viz: 'scorecard',
    plain: 'Across all journeys, the share of delivered emails that got opened.',
    definition: 'Open rate across all journey sends.',
    measure: '% overall',
    source: SRC.mktc,
    eq: { text: 'emails opened ÷ emails delivered', parts: [['Emails opened', 'opens', 'num'], ['Emails delivered', 'emailsSent', 'num']], calc: (s) => s.opens / s.emailsSent, fmtKind: 'pct' },
  },
  {
    id: `${EXEC}.ctor`, dashboard: EXEC, module: 'Executive View', name: 'Overall CTOR %', viz: 'scorecard',
    plain: 'Of providers who opened an email, the share that clicked.',
    definition: 'Click-to-open rate across all journey sends.',
    measure: '% overall',
    source: SRC.mktc,
    eq: { text: 'emails clicked ÷ emails opened', parts: [['Emails clicked', 'clicks', 'num'], ['Emails opened', 'opens', 'num']], calc: (s) => s.clicks / s.opens, fmtKind: 'pct' },
  },
]

// ---------------------------------------------------------------------------
// 2. Newly Enrolled
// ---------------------------------------------------------------------------
const NE = 'newly-enrolled'
const neExec = [
  ...commonExecRows(NE, { migrationDef: 'Once done with the journey, where providers fall in segmentation, and when.' }),
  {
    id: `${NE}.actrate`, dashboard: NE, module: 'Executive / Funnel', name: 'Activation rate', viz: 'scorecard',
    plain: 'Of every 100 newly enrolled providers, how many activated (first application and/or first transaction).',
    definition: 'Activated (≥1 app and/or ≥1 transaction) ÷ enrolled.',
    measure: '% overall',
    source: SRC.apps,
    eq: { text: 'activated providers ÷ enrolled providers', parts: [['Activated providers', 'active', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.active / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${NE}.appactrate`, dashboard: NE, module: 'Executive / Funnel', name: 'App activation rate', viz: 'scorecard', origin: FB_K85,
    plain: 'Of enrolled providers, the share activated via a submitted application.',
    definition: 'App-active providers (≥1 application) ÷ enrolled.',
    measure: '% overall',
    source: SRC.apps,
    eq: { text: 'app-active providers ÷ enrolled providers', parts: [['App-active providers', 'appActive', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.appActive / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${NE}.salesactrate`, dashboard: NE, module: 'Executive / Funnel', name: 'Sales activation rate', viz: 'scorecard', origin: FB_K85,
    plain: 'Of enrolled providers, the share activated via a transaction.',
    definition: 'Sales-active providers (≥1 transaction) ÷ enrolled.',
    measure: '% overall',
    source: SRC.trx,
    eq: { text: 'sales-active providers ÷ enrolled providers', parts: [['Sales-active providers', 'salesActive', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.salesActive / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${NE}.ncsperact`, dashboard: NE, module: 'Executive / Funnel', name: 'Avg NCS per activated provider', viz: 'scorecard', origin: FB_K85,
    plain: 'The average Net Credit Sales each activated provider produced.',
    definition: 'NCS ÷ activated providers.',
    measure: 'Avg $',
    source: SRC.trx,
    eq: { text: 'Net Credit Sales ÷ activated providers', parts: [['Net Credit Sales', 'ncs', 'usd'], ['Activated providers', 'active', 'num']], calc: (s) => s.ncs / s.active, fmtKind: 'usd' },
  },
  {
    id: `${NE}.firstch`, dashboard: NE, module: 'Executive / Funnel', name: 'First transaction CH', viz: 'scorecard', origin: FB_K85,
    plain: 'New cardholders who made their first purchase this period.',
    definition: 'Cardholder first transactions in the period.',
    measure: 'Total',
    source: src('First transaction records for new cardholder accounts', 'DWH (application + transaction join)'),
    eq: { text: 'count of cardholder first transactions', parts: [['First purchases', 'firstPurchases', 'num']], calc: (s) => s.firstPurchases, fmtKind: 'num' },
  },
  {
    id: `${NE}.ttvapp`, dashboard: NE, module: 'Executive / Funnel', name: 'TTV-App', viz: 'scorecard',
    plain: 'The average number of days from enrollment to a provider’s first application.',
    definition: 'Avg days enrollment → 1st application.',
    measure: 'Avg days',
    source: src('Days between the enrollment date and the first application record', 'Salesforce / DWH'),
    eq: { text: 'average of (first application date − enrollment date) across providers', parts: [['TTV-App', 'ttvApp', 'days']], calc: (s) => s.ttvApp, fmtKind: 'days' },
  },
  {
    id: `${NE}.ttvtran`, dashboard: NE, module: 'Executive / Funnel', name: 'TTV-Tran', viz: 'scorecard',
    plain: 'The average number of days from enrollment to a provider’s first transaction.',
    definition: 'Avg days enrollment → 1st transaction.',
    measure: 'Avg days',
    source: src('Days between the enrollment date and the first transaction record', 'Salesforce / DWH'),
    eq: { text: 'average of (first transaction date − enrollment date) across providers', parts: [['TTV-Tran', 'ttvTran', 'days']], calc: (s) => s.ttvTran, fmtKind: 'days' },
  },
]

const NE_DD = 'Activation Deep Dive'
const ddRow = (key, name, plain, definition, measure, sourceObj, eq, viz = 'table') => ({
  id: `${NE}.dd.${key}`, dashboard: NE, module: NE_DD, name, plain, definition, measure, source: sourceObj, eq, viz,
})
const neDeepDive = [
  ddRow('practice', 'Practice industry / location / size (generated sales)', 'What kinds of practices are enrolling, and the sales they generate.', 'Enrollment counts and generated sales by practice industry, location, and size.', 'Total by industry', SRC.sfdc,
    { text: 'group enrollments by practice attributes, sum sales per group', parts: [['Enrolled providers', 'providers', 'num']], calc: (s) => s.providers, fmtKind: 'num' }),
  ddRow('location', 'Practice location (generated sales)', 'Where enrolling practices are — the location cut of the practice industry/location/size KPI, made concrete for review.', 'Enrollments and generated sales by practice location. OPEN QUESTION for this review: is a geographic cut useful, and at what granularity (state / DMA / market)? Source would be the practice address on the Salesforce enrollment record. Shown here at state level with synthetic allocation.', 'Total by location (granularity TBD)', src('Practice address on the Salesforce enrollment record', 'Salesforce (granularity and source field TBD)'),
    { text: 'group enrollments and NCS by practice state', parts: [['Enrolled providers', 'providers', 'num'], ['Net Credit Sales', 'ncs', 'usd']], calc: (s) => s.providers, fmtKind: 'num' }, 'map'),
  ddRow('enrollcount', 'Total enrollment count', 'Total enrollments in the period, by industry.', 'Total enrollment count by industry.', 'Total by industry', SRC.sfdc,
    { text: 'count of enrollments in period', parts: [['Enrollments', 'providers', 'num']], calc: (s) => s.providers, fmtKind: 'num' }),
  ddRow('enrollsource', 'Enrollment source', 'Where enrollments come from: sales-led, self-serve, referral, or marketing campaign.', 'Sales-led / self-serve / referral / marketing campaign — total by industry.', 'Total by industry', SRC.sfdc,
    { text: 'count enrollments per source channel', parts: [['Enrollments', 'providers', 'num']], calc: (s) => s.providers, fmtKind: 'num' }),
  ddRow('ttvapp', 'TTV-App by industry', 'Which industries get to a first application fastest.', 'Avg days enrollment → 1st application, by industry.', 'Avg days by industry', src('Days between enrollment and first application, averaged per industry', 'Salesforce / DWH'),
    { text: 'average days (enrollment → first app) per industry', parts: [['TTV-App', 'ttvApp', 'days']], calc: (s) => s.ttvApp, fmtKind: 'days' }),
  ddRow('ttvtran', 'TTV-Tran by industry', 'Which industries get to a first transaction fastest.', 'Avg days enrollment → 1st transaction, by industry.', 'Avg days by industry', src('Days between enrollment and first transaction, averaged per industry', 'Salesforce / DWH'),
    { text: 'average days (enrollment → first transaction) per industry', parts: [['TTV-Tran', 'ttvTran', 'days']], calc: (s) => s.ttvTran, fmtKind: 'days' }),
  ddRow('actbucket', 'Activation rate % by time bucket', 'How activation accumulates: weekly at first, then 15/30-day steps out to 180 and beyond.', 'Activated = ≥1 app and/or transaction; buckets 7/15/30/45/60/90/120/150/180/181+, by industry.', '% by bucket, by industry', SRC.apps,
    { text: 'activated within bucket ÷ enrolled, per bucket', parts: [['Activated providers', 'active', 'num'], ['Enrolled providers', 'providers', 'num']], calc: (s) => s.active / s.providers, fmtKind: 'pct' }),
  ddRow('appsbucket', 'Avg applications per active account by time bucket', 'How application volume builds over a provider’s first months.', 'Avg applications per active account by time bucket, by industry.', 'Avg by bucket, by industry', SRC.apps,
    { text: 'applications ÷ active accounts, per bucket', parts: [['Applications', 'apps', 'num'], ['Active accounts', 'active', 'num']], calc: (s) => s.apps / s.active, fmtKind: 'num1' }),
  ddRow('transbucket', 'Avg transactions per active account by time bucket', 'How transaction volume builds over a provider’s first months.', 'Avg transactions per active account by time bucket, by industry.', 'Avg by bucket, by industry', SRC.trx,
    { text: 'transactions ÷ active accounts, per bucket', parts: [['Transactions', 'transactions', 'num'], ['Active accounts', 'active', 'num']], calc: (s) => s.transactions / s.active, fmtKind: 'num1' }),
  ddRow('approval', 'Avg application approval rate per active account', 'Of applications submitted, the share approved.', 'Approvals ÷ applications, per active account, by industry.', '% by industry', SRC.apps,
    { text: 'approved applications ÷ submitted applications', parts: [['Approvals', 'approvals', 'num'], ['Applications', 'apps', 'num']], calc: (s) => s.approvals / s.apps, fmtKind: 'pct' }),
  ddRow('newch', 'New CH accounts created by time bucket', 'New cardholder accounts opened, by activation window.', 'New cardholder accounts by time bucket, by industry.', 'Total by bucket, by industry', SRC.apps,
    { text: 'count of new cardholder accounts, per bucket', parts: [['New CH accounts', 'newCH', 'num']], calc: (s) => s.newCH, fmtKind: 'num' }),
  ddRow('ch30', '% of new CH accounts that transact within 30 days', 'Of the new cardholder accounts, the share that used the card within a month.', 'New CH accounts transacting within 30 days of account creation ÷ new CH accounts, by industry.', '% by industry', src('Joins new-account records to their first transaction', 'DWH (application + transaction join)'),
    { text: 'new CH accounts transacting ≤30 days ÷ new CH accounts', parts: [['Transacted within 30 days', 'firstTransIn30', 'num'], ['New CH accounts', 'newCH', 'num']], calc: (s) => s.firstTransIn30 / s.newCH, fmtKind: 'pct' }),
  ddRow('firsttrans', 'Avg $ first transaction for new CH accounts', 'The typical size of a new cardholder’s first purchase.', 'Average first-transaction dollars for new CH accounts, by industry.', 'Avg $ by industry', src('First transaction amounts from the health & wellness platform tables', 'DWH / platform pre-built tables'),
    { text: 'sum of first-transaction $ ÷ new CH accounts', parts: [['Avg first transaction', 'avgFirstTicket', 'usd']], calc: (s) => s.avgFirstTicket, fmtKind: 'usd' }),
  ddRow('ncstotal', 'Total NCS per active account', 'Total Net Credit Sales, viewed per active account.', 'Total NCS per active account, by industry.', 'Total $ by industry', SRC.trx,
    { text: 'sum of Net Credit Sales across active accounts', parts: [['Net Credit Sales', 'ncs', 'usd']], calc: (s) => s.ncs, fmtKind: 'usd' }),
  ddRow('ncsavg', 'Avg $ NCS per active account', 'The average Net Credit Sales each active account produced.', 'Avg NCS per active account, by industry.', 'Avg $ by industry', SRC.trx,
    { text: 'Net Credit Sales ÷ active accounts', parts: [['Net Credit Sales', 'ncs', 'usd'], ['Active accounts', 'active', 'num']], calc: (s) => s.ncs / s.active, fmtKind: 'usd' }),
  ddRow('channel', 'Activation channel breakdown % (measured at Day 90)', 'Which channels providers activate through, snapshotted at day 90.', 'Activation channel breakdown %, measured at Day 90, by industry.', '% by channel, by industry', src('Activation events attributed to channel in the data warehouse', 'DWH'),
    { text: 'activations per channel ÷ total activations, at day 90', parts: [['Activated providers', 'active', 'num']], calc: (s) => s.active, fmtKind: 'num' }),
  ddRow('ncschannel', 'NCS per activation channel', 'How much NCS each activation channel produces.', 'NCS per activation channel, by industry.', 'Total $ by channel, by industry', src('NCS joined to the provider’s activation channel', 'DWH'),
    { text: 'sum of NCS per activation channel', parts: [['Net Credit Sales', 'ncs', 'usd']], calc: (s) => s.ncs, fmtKind: 'usd' }),
  ddRow('ttvchannel', 'TTV by activation channel', 'Which activation channels get providers to value fastest.', 'TTV-App and TTV-Tran per activation channel.', 'Avg days by channel', src('Time-to-value averaged per activation channel', 'DWH'),
    { text: 'average TTV-App and TTV-Tran per channel', parts: [['TTV-App', 'ttvApp', 'days'], ['TTV-Tran', 'ttvTran', 'days']], calc: (s) => s.ttvApp, fmtKind: 'days' }),
]

// ---------------------------------------------------------------------------
// 3. Stars   4. Consistent   5. Engagement Exposures   6. Needs Attention / Dormant
// ---------------------------------------------------------------------------
const ST = 'stars'
const starsRows = [
  ...commonExecRows(ST, { avgTrans: true, migrationDef: 'Movement view: how many stayed in Stars, dropped to other segments, etc.' }),
  {
    id: `${ST}.retention`, dashboard: ST, module: 'Executive / Funnel', name: 'Retention rate', viz: 'scorecard', concept: 'retention-rate',
    plain: 'Of the providers who were Stars last period, the share still active this period.',
    definition: 'Providers active in current and previous period ÷ providers active in previous period.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers active in both periods ÷ providers active last period', parts: [['Active both periods', 'retained', 'num'], ['Active last period', 'priorProviders', 'num']], calc: (s) => s.retained / s.priorProviders, fmtKind: 'pct' },
  },
  {
    id: `${ST}.churn`, dashboard: ST, module: 'Segment KPIs', name: 'Churn rate', viz: 'scorecard', origin: FB_K85, concept: 'churn-rate',
    plain: 'The share of Stars that dropped to any other segment — the migration view shows where they went.',
    definition: '% of Stars providers that dropped from the Star segment to any other segment; pair with the migration view for destinations.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: '(Stars at period start − Stars that stayed) ÷ Stars at period start', parts: [['Stars at period start', 'providers', 'num'], ['Stayed in Stars', 'retained', 'num']], calc: (s) => (s.providers - s.retained) / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${ST}.starrate`, dashboard: ST, module: 'Segment KPIs', name: 'Star rate', viz: 'scorecard',
    plain: 'Of all providers, the share that currently meets the Star criteria.',
    definition: '% of providers who meet Star criteria (definition required).',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers meeting Star criteria ÷ all providers', parts: [['Star providers', 'providers', 'num'], ['All providers', 'allProviders', 'num']], calc: (s) => s.providers / s.allProviders, fmtKind: 'pct' },
  },
  {
    id: `${ST}.crit.ncs`, dashboard: ST, module: 'Segment KPIs', name: 'NCS per active account (first 90 days)', viz: 'distribution',
    plain: 'A Star-criteria input: the NCS each active account produces in its first 90 days (window matches the quarterly data refresh).',
    definition: 'Star criteria input; reportable as percentiles / threshold hits.',
    measure: 'Percentile distribution',
    source: SRC.trx,
    eq: { text: 'Net Credit Sales ÷ active accounts, first 90 days', parts: [['Net Credit Sales', 'ncs', 'usd'], ['Active accounts', 'active', 'num']], calc: (s) => s.ncs / s.active, fmtKind: 'usd' },
  },
  {
    id: `${ST}.crit.apps`, dashboard: ST, module: 'Segment KPIs', name: 'Apps per active account (first 90 days)', viz: 'distribution',
    plain: 'A Star-criteria input: applications per active account in the first 90 days.',
    definition: 'Star criteria input; reportable as percentiles / threshold hits.',
    measure: 'Percentile distribution',
    source: SRC.apps,
    eq: { text: 'applications ÷ active accounts, first 90 days', parts: [['Applications', 'apps', 'num'], ['Active accounts', 'active', 'num']], calc: (s) => s.apps / s.active, fmtKind: 'num1' },
  },
  {
    id: `${ST}.crit.trans`, dashboard: ST, module: 'Segment KPIs', name: 'Transactions per active account (first 90 days)', viz: 'distribution',
    plain: 'A Star-criteria input: transactions per active account in the first 90 days.',
    definition: 'Star criteria input; reportable as percentiles / threshold hits.',
    measure: 'Percentile distribution',
    source: SRC.trx,
    eq: { text: 'transactions ÷ active accounts, first 90 days', parts: [['Transactions', 'transactions', 'num'], ['Active accounts', 'active', 'num']], calc: (s) => s.transactions / s.active, fmtKind: 'num1' },
  },
]

const CO = 'consistent'
const consistentRows = [
  ...commonExecRows(CO, { avgTrans: true, productName: 'Product activation mix info (PLCC vs PL)', migrationDef: 'Movement view: stayed / moved up / dropped.' }),
  {
    id: `${CO}.retention`, dashboard: CO, module: 'Executive / Funnel', name: 'Retention rate', viz: 'scorecard', concept: 'retention-rate',
    plain: 'Of the providers who were Consistent last period, the share still active this period.',
    definition: 'Providers active in current and previous period ÷ providers active in previous period.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers active in both periods ÷ providers active last period', parts: [['Active both periods', 'retained', 'num'], ['Active last period', 'priorProviders', 'num']], calc: (s) => s.retained / s.priorProviders, fmtKind: 'pct' },
  },
  {
    id: `${CO}.upward`, dashboard: CO, module: 'Executive / Funnel', name: 'Upward migration rate', viz: 'scorecard', concept: 'upward-migration',
    plain: 'Of Consistent providers, the share that graduated to Stars.',
    definition: 'Consistent → Star movement ÷ Consistent providers at period start.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers moving Consistent → Stars ÷ Consistent providers', parts: [['Moved to Stars', 'movedUp', 'num'], ['Consistent providers', 'providers', 'num']], calc: (s) => s.movedUp / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${CO}.activemonths`, dashboard: CO, module: 'Segment KPIs', name: 'Avg active months per provider (first 180 days)', viz: 'table',
    plain: 'In their first six months, how many months providers actually used the program.',
    definition: 'Average count of active months per provider in the first 180 days, by industry.',
    measure: 'Avg by industry',
    source: SRC.trx,
    eq: { text: 'sum of active months ÷ providers, first 180 days', parts: [['Avg active months', 'avgActiveMonths', 'num1']], calc: (s) => s.avgActiveMonths, fmtKind: 'num1' },
  },
  {
    id: `${CO}.offerfreq`, dashboard: CO, module: 'Segment KPIs', name: 'Offer frequency trend', viz: 'trend',
    plain: 'Whether providers are offering financing more or less often, month over month.',
    definition: 'Month-over-month change in avg applications per active account (first 180 days or ongoing), by industry.',
    measure: 'MoM change by industry',
    source: SRC.apps,
    eq: { text: '(apps per active this month − last month) ÷ last month', parts: [['Apps per active, this month', 'appsPerActive', 'num1'], ['Apps per active, prior month', 'priorAppsPerActive', 'num1']], calc: (s) => (s.appsPerActive - s.priorAppsPerActive) / s.priorAppsPerActive, fmtKind: 'pct' },
  },
]

const EE = 'engagement-exposures'
const eeRows = [
  ...commonExecRows(EE, { migrationDef: 'Once done with the journey, where providers fall in segmentation, and when.' }),
  {
    id: `${EE}.upward`, dashboard: EE, module: 'Executive / Funnel', name: 'Upward migration', viz: 'scorecard', concept: 'upward-migration',
    plain: 'Providers in this segment that moved up to Consistent or Stars.',
    definition: 'Upward movement out of Engagement Exposures ÷ segment providers at period start.',
    measure: '% / count',
    source: SRC.seg,
    eq: { text: 'providers moving up ÷ segment providers', parts: [['Moved up', 'movedUp', 'num'], ['Segment providers', 'providers', 'num']], calc: (s) => s.movedUp / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${EE}.downward`, dashboard: EE, module: 'Executive / Funnel', name: 'Downward migration rate', viz: 'scorecard',
    plain: 'Providers in this segment that slid toward Needs Attention or Dormant.',
    definition: 'Downward movement out of Engagement Exposures ÷ segment providers at period start.',
    measure: '% / count',
    source: SRC.seg,
    eq: { text: 'providers moving down ÷ segment providers', parts: [['Moved down', 'movedDown', 'num'], ['Segment providers', 'providers', 'num']], calc: (s) => s.movedDown / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${EE}.trans`, dashboard: EE, module: 'Executive / Funnel', name: 'Total # transactions', viz: 'scorecard+trend',
    plain: 'Total transactions this period, and whether that is up or down vs the prior period.',
    definition: 'Total transactions, compared to prior period (% up or down).',
    measure: 'Total; % vs prior period',
    source: SRC.trx,
    eq: { text: 'transactions this period vs prior period', parts: [['Transactions', 'transactions', 'num'], ['Prior period', 'priorTransactions', 'num']], calc: (s) => s.transactions, fmtKind: 'num' },
  },
  {
    id: `${EE}.emaileng`, dashboard: EE, module: 'Segment KPIs', name: 'Email engagement rate (open, click)', viz: 'table',
    plain: 'How email opens and clicks vary by segment and by how long providers have been enrolled.',
    definition: 'Email engagement (open, click) by segment and time bucket.',
    measure: '% by segment & bucket',
    source: src('Journey email engagement joined to segments in the warehouse', 'DWH B2B_email_engagement_fact'),
    eq: { text: 'opens ÷ delivered and clicks ÷ opens, per segment and bucket', parts: [['Opens', 'opens', 'num'], ['Delivered', 'emailsSent', 'num'], ['Clicks', 'clicks', 'num']], calc: (s) => s.opens / s.emailsSent, fmtKind: 'pct' },
  },
  {
    id: `${EE}.cta`, dashboard: EE, module: 'Segment KPIs', name: 'CTA-to-behavior conversion rate', viz: 'scorecard',
    plain: 'Of providers who clicked a call-to-action, the share that completed the downstream action.',
    definition: '% click → downstream action completion, by industry.',
    measure: '% by industry',
    source: src('Clicks joined to completed downstream actions', MKTC + ' + DWH'),
    eq: { text: 'completed downstream actions ÷ CTA clicks', parts: [['Completions', 'conversions', 'num'], ['CTA clicks', 'clicks', 'num']], calc: (s) => s.conversions / s.clicks, fmtKind: 'pct' },
  },
  {
    id: `${EE}.lag`, dashboard: EE, module: 'Segment KPIs', name: 'Content-to-application lag', viz: 'scorecard',
    plain: 'After engaging with journey content, how many days until the provider’s next application.',
    definition: 'Avg days between journey engagement and next application submitted.',
    measure: 'Avg days',
    source: src('Engagement events joined to the next application record', MKTC + ' + ' + DWH_APP),
    eq: { text: 'average of (next application date − engagement date)', parts: [['Content-to-app lag', 'contentLag', 'days']], calc: (s) => s.contentLag, fmtKind: 'days' },
  },
]

// Needs Attention and Dormant split into two dashboards per client feedback
// 8/5–8/6 (composition vote + session directive). Shared reactivation rows
// come from this factory; each dashboard adds its own segment KPIs.
function reactivationRows(dash, segLabel) {
  return [
    ...commonExecRows(dash, { avgTrans: true, noTransPer: true, moduleName: 'Executive View', migrationDef: 'Movement view: stayed / moved up, etc.' }),
    {
      id: `${dash}.reactrate`, dashboard: dash, module: 'Executive View', name: 'Reactivation rate', viz: 'scorecard', concept: 'reactivation-rate',
      plain: `Of the inactive ${segLabel} providers, the share that came back — sales active and/or app active.`,
      definition: 'Reactivated providers ÷ inactive providers. Reactivated = sales active and/or app active.',
      measure: '% overall',
      source: SRC.seg,
      eq: { text: 'reactivated providers ÷ inactive providers', parts: [['Reactivated', 'reactivated', 'num'], ['Inactive', 'inactive', 'num']], calc: (s) => s.reactivated / s.inactive, fmtKind: 'pct' },
    },
    {
      id: `${dash}.recovery`, dashboard: dash, module: 'Executive View', name: 'Total $ NCS recovery', viz: 'comparison',
      plain: 'What these providers used to produce vs what they produce now — the gap is the recovery opportunity.',
      definition: 'NCS recovery: what they used to be vs where they are.',
      measure: 'Total $; prior baseline comparison',
      source: SRC.trx,
      eq: { text: 'current-period NCS vs pre-lapse baseline NCS', parts: [['Current NCS', 'ncs', 'usd'], ['Pre-lapse baseline', 'baselineNcs', 'usd']], calc: (s) => s.ncs / s.baselineNcs, fmtKind: 'pct' },
    },
    {
      id: `${dash}.ncsperactive`, dashboard: dash, module: 'Executive View', name: 'Avg $ NCS / active provider', viz: 'scorecard', origin: FB_R86,
      plain: 'The average Net Credit Sales each active provider produced.',
      definition: 'NCS ÷ active providers.',
      measure: 'Avg $',
      source: SRC.trx,
      eq: { text: 'Net Credit Sales ÷ active providers', parts: [['Net Credit Sales', 'ncs', 'usd'], ['Active providers', 'active', 'num']], calc: (s) => s.ncs / s.active, fmtKind: 'usd' },
    },
    {
      id: `${dash}.transperactive`, dashboard: dash, module: 'Executive View', name: 'Transactions per active provider', viz: 'scorecard', origin: FB_R86,
      plain: 'On average, how many transactions each active provider ran.',
      definition: 'Transactions ÷ active providers.',
      measure: 'Avg per provider',
      source: SRC.trx,
      eq: { text: 'transactions ÷ active providers', parts: [['Transactions', 'transactions', 'num'], ['Active providers', 'active', 'num']], calc: (s) => s.avgTransPerActive, fmtKind: 'num1' },
    },
    {
      id: `${dash}.repeattrans`, dashboard: dash, module: 'Executive View', name: 'Repeat trans %', viz: 'scorecard', origin: FB_R86,
      plain: 'Of all transactions, the share from providers transacting more than once.',
      definition: 'Repeat transactions ÷ total transactions. Companion to Repeat app %.',
      measure: '% overall',
      source: SRC.trx,
      eq: { text: 'repeat transactions ÷ total transactions', parts: [['Repeat transactions', 'repeatTrans', 'num'], ['Total transactions', 'transactions', 'num']], calc: (s) => s.repeatTransPct, fmtKind: 'pct' },
    },
    {
      id: `${dash}.inactivity`, dashboard: dash, module: 'Segment KPIs', name: 'Inactivity rate', viz: 'table',
      plain: 'Of the providers who once activated, the share that has gone quiet.',
      definition: '% of activated providers with no transaction in trailing X days, by industry. X TBD — analytics to recommend the inactivity rule.',
      measure: '% by industry',
      source: SRC.trx,
      eq: { text: 'providers with no transaction in trailing X days ÷ activated providers', parts: [['Inactive providers', 'inactive', 'num'], ['Activated providers', 'providers', 'num']], calc: (s) => s.inactive / s.providers, fmtKind: 'pct' },
    },
    {
      id: `${dash}.reactwindows`, dashboard: dash, module: 'Segment KPIs', name: 'Active within 30 / 60 / 90 days', viz: 'table', origin: FB_R86,
      plain: 'Of this segment, the share active (apps and/or transactions) within 30, 60, and 90-day windows.',
      definition: '% of segment providers active (apps and/or trans) within a 30, 60, and 90 day window.',
      measure: '% per window',
      source: SRC.trx,
      eq: { text: 'providers active within the window ÷ segment providers, per window', parts: [['Reactivated', 'reactivated', 'num'], ['Inactive providers', 'inactive', 'num']], calc: (s) => s.reactivated / s.inactive, fmtKind: 'pct' },
    },
    {
      id: `${dash}.suspended`, dashboard: dash, module: 'Segment KPIs', name: '% suspended providers', viz: 'scorecard', origin: FB_R86, modeled: true,
      plain: 'The share of this segment whose account is suspended.',
      definition: 'Providers with Salesforce account status = suspend ÷ segment providers. Shown here with an illustrative model — real share comes from the SF status sync.',
      measure: '% overall',
      source: src('Account status flag on the Salesforce account object', 'Salesforce (status = suspend)'),
      eq: { text: 'suspended providers ÷ segment providers', parts: [['Suspended share', 'suspendedPct', 'pct']], calc: (s) => s.suspendedPct, fmtKind: 'pct' },
    },
    {
      id: `${dash}.postreact`, dashboard: dash, module: 'Segment KPIs', name: 'Post-reactivation performance', viz: 'table',
      plain: 'After a provider reactivates, the NCS and transactions they produce in the next 30/60/90 days.',
      definition: 'NCS and/or transactions in 30/60/90 days after reactivation (definition required).',
      measure: '$ / count by window',
      source: SRC.trx,
      eq: { text: 'sum NCS and transactions in the 30/60/90 days after reactivation', parts: [['Post-reactivation NCS', 'postReactNcs', 'usd']], calc: (s) => s.postReactNcs, fmtKind: 'usd' },
    },
  ]
}

const NA = 'needs-attention'
const naRows = [
  ...reactivationRows(NA, 'Needs Attention'),
  {
    id: `${NA}.migup`, dashboard: NA, module: 'Segment KPIs', name: 'Migration up rate %', viz: 'scorecard', origin: FB_R86, concept: 'upward-migration',
    plain: 'The share of Needs Attention providers that moved up to any higher segment.',
    definition: '% of the Needs Attention population that moved up to any segment.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers that moved up ÷ segment providers', parts: [['Moved up', 'movedUp', 'num'], ['Segment providers', 'providers', 'num']], calc: (s) => s.movedUp / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${NA}.emailstoreact`, dashboard: NA, module: 'Segment KPIs', name: 'Avg # emails to reactivate', viz: 'scorecard', origin: FB_R86, modeled: true,
    plain: 'For providers that reactivated, how many journey emails it took on average.',
    definition: 'Average journey emails received before reactivation, among reactivated providers. Shown here with an illustrative model — real value needs the send-log join.',
    measure: 'Avg count',
    source: SRC.mktc,
    eq: { text: 'journey emails received before reactivation ÷ reactivated providers', parts: [['Avg emails to reactivate', 'avgEmailsToReactivate', 'num1']], calc: (s) => s.avgEmailsToReactivate, fmtKind: 'num1' },
  },
]

const DO = 'dormant'
const dormantRows = [
  ...reactivationRows(DO, 'Dormant'),
  {
    id: `${DO}.migup`, dashboard: DO, module: 'Segment KPIs', name: 'Migration up rate %', viz: 'scorecard', origin: FB_R86, concept: 'upward-migration',
    plain: 'The share of Dormant providers that moved up to any higher segment.',
    definition: '% of the Dormant population that moved up to any segment.',
    measure: '% overall',
    source: SRC.seg,
    eq: { text: 'providers that moved up ÷ segment providers', parts: [['Moved up', 'movedUp', 'num'], ['Segment providers', 'providers', 'num']], calc: (s) => s.movedUp / s.providers, fmtKind: 'pct' },
  },
  {
    id: `${DO}.emailstoreact`, dashboard: DO, module: 'Segment KPIs', name: 'Avg # emails to reactivate', viz: 'scorecard', origin: FB_R86, modeled: true,
    plain: 'For providers that reactivated, how many journey emails it took on average.',
    definition: 'Average journey emails received before reactivation, among reactivated providers. Shown here with an illustrative model — real value needs the send-log join.',
    measure: 'Avg count',
    source: SRC.mktc,
    eq: { text: 'journey emails received before reactivation ÷ reactivated providers', parts: [['Avg emails to reactivate', 'avgEmailsToReactivate', 'num1']], calc: (s) => s.avgEmailsToReactivate, fmtKind: 'num1' },
  },
  {
    id: `${DO}.sunsetted`, dashboard: DO, module: 'Segment KPIs', name: 'Contacts sunsetted from journey', viz: 'scorecard', origin: FB_R86, modeled: true,
    plain: 'Providers removed from the journey after exhausting the reactivation sequence.',
    definition: 'Contacts sunsetted from the journey in the period. Shown here with an illustrative model — real count comes from journey exit records.',
    measure: 'Total',
    source: SRC.mktc,
    eq: { text: 'count of contacts sunsetted in the period', parts: [['Sunsetted', 'sunsetted', 'num']], calc: (s) => s.sunsetted, fmtKind: 'num' },
  },
]

// Segment population vs same period last year — client request 8/12, one
// card per segment dashboard, paired with the up/down migration view.
const FB_MSG812 = { source: 'Client feedback', date: '8/12', by: 'client request' }

function populationTrendRow(dash, segLabel) {
  return {
    id: `${dash}.poptrend`, dashboard: dash, module: 'Segment KPIs',
    name: 'Providers in segment vs same period last year', viz: 'line + prior-year overlay',
    origin: FB_MSG812, concept: 'segment-population-trend',
    plain: `How many providers hold the ${segLabel} label over time, against the same months last year — parallel lines read as seasonality, a widening gap as journey impact.`,
    definition: 'Count of providers in the segment per month, overlaid with the same period last year. Note: segment labels refresh quarterly, so production counts step at refresh dates; requires 13+ months of segmentation snapshots.',
    measure: 'Monthly count; same-period-prior-year overlay',
    source: SRC.seg,
    eq: { text: 'providers holding the segment label this period vs the same period last year', parts: [['Providers in segment', 'providers', 'num'], ['Same period last year', 'priorYearProviders', 'num']], calc: (s) => s.providers, fmtKind: 'num' },
  }
}

// ---------------------------------------------------------------------------

export const REGISTRY = [
  ...execView,
  ...neExec, ...neDeepDive, ...vocModule(NE), ...joModule(NE),
  ...starsRows, populationTrendRow(ST, 'Stars'), ...vocModule(ST), ...joModule(ST),
  ...consistentRows, populationTrendRow(CO, 'Consistent'), ...vocModule(CO), ...joModule(CO),
  ...eeRows, populationTrendRow(EE, 'Engagement Exposures'), ...vocModule(EE), ...joModule(EE),
  ...naRows, populationTrendRow(NA, 'Needs Attention'), ...joModule(NA),
  ...dormantRows, populationTrendRow(DO, 'Dormant'), ...joModule(DO),
]

export const byId = Object.fromEntries(REGISTRY.map((m) => [m.id, m]))
export const forDashboard = (dash) => REGISTRY.filter((m) => m.dashboard === dash)
