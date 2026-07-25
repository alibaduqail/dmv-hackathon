// SVG line chart, no charting library. Renders whatever cueTrend() returns —
// non-monotonic on purpose (support goes back up when a session regresses).
// Y order comes from derive.ts CUE_ORDER, imported — never re-declared here.
import type { CueLevel } from '../../types.ts';
import { CUE_ORDER } from '../../lib/derive.ts';

interface CuePoint {
  sessionIndex: number;
  date: string;
  cue: CueLevel;
}

const CUE_LABEL: Record<CueLevel, string> = {
  independent: 'independent',
  verbal_cue: 'verbal cue',
  visual_cue: 'visual cue',
  tactile_cue: 'tactile cue',
  model: 'model',
};

const W = 600;
const H = 200;
const PAD_L = 74;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

export default function CueTrend({ points, target }: { points: CuePoint[]; target: string }) {
  if (!points.length) return null;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const lastRank = CUE_ORDER.length - 1;
  const x = (i: number) => PAD_L + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  // index 0 (independent, least support) at top — "up" reads as progress in both charts.
  const y = (cue: CueLevel) => PAD_T + (CUE_ORDER.indexOf(cue) / lastRank) * plotH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.cue).toFixed(1)}`).join(' ');

  return (
    <div>
      <h2 className="font-body text-sm text-grey">cue level &middot; {target}</h2>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full max-w-2xl"
        role="img"
        aria-label={`Cue level trend for ${target} across ${points.length} sessions, least support at top`}
      >
        {CUE_ORDER.map(level => (
          <g key={level}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(level)} y2={y(level)} stroke="var(--color-hairline)" strokeWidth={1} />
            <text x={PAD_L - 8} y={y(level)} textAnchor="end" dominantBaseline="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-grey)">
              {CUE_LABEL[level]}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth={1.5} />
        {points.map((p, i) => (
          <g key={p.sessionIndex}>
            <circle cx={x(i)} cy={y(p.cue)} r={3} fill="var(--color-ink)" />
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-grey)">
              {p.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
