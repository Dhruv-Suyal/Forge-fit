import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

// ── Hydration Score Graph (smooth SVG line) ───────────────────────────────────
function normalize(points, width, height) {
  if (!points || points.length < 2) return [];
  const scores = points.map(p => p.score);
  const max = Math.max(...scores, 10);
  const min = Math.min(...scores, 0);
  const range = Math.max(1, max - min);
  return points.map((p, i) => ({
    x: Math.round((i / (points.length - 1)) * width),
    y: Math.round(height - ((p.score - min) / range) * (height - 16) - 8),
    score: p.score,
    date: p.date,
  }));
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.5;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function smoothFillPath(pts, width, height) {
  if (pts.length < 2) return '';
  const line = smoothPath(pts);
  return `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScoreGraph({ data = [] }) {
  const W = 520, H = 140;
  const pts = normalize(data, W, H);
  const linePath = smoothPath(pts);
  const fillPath = smoothFillPath(pts, W, H);

  const pathRef     = useRef(null);
  const fillRef     = useRef(null);
  const containerRef= useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (!pathRef.current || pts.length < 2) return;
    const len = pathRef.current.getTotalLength?.() || 600;
    gsap.fromTo(pathRef.current,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', delay: 0.8 }
    );
    gsap.fromTo(fillRef.current, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.4 });
  }, [data, pts.length]);

  const avgScore = data.length ? Math.round(data.reduce((s, p) => s + p.score, 0) / data.length) : 0;
  const maxScore = data.length ? Math.max(...data.map(p => p.score)) : 0;

  return (
    <div
      ref={containerRef}
      className="hl-glass hl-glass-teal"
      style={{ padding: 28, marginBottom: 20, opacity: 0 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.05))',
            border: '1px solid rgba(56,189,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>💧</div>
          <div>
            <div className="hl-section-label" style={{ marginBottom: 0, color: 'rgba(56,189,248,0.7)' }}>7-DAY TREND</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-main)' }}>Hydration Score</div>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: 'Avg', value: `${avgScore}%`, color: '#38bdf8' },
            { label: 'Peak', value: `${maxScore}%`, color: '#00f5d4' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      {pts.length >= 2 ? (
        <div style={{ overflowX: 'auto' }}>
          <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ minWidth: 280 }}>
            <defs>
              <linearGradient id="hl-hydration-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <filter id="hl-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[25, 50, 75, 100].map(pct => {
              const y = H - (pct / 100) * (H - 16) - 8;
              return (
                <g key={pct}>
                  <line x1={0} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <text x={W - 4} y={y - 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="var(--font-mono)">
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Fill */}
            <path ref={fillRef} d={fillPath} fill="url(#hl-hydration-grad)" opacity={0} />

            {/* Line */}
            <path
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hl-glow)"
            />

            {/* Dots + tooltips */}
            {pts.map((p, i) => {
              const dateObj = data[i]?.date ? new Date(data[i].date) : null;
              const dayLabel = dateObj ? DAYS[dateObj.getDay()] : `D${i + 1}`;
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={5} fill="#38bdf8" stroke="#00000e" strokeWidth="2" />
                  <circle cx={p.x} cy={p.y} r={10} fill="transparent" />
                  {/* Day label */}
                  <text x={p.x} y={H + 22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-mono)">
                    {dayLabel}
                  </text>
                  {/* Score label */}
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="rgba(56,189,248,0.7)" fontFamily="var(--font-mono)">
                    {p.score}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-main)', fontSize: 14 }}>
          No hydration data yet — log water intake to see your trend.
        </div>
      )}
    </div>
  );
}
