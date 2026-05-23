import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TIPS = [
  {
    icon: '💧', color: '#38bdf8',
    title: 'Hydrate First Thing',
    body: 'Drink 500ml of water within 30 minutes of waking. Jumpstarts metabolism and flushes overnight toxins.',
  },
  {
    icon: '🌞', color: '#f59e0b',
    title: 'Morning Sunlight',
    body: 'Get 10–15 min of natural light before 10 AM to reset your circadian rhythm and boost serotonin.',
  },
  {
    icon: '🧘', color: '#10b981',
    title: '4-7-8 Breathing',
    body: 'Inhale 4s → hold 7s → exhale 8s. Activates the parasympathetic system and reduces cortisol.',
  },
  {
    icon: '📵', color: '#a78bfa',
    title: 'No Screens Before Bed',
    body: 'Avoid screens 60 min before sleep. Blue light suppresses melatonin and delays your sleep cycle.',
  },
  {
    icon: '🥗', color: '#4ade80',
    title: 'Protein at Every Meal',
    body: 'Aim for 25–35g protein per meal. Maintains muscle mass, stabilises blood sugar and keeps you full.',
  },
  {
    icon: '🚶', color: '#f87171',
    title: '10-Min Post-Meal Walk',
    body: 'A short walk after eating reduces blood glucose spikes by up to 30% and aids digestion.',
  },
];

export default function WellnessTips() {
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(wrapRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: wrapRef.current, start: 'top 88%' },
      }
    );

    const cards = listRef.current?.children;
    if (cards) {
      gsap.fromTo(cards,
        { opacity: 0, x: 30 },
        {
          opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: listRef.current, start: 'top 85%' },
          delay: 0.2,
        }
      );
    }
  }, []);

  return (
    <div ref={wrapRef} style={{ opacity: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.05))',
          border: '1px solid rgba(167,139,250,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>✨</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(167,139,250,0.7)', marginBottom: 0,
          }}>DAILY INSIGHTS</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-main)' }}>
            Wellness Tips
          </div>
        </div>
      </div>

      {/* Tips list */}
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TIPS.map((tip, i) => (
          <div
            key={i}
            className="hl-glass"
            style={{
              padding: '14px 18px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
              cursor: 'default', opacity: 0,
              borderColor: `${tip.color}18`,
              transition: 'border-color 0.3s, background 0.3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${tip.color}40`;
              e.currentTarget.style.background = `${tip.color}06`;
              gsap.to(e.currentTarget, { x: 4, duration: 0.2, ease: 'power2.out' });
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `${tip.color}18`;
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              gsap.to(e.currentTarget, { x: 0, duration: 0.3, ease: 'elastic.out(1,0.6)' });
            }}
          >
            {/* Icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: `${tip.color}18`, border: `1px solid ${tip.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>
              {tip.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-main)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>
                {tip.title}
              </div>
              <div style={{ fontFamily: 'var(--font-main)', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                {tip.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
