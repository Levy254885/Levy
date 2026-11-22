import type { Analytics } from '@/lib/types';

function niceMax(m: number) {
  if (m <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(m));
  for (const k of [1, 2, 5, 10]) if (m <= k * p) return k * p;
  return m;
}
const label = (day: string) => new Date(day + 'T00:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export default function Chart({ series }: { series: Analytics['series'] }) {
  const W = 680, H = 230, PL = 38, PB = 28, PT = 12;
  const n = series.length;
  const top = niceMax(Math.max(1, ...series.map((s) => s.views)));
  const bw = (W - PL) / n;
  const ph = H - PB - PT;
  const ticks = [...new Set([0, Math.floor(n / 2), n - 1])];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Page views per day">
      {[0, 0.5, 1].map((f) => {
        const y = PT + ph - f * ph;
        return (
          <g key={f}>
            <line className="grid" x1={PL} x2={W} y1={y} y2={y} />
            <text className="ax" x={PL - 6} y={y + 4} textAnchor="end">{Math.round(top * f)}</text>
          </g>
        );
      })}
      {series.map((s, i) => {
        const x = PL + i * bw + bw * 0.14, w = bw * 0.72;
        const h = (s.views / top) * ph, hu = (s.visitors / top) * ph;
        const r = Math.min(3, w / 2);
        return (
          <g key={s.day}>
            <rect className="bar" x={x} y={PT + ph - h} width={w} height={h} rx={r} />
            <rect className="bar2" x={x} y={PT + ph - hu} width={w} height={hu} rx={r} />
            <title>{`${label(s.day)}: ${s.views} views, ${s.visitors} visitors`}</title>
          </g>
        );
      })}
      {ticks.map((i) => (
        <text key={i} className="ax" x={PL + i * bw + bw / 2} y={H - 8} textAnchor="middle">{label(series[i].day)}</text>
      ))}
    </svg>
  );
}
