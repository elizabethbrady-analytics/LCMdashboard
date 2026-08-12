import { byId } from '../data/registry'
import Scorecard from './Scorecard'

/** Shared VOC / Sentiment module (NPS + CSAT). */
export default function VocTiles({ dashId, scope, priorScope }) {
  return (
    <section className="card">
      <div className="module-title">VOC / Customer Sentiment</div>
      <div className="metric-grid">
        <Scorecard metric={byId[`${dashId}.voc.nps`]} scope={scope} priorScope={priorScope} />
        <Scorecard metric={byId[`${dashId}.voc.csat`]} scope={scope} priorScope={priorScope} />
      </div>
    </section>
  )
}
