import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import api from '../../../utils/axios';

// ── Sleep Duration Calculator ──────────────────────────────────────────────
function parseTo24(timeStr) {
  if (!timeStr) return { h: 0, m: 0 };
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return { h: 0, m: 0 };
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h, m };
}

function calcDuration(wake, sleep) {
  const w = parseTo24(wake);
  const s = parseTo24(sleep);
  let wMins = w.h * 60 + w.m;
  let sMins = s.h * 60 + s.m;
  if (wMins <= sMins) wMins += 24 * 60; // past midnight
  const diff = wMins - sMins;
  const hours = Math.floor(diff / 60);
  const mins  = diff % 60;
  return { hours, mins, total: diff };
}

function SleepArc({ hours }) {
  // 8h = ideal. Arc goes 0–270deg for 0–10h
  const maxH  = 10;
  const pct   = Math.min(hours / maxH, 1);
  const r     = 60;
  const cx    = 80, cy = 80;
  const startAngle = 135 * (Math.PI / 180);
  const sweep  = 270 * (Math.PI / 180);
  const endAngle = startAngle + sweep * pct;

  const polar = (angle) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const trackStart = polar(startAngle);
  const trackEnd   = polar(startAngle + sweep);
  const fillEnd    = polar(endAngle);

  const largeArcTrack = 1;
  const largeArcFill  = pct > 0.5 ? 1 : 0;

  const color = hours >= 7 ? '#00f5d4' : hours >= 5 ? '#f59e0b' : '#f43f5e';

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* Track arc */}
      <path
        d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcTrack} 1 ${trackEnd.x} ${trackEnd.y}`}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"
      />
      {/* Fill arc */}
      {pct > 0 && (
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${largeArcFill} 1 ${fillEnd.x} ${fillEnd.y}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}
      {/* Center */}
      <text x="80" y="74" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="22" fontWeight="700" fill={color}>
        {hours}h
      </text>
      <text x="80" y="93" textAnchor="middle" fontFamily="var(--font-main)" fontSize="10" fill="rgba(255,255,255,0.35)">
        sleep
      </text>
    </svg>
  );
}

export default function SleepSchedule({ wakeUpTime = '06:00 AM', sleepTime = '10:00 PM', onSaved }) {
  const [wake,   setWake]   = useState(wakeUpTime);
  const [sleep,  setSleep]  = useState(sleepTime);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setWake(wakeUpTime);
    setSleep(sleepTime);
  }, [wakeUpTime, sleepTime]);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3,
        scrollTrigger: { trigger: cardRef.current, start: 'top 85%' }
      }
    );
  }, []);

  const dur = calcDuration(wake, sleep);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/health/sleep', { wakeUpTime: wake, sleepTime: sleep });
      onSaved && onSaved();
    } catch (err) {
      console.error('[health/sleep-save]', err?.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={cardRef} className="hl-glass hl-glass-teal" style={{ padding: 28, marginBottom: 20, opacity: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(0,245,212,0.2), rgba(0,245,212,0.05))',
          border: '1px solid rgba(0,245,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>🌙</div>
        <div>
          <div className="hl-section-label" style={{ marginBottom: 0 }}>SLEEP SCHEDULE</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-main)' }}>Rest & Recovery</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Arc visualisation */}
        <div style={{ flexShrink: 0 }}>
          <SleepArc hours={dur.hours} />
        </div>

        {/* Controls */}
        <div style={{ flex: 1, minWidth: 180 }}>
          {/* Quality badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            borderRadius: 99, marginBottom: 20,
            background: dur.hours >= 7 ? 'rgba(0,245,212,0.1)' : dur.hours >= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
            border: `1px solid ${dur.hours >= 7 ? 'rgba(0,245,212,0.3)' : dur.hours >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)'}`,
            color: dur.hours >= 7 ? '#00f5d4' : dur.hours >= 5 ? '#f59e0b' : '#f87171',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: 1,
          }}>
            <span>{dur.hours >= 7 ? '✓' : dur.hours >= 5 ? '⚠' : '✗'}</span>
            <span>{dur.hours >= 7 ? 'Optimal Sleep' : dur.hours >= 5 ? 'Below Target' : 'Sleep Deficit'}</span>
          </div>

          {/* Time inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
                Bed Time
              </label>
              <input
                className="hl-input"
                value={sleep}
                onChange={e => setSleep(e.target.value)}
                placeholder="e.g. 10:30 PM"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 6 }}>
                Wake Up
              </label>
              <input
                className="hl-input"
                value={wake}
                onChange={e => setWake(e.target.value)}
                placeholder="e.g. 06:30 AM"
              />
            </div>
          </div>

          <button
            className="hl-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ marginTop: 16, padding: '10px 20px', width: '100%' }}
          >
            {saving ? 'Saving…' : '💾 Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
