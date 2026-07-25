// SVG line chart, no charting library. Renders whatever accuracyTrend() returns —
// non-monotonic on purpose. Do not smooth, sort, or drop points here.

interface AccuracyPoint {
  sessionIndex: number;
  date: string;
  pct: number;
}

const W = 600;
const H = 200;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 20;
const PAD_B = 26;
const GRID = [0, 25, 50, 75, 100];

export default function AccuracyTrend({ points, target }: { points: AccuracyPoint[]; target: string }) {
  if (!points.length) return null;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const x = (i: number) => PAD_L + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (pct: number) => PAD_T + plotH - (pct / 100) * plotH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.pct).toFixed(1)}`).join(' ');

  return (
    <div>
      <h2 className="font-body text-sm text-grey">accuracy &middot; {target}</h2>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full max-w-2xl"
        role="img"
        aria-label={`Accuracy trend for ${target} across ${points.length} sessions, percent trials correct`}
      >
        {GRID.map(gy => (
          <g key={gy}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(gy)} y2={y(gy)} stroke="var(--color-hairline)" strokeWidth={1} />
            <text x={PAD_L - 6} y={y(gy)} textAnchor="end" dominantBaseline="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-grey)">
              {gy}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} />
        {points.map((p, i) => (
          <g key={p.sessionIndex}>
            <circle cx={x(i)} cy={y(p.pct)} r={3} fill="var(--color-ink)" />
            <text x={x(i)} y={y(p.pct) - 8} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--color-ink)">
              {p.pct}%
            </text>
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-grey)">
              {p.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
