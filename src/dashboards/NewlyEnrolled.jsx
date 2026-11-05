// Newly Enrolled — funnel view of onboarding & activation, laid out
// Tableau-style: KPI banner across the top, then tiled worksheet panes
// (funnel, state map, bucket table, industry table, quality grid).

import { useMemo } from 'react'
import { byId } from '../data/registry'
import { agg, activationBuckets, ttv, stateBreakdown, sourceBreakdown, INDUSTRIES } from '../data/synthetic.js'
import { applyFmt } from '../data/format'
import MetricCard from '../components/MetricCard'
import Scorecard from '../components/Scorecard'
import FunnelStrip from '../components/FunnelStrip'
import BucketTable from '../components/BucketTable'
import StateMap from '../components/StateMap'
import JourneyOptimization from '../components/JourneyOptimization'
import VocTiles from '../components/VocTiles'

const D = 'newly-enrolled'
const m = (k) => byId[`${D}.${k}`]
const dd = (k) => byId[`${D}.dd.${k}`]

function IndustryTable({ filter }) {
  const rows = useMemo(
    () =>
      INDUSTRIES.map((ind) => {
        const a = agg({ segments: ['Newly Enrolled'], industries: [ind], products: filter.products, channels: filter.channels, months: filter.months })
        const t = ttv({ industries: [ind] })
        return {
          industry: ind,
          enrolled: a.providers,
          actRate: a.providers ? a.active / a.providers : 0,
          ttvApp: t.ttvApp,
          ttvTran: t.ttvTran,
          ncsPerActive: a.active ? a.ncs / a.active : 0,
        }
      }),
    [filter],
  )
  const totalEnrolled = rows.reduce((s, r) => s + r.enrolled, 0)
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Industry</th>
          <th className="num">Enrolled</th>
          <th className="num">% of enrolled</th>
          <th className="num">Activation rate</th>
          <th className="num">TTV-App</th>
          <th className="num">TTV-Tran</th>
          <th className="num">Avg $ NCS / active</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.industry}>
            <td>{r.industry}</td>
            <td className="num">{applyFmt('num', r.enrolled)}</td>
            <td className="num">{applyFmt('pct', totalEnrolled ? r.enrolled / totalEnrolled : 0)}</td>
            <td className="num">{applyFmt('pct', r.actRate)}</td>
            <td className="num">{applyFmt('days', r.ttvApp)}</td>
            <td className="num">{applyFmt('days', r.ttvTran)}</td>
            <td className="num">{applyFmt('usd', r.ncsPerActive)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function NewlyEnrolled({ scope, priorScope, filter }) {
  const segFilter = useMemo(() => ({ ...filter, segments: ['Newly Enrolled'] }), [filter])
  const buckets = useMemo(() => activationBuckets(segFilter, 'ne-act'), [segFilter])
  const states = useMemo(() => stateBreakdown(segFilter, 'ne-geo'), [segFilter])
  const sources = useMemo(() => sourceBreakdown(segFilter), [segFilter])

  const stages = [
    { label: 'Enrolled providers', value: scope.providers },
    { label: 'Activated (≥1 app and/or transaction)', value: scope.active },
    { label: 'New cardholder accounts', value: scope.newCH },
    { label: 'Transacting within 90 days', value: scope.firstTransIn90 },
  ]

  return (
    <>
      <div className="kpi-band">
        {['subs', 'actrate', 'appactrate', 'salesactrate', 'ncs', 'ncslift', 'ttvapp', 'ttvtran', 'repeat', 'product'].map((k) => (
          <Scorecard key={k} metric={m(k)} scope={scope} priorScope={priorScope} compact />
        ))}
      </div>

      <div className="row-split">
        <MetricCard metricId={m('actrate').id} className="card chart-card">
          <div className="module-title">Activation funnel</div>
          <FunnelStrip stages={stages} />
        </MetricCard>
        <MetricCard metricId={dd('location').id} className="card chart-card">
          <div className="module-title">
            Practice location — enrolled providers by state
            <span className="pane-note">granularity & source for review</span>
          </div>
          <StateMap data={states} height={330} />
        </MetricCard>
      </div>

      <div className="row-split">
        <MetricCard metricId={dd('actbucket').id} className="card chart-card">
          <div className="module-title">Activation rate by time bucket</div>
          <BucketTable rows={buckets} />
        </MetricCard>
        <MetricCard metricId={dd('practice').id} className="card chart-card">
          <div className="module-title">Activation deep dive by industry</div>
          <IndustryTable filter={filter} />
          <div className="chip-row">
            {[dd('ttvapp'), dd('ttvtran')].map((metric) => (
              <MetricCard key={metric.id} metricId={metric.id} className="metric-chip">
                {metric.name}
              </MetricCard>
            ))}
          </div>
        </MetricCard>
      </div>

      <section className="card">
        <div className="module-title">Account quality & demand</div>
        <div className="metric-grid">
          {[dd('approval'), dd('newch'), dd('ch30'), dd('firsttrans'), dd('ncsavg'), m('ncsperact'), m('firstch'), m('appsper'), m('transper'), m('mql'), m('hand'), m('migration')].map((metric) => (
            <Scorecard key={metric.id} metric={metric} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <div className="row-split">
        <section className="card">
          <div className="module-title">Enrollment profile</div>
          <div className="metric-grid" style={{ gridTemplateColumns: '1fr' }}>
            <Scorecard metric={dd('enrollcount')} scope={scope} priorScope={priorScope} />
          </div>
        </section>
        <MetricCard metricId={dd('enrollsource').id} className="card chart-card">
          <div className="module-title">Enrollment source breakdown</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th className="num">Enrolled</th>
                <th className="num">Share</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td className="num">{applyFmt('num', s.providers)}</td>
                  <td className="num">{applyFmt('pct', s.share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </MetricCard>
      </div>

      <section className="card">
        <div className="module-title">Volume & channel detail</div>
        <div className="metric-grid">
          {[dd('appsbucket'), dd('transbucket'), dd('ncstotal'), dd('channel'), dd('ncschannel'), dd('ttvchannel')].map((metric) => (
            <Scorecard key={metric.id} metric={metric} scope={scope} priorScope={priorScope} />
          ))}
        </div>
      </section>

      <VocTiles dashId={D} scope={scope} priorScope={priorScope} />
      <JourneyOptimization dashId={D} scope={scope} priorScope={priorScope} filter={filter} segments={['Newly Enrolled']} />
    </>
  )
}
