import { useEffect, useMemo, useState } from 'react'
import EChart, { echarts, CHART_TEXT } from './EChart'
import { applyFmt } from '../data/format'
import usaStates from '../data/usa-states.json'

let registered = false

/** US state choropleth. Sequential single-hue ramp (paper → brand green). */
export default function StateMap({ data, height = 340 }) {
  const [ready, setReady] = useState(registered)

  useEffect(() => {
    if (!registered) {
      echarts.registerMap('USA', usaStates, {
        Alaska: { left: -131, top: 25, width: 15 },
        Hawaii: { left: -110, top: 25, width: 5 },
        'Puerto Rico': { left: -76, top: 26, width: 2 },
      })
      registered = true
      setReady(true)
    }
  }, [])

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.providers)), [data])

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      textStyle: { fontFamily: CHART_TEXT.font, fontSize: 12 },
      formatter: (p) =>
        p.data
          ? `<b>${p.name}</b><br/>${p.data.value.toLocaleString()} enrolled providers<br/>${applyFmt('usd', p.data.ncs)} NCS`
          : `${p.name}: no data`,
    },
    visualMap: {
      min: 0,
      max,
      left: 8,
      bottom: 8,
      orient: 'horizontal',
      itemWidth: 10,
      itemHeight: 90,
      text: ['More enrolled', 'Fewer'],
      textStyle: { color: CHART_TEXT.muted, fontFamily: CHART_TEXT.font, fontSize: 10.5 },
      inRange: { color: ['#eef0e4', '#b9cf8e', '#6f9a52', '#2f6e4f', '#0e5b4a'] },
      calculable: false,
    },
    series: [
      {
        type: 'map',
        map: 'USA',
        roam: false,
        selectedMode: false,
        emphasis: { label: { show: false }, itemStyle: { areaColor: '#86a934' } },
        itemStyle: { borderColor: '#fffefb', borderWidth: 0.8 },
        data: data.map((d) => ({ name: d.name, value: d.providers, ncs: d.ncs })),
      },
    ],
  }), [data, max])

  if (!ready) return <div style={{ height }} />
  return <EChart option={option} height={height} />
}
