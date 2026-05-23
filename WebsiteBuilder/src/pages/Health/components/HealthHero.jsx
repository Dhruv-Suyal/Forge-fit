import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

// ── Floating particle ─────────────────────────────────────────────────────────
function Particle({ x, y, size, delay, duration, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        animation: `hl-particle-drift ${duration}s ease-in-out ${delay}s infinite`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Animated score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, loading }) {
  const r = 54;
  const circumference = 2 * Math.PI * r; // ≈339
  const dashOffset = loading ? circumference : circumference - (score / 100) * circumference;

  const ringRef = useRef(null);
  const numRef  = useRef(null);

  useEffect(() => {
    if (loading || !ringRef.current) return;
    gsap.fromTo(ringRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: dashOffset, duration: 1.8, ease: 'power3.out', delay: 0.6 }
    );
    if (numRef.current) {
      gsap.fromTo({ val: 0 }, { val: score },
        { duration: 1.6, ease: 'power2.out', delay: 0.6,
          onUpdate() { if (numRef.current) numRef.current.textContent = Math.round(this.targets()[0].val); }
        }
      );
    }
  }, [score, loading, dashOffset, circumference]);

  const color = score >= 75 ? '#00f5d4' : score >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Fill */}
        <circle
          ref={ringRef}
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        {/* Glow dot at tip */}
        <circle cx="70" cy="16" r="4" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span ref={numRef} style={{
          fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700,
          color: color, lineHeight: 1,
          textShadow: `0 0 20px ${color}`,
        }}>
          {loading ? '—' : 0}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
          /100
        </span>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, unit, color, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', delay }
    );
    gsap.to(ref.current, { y: -6, duration: 3 + delay, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.5 });
  }, [delay]);

  return (
    <div
      ref={ref}
      className="hl-glass hl-glass-teal"
      style={{ padding: '20px 24px', minWidth: 140, textAlign: 'center', cursor: 'default', opacity: 0 }}
      onMouseEnter={e => gsap.to(e.currentTarget, { y: -6, scale: 1.04, duration: 0.3, ease: 'power2.out' })}
      onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)' })}
    >
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color, textShadow: `0 0 20px ${color}`, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
        {unit}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'var(--font-main)' }}>
        {label}
      </div>
    </div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
const PARTICLES = [
  { x:8,  y:20, size:'6px',  delay:0,   duration:7,  color:'radial-gradient(circle, rgba(0,245,212,0.7), transparent)' },
  { x:18, y:70, size:'4px',  delay:1.5, duration:9,  color:'radial-gradient(circle, rgba(16,185,129,0.7), transparent)' },
  { x:30, y:40, size:'5px',  delay:0.8, duration:8,  color:'radial-gradient(circle, rgba(0,245,212,0.7), transparent)' },
  { x:45, y:15, size:'8px',  delay:2,   duration:10, color:'radial-gradient(circle, rgba(16,185,129,0.6), transparent)' },
  { x:60, y:60, size:'5px',  delay:0.3, duration:7,  color:'radial-gradient(circle, rgba(0,245,212,0.7), transparent)' },
  { x:72, y:30, size:'4px',  delay:1.2, duration:9,  color:'radial-gradient(circle, rgba(16,185,129,0.7), transparent)' },
  { x:85, y:75, size:'7px',  delay:0.6, duration:8,  color:'radial-gradient(circle, rgba(0,245,212,0.6), transparent)' },
  { x:92, y:45, size:'5px',  delay:1.8, duration:11, color:'radial-gradient(circle, rgba(16,185,129,0.7), transparent)' },
];

export default function HealthHero({ summary, loading }) {
  const heroRef    = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const glowRef    = useRef(null);
  const ring1Ref   = useRef(null);
  const ring2Ref   = useRef(null);

  const score  = summary?.overallScore ?? 0;
  const streak = summary?.streak ?? 0;
  const bmi    = summary?.bmi ?? null;

  // Mouse-follow glow
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMouse = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 60;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 40;
      if (glowRef.current) gsap.to(glowRef.current, { x, y, duration: 1.2, ease: 'power2.out' });
    };
    hero.addEventListener('mousemove', onMouse);
    return () => hero.removeEventListener('mousemove', onMouse);
  }, []);

  // Entrance animations
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(headingRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
      .fromTo(subRef.current,     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    gsap.fromTo([ring1Ref.current, ring2Ref.current],
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: 'power2.out', delay: 0.4 }
    );
  }, []);

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,245,212,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 60%), #00000e',
        paddingTop: 80,
        paddingBottom: 40,
      }}
    >
      {/* Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* Mouse glow orb */}
      <div ref={glowRef} style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,245,212,0.05) 0%, transparent 70%)',
        left: '50%', top: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }} />

      {/* Energy rings */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div ref={ring1Ref} className="hl-ring hl-ring-1" style={{ width: 360, height: 360, opacity: 0 }} />
        <div ref={ring2Ref} className="hl-ring hl-ring-2" style={{ position: 'absolute', width: 560, height: 560, opacity: 0 }} />

        {/* Rotating gradient arc */}
        <div style={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          border: '2px solid transparent',
          background: 'linear-gradient(#00000e,#00000e) padding-box, linear-gradient(135deg, #00f5d4, transparent, #10b981) border-box',
          animation: 'hl-rotate-slow 14s linear infinite',
        }} />
      </div>

      {/* Label */}
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 10px #00f5d4', animation: 'hl-dot-live 1.8s ease-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(0,245,212,0.7)', fontWeight: 600 }}>
          WELLNESS INTELLIGENCE
        </span>
      </div>

      {/* Heading */}
      <h1
        ref={headingRef}
        style={{
          margin: '0 0 16px', fontSize: 'clamp(36px,7vw,84px)', fontWeight: 900,
          fontFamily: 'var(--font-main)', lineHeight: 1.05, letterSpacing: '-3px',
          color: '#fff', opacity: 0, textAlign: 'center', zIndex: 2,
        }}
      >
        My <span className="hl-gradient-text">Health</span> Hub
      </h1>

      <p
        ref={subRef}
        style={{
          margin: '0 0 48px', fontSize: 'clamp(14px,2vw,18px)', fontFamily: 'var(--font-main)',
          fontWeight: 400, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
          opacity: 0, textAlign: 'center', maxWidth: 600, zIndex: 2, padding: '0 24px',
        }}
      >
        Track your wellness score, build healthy habits, and optimise your sleep schedule — all in one place.
      </p>

      {/* Score + stat cards */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', zIndex: 2, padding: '0 24px' }}>
        {/* Score ring card */}
        <div className="hl-glass hl-glass-teal" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <ScoreRing score={score} loading={loading} />
          <div>
            <div className="hl-section-label" style={{ marginBottom: 4 }}>Health Score</div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {loading ? '—' : score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'}
            </div>
            <div style={{ fontFamily: 'var(--font-main)', fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              Based on XP & activity
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatCard icon="🔥" label="Active Streak" value={loading ? '—' : streak} unit="days"    color="#f59e0b" delay={0.8} />
        {bmi && <StatCard icon="⚖️" label="BMI"          value={loading ? '—' : bmi.toFixed(1)} unit="kg/m²" color="#00f5d4" delay={1.0} />}
        <StatCard icon="💧" label="Hydration"    value={loading ? '—' : (summary?.graph?.slice(-1)[0]?.score ?? 0)} unit="% today" color="#38bdf8" delay={1.2} />
      </div>

      {/* Scroll cue */}
      <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4, zIndex: 2 }}>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #00f5d4, transparent)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>SCROLL</span>
      </div>
    </section>
  );
}
