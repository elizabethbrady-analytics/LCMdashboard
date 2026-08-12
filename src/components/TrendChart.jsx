import { useMemo } from 'react'
import EChart, { CHART_TEXT } from './EChart'
import { applyFmt } from '../data/format'

/** Single-series monthly trendline. No legend (one series — the title names it).
    Optional goal: dashed reference line at a fixed y-value with a label.
    Optional benchmark: second dashed series (e.g. same period prior year). */
export default function TrendChart({ data, color = '#0e5b4a', fmtKind = 'num', height = 200, goal, goalLabel, benchmark, benchmarkLabel = 'Same period prior year' }) {
  const option = useMemo(() => ({
    grid: { left: 56, right: 16, top: 14, bottom: 26 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: CHART_TEXT.muted, width: 1, type: 'dashed' } },
      valueFormatter: (v) => applyFmt(fmtKind, v),
      textStyle: { fontFamily: CHART_TEXT.font, fontSize: 12 },
    },
    ...(benchmark && {
      legend: {
        bottom: 0,
        icon: 'rect',
        itemWidth: 14,
        itemHeight: 2,
        textStyle: { fontFamily: CHART_TEXT.font, fontSize: 11, color: CHART_TEXT.secondary },
      },
    }),
    xAxis: {
      type: 'category',
      data: data.map((d) => d.month),
      axisLine: { lineStyle: { color: CHART_TEXT.hairline } },
      axisTick: { show: false },
      axisLabel: { color: CHART_TEXT.muted, fontFamily: CHART_TEXT.font, fontSize: 10.5 },
    },
    yAxis: {
      type: 'value',
      ...(goal != null && { max: (v) => Math.max(v.max, goal * 1.08) }),
      splitLine: { lineStyle: { color: CHART_TEXT.hairline } },
      axisLabel: {
        color: CHART_TEXT.muted,
        fontFamily: CHART_TEXT.font,
        fontSize: 10.5,
        formatter: (v) => (fmtKind.startsWith('usd') ? '$' + (v >= 1e6 ? v / 1e6 + 'M' : v / 1e3 + 'K') : v >= 1e3 ? v / 1e3 + 'K' : v),
      },
    },
    series: [
      ...(benchmark
        ? [{
            name: benchmarkLabel,
            type: 'line',
            data: benchmark.map((d) => d.value),
            smooth: false,
            showSymbol: false,
            lineStyle: { width: 1.5, color: CHART_TEXT.muted, type: 'dashed' },
            itemStyle: { color: CHART_TEXT.muted },
          }]
        : []),
      {
        name: 'Current period',
        // Straight segments — matches what a Tableau line mark renders
        type: 'line',
        data: data.map((d) => d.value),
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        showSymbol: false,
        lineStyle: { width: 2, color },
        itemStyle: { color },
        areaStyle: { color, opacity: 0.07 },
        ...(goal != null && {
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#a86a00', type: 'dashed', width: 1.5 },
            label: {
              formatter: goalLabel ?? `Goal ${applyFmt(fmtKind, goal)}`,
              position: 'insideEndTop',
              color: '#a86a00',
              fontFamily: CHART_TEXT.font,
              fontSize: 11,
              fontWeight: 600,
            },
            data: [{ yAxis: goal }],
          },
        }),
      },
    ],
  }), [data, color, fmtKind, goal, goalLabel, benchmark, benchmarkLabel])

  return <EChart option={option} height={height} />
}
