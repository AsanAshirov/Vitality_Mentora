import React from 'react'

interface SparklineProps {
  data: number[]
  tone?: string
}

export default function Sparkline({ data, tone = '' }: SparklineProps) {
  const w = 60, h = 18, pad = 1
  const min = Math.min(...data), max = Math.max(...data)
  const range = (max - min) || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg className={'spark ' + tone} viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <path d={'M' + pts.replaceAll(' ', ' L')} />
    </svg>
  )
}
