import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../../utils/axios';

import { Header }       from '../../components/header';
import HealthHero       from './components/HealthHero';
import SleepSchedule    from './components/SleepSchedule';
import HabitsManager    from './components/HabitsManager';
import ScoreGraph       from './components/ScoreGraph';
import WellnessTips     from './components/WellnessTips';
import './health.css';

gsap.registerPlugin(ScrollTrigger);

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'back.out(1.4)' }
    );
    const t = setTimeout(() => {
      gsap.to(ref.current, { opacity: 0, x: 60, duration: 0.3, onComplete: onClose });
    }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  color: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   color: '#f87171' },
    info:    { bg: 'rgba(0,245,212,0.12)',   border: 'rgba(0,245,212,0.3)',   color: '#00f5d4' },
  };
  const c = colors[type] || colors.info;

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 80, right: 24, zIndex: 2000,
      padding: '12px 20px',
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14,
      color: c.color, fontFamily: 'var(--font-main)', fontWeight: 600, fontSize: 13,
      backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: 320, lineHeight: 1.5,
    }}>
      {message}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider({ color = 'rgba(0,245,212,0.12)' }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      margin: '0 48px',
    }} />
  );
}

// ── Section wrapper with GSAP scroll reveal ────────────────────────────────────
function Section({ children, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%' },
      }
    );
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, padding: '48px 48px 0', ...style }}>
      {children}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ label, title, icon, color = 'rgba(0,245,212,0.6)' }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
        letterSpacing: 3, textTransform: 'uppercase', color, marginBottom: 6,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <h2 style={{ margin: 0, fontFamily: 'var(--font-main)', fontSize: 28, fontWeight: 800, color: '#fff' }}>
        {title}
      </h2>
    </div>
  );
}

// ── Main Health Page ────────────────────────────────────────────────────────────
export function HealthPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ id: Date.now(), msg, type });
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/health/summary');
      setSummary(data);
    } catch (err) {
      console.error('[health/summary]', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div
      className="hl-page"
      style={{
        minHeight: '100vh',
        background: '#00000e',
        fontFamily: 'var(--font-main)',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '5%', left: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)',
          animation: 'hl-float-slow 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '-8%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          animation: 'hl-float-slow 18s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '40%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%)',
          animation: 'hl-float-slow 22s ease-in-out infinite 4s',
        }} />
      </div>

      <Header />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 1. Hero */}
        <HealthHero summary={summary} loading={loading} />

        <Divider color="rgba(0,245,212,0.12)" />

        {/* 2. Sleep + Graph */}
        <Section>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left: sleep + graph stacked */}
            <div style={{ flex: 2, minWidth: 280 }}>
              <SectionHeader
                label="REST & RECOVERY"
                title="Sleep Schedule"
                icon="🌙"
                color="rgba(0,245,212,0.6)"
              />
              <SleepSchedule
                wakeUpTime={summary?.wakeUpTime}
                sleepTime={summary?.sleepTime}
                onSaved={() => { fetchSummary(); showToast('Sleep schedule updated ✓', 'success'); }}
              />
            </div>

            {/* Right: hydration graph */}
            <div style={{ flex: 3, minWidth: 280 }}>
              <SectionHeader
                label="HYDRATION ANALYTICS"
                title="Weekly Trend"
                icon="📊"
                color="rgba(56,189,248,0.6)"
              />
              <ScoreGraph data={summary?.graph || []} />
            </div>
          </div>
        </Section>

        <Divider color="rgba(16,185,129,0.12)" />

        {/* 3. Habits */}
        <Section>
          <SectionHeader
            label="HABIT ENGINEERING"
            title="Build & Break Habits"
            icon="🌱"
            color="rgba(16,185,129,0.6)"
          />
          <HabitsManager
            habitsToBuild={summary?.habitsToBuild || []}
            habitsToQuit={summary?.habitsToQuit || []}
            onUpdated={() => { fetchSummary(); showToast('Habits updated ✓', 'info'); }}
          />
        </Section>

        <Divider color="rgba(167,139,250,0.12)" />

        {/* 4. Wellness Tips */}
        <Section style={{ paddingBottom: 80 }}>
          <SectionHeader
            label="SCIENCE-BACKED TIPS"
            title="Daily Wellness Practices"
            icon="✨"
            color="rgba(167,139,250,0.6)"
          />
          <WellnessTips />
        </Section>

        <div style={{ height: 60 }} />
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default HealthPage;
