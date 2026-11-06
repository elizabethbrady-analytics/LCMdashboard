import { useMemo } from 'react'
import EChart, { CHART_TEXT } from './EChart'
import { applyFmt } from '../data/format'

/** Clustered columns by month: current period vs the same month prior year.
    data: [{ month, current, prior, priorModeled? }] — values are 0–1 rates. */
export default function YoYColumnChart({ data, color = '#0e8a5f', fmtKind = 'pct', height = 260, currentLabel = 'Current', priorLabel = 'Prior year' }) {
  const option = useMemo(() => ({
    grid: { left: 48, right: 12, top: 14, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v) => applyFmt(fmtKind, v),
      textStyle: { fontFamily: CHART_TEXT.font, fontSize: 12 },
    },
    legend: {
      bottom: 0,
      icon: 'rect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { fontFamily: CHART_TEXT.font, fontSize: 11, color: CHART_TEXT.secondary },
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.month),
      axisLine: { lineStyle: { color: CHART_TEXT.hairline } },
      axisTick: { show: false },
      axisLabel: { color: CHART_TEXT.muted, fontFamily: CHART_TEXT.font, fontSize: 10.5 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: CHART_TEXT.hairline } },
      axisLabel: {
        color: CHART_TEXT.muted,
        fontFamily: CHART_TEXT.font,
        fontSize: 10.5,
        formatter: (v) => `${Math.round(v * 100)}%`,
      },
    },
    series: [
      {
        name: priorLabel,
        type: 'bar',
        data: data.map((d) => d.prior),
        barMaxWidth: 16,
        itemStyle: { color: '#b9c4bc', borderRadius: [2, 2, 0, 0] },
      },
      {
        name: currentLabel,
        type: 'bar',
        data: data.map((d) => d.current),
        barMaxWidth: 16,
        itemStyle: { color, borderRadius: [2, 2, 0, 0] },
      },
    ],
  }), [data, color, fmtKind, priorLabel, currentLabel])

  return <EChart option={option} height={height} />
}
