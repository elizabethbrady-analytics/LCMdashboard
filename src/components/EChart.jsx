import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, MapChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  VisualMapComponent, GeoComponent, MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart, BarChart, MapChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent,
  VisualMapComponent, GeoComponent, MarkLineComponent,
  CanvasRenderer,
])

export { echarts }

export const CHART_TEXT = {
  ink: '#16302a',
  secondary: '#4c5f56',
  muted: '#7d8b81',
  hairline: '#e4e0d4',
  font: "'Archivo', sans-serif",
}

export default function EChart({ option, height = 260, onEvents }) {
  const ref = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    const obs = new ResizeObserver(() => chart.resize())
    obs.observe(ref.current)
    return () => {
      obs.disconnect()
      chart.dispose()
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !onEvents) return
    for (const [evt, fn] of Object.entries(onEvents)) chart.on(evt, fn)
    return () => {
      for (const evt of Object.keys(onEvents)) chart.off(evt)
    }
  }, [onEvents])

  return <div ref={ref} style={{ width: '100%', height }} />
}
