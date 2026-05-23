import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FiX } from 'react-icons/fi';

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b" },
  Lunch:     { icon: "🥗", color: "#10b981" },
  Snack:     { icon: "🍎", color: "#0ea5e9" },
  Dinner:    { icon: "🍽️", color: "#7c3aed" },
};

export function DietDetailedView({ diet, onClose }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!overlayRef.current || !modalRef.current) return;
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );
    gsap.fromTo(modalRef.current,
      { opacity: 0, scale: 0.9, y: 50 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
    );
  }, []);

  const handleClose = () => {
    gsap.timeline()
      .to(modalRef.current, { opacity: 0, scale: 0.9, y: 50, duration: 0.3 }, 0)
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0);
    setTimeout(onClose, 300);
  };

  const totalMacros = (diet.meals || []).reduce((acc, m) => {
    const p = parseInt(m.macros?.protein) || 0;
    const c = parseInt(m.macros?.carbs) || 0;
    const f = parseInt(m.macros?.fat) || 0;
    return { protein: acc.protein + p, carbs: acc.carbs + c, fat: acc.fat + f };
  }, { protein: 0, carbs: 0, fat: 0 });

  return (
    <div
      ref={overlayRef}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, backdropFilter: 'blur(6px)', padding: '16px',
      }}
    >
      <div
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,14,0.98), rgba(0,20,30,0.98))',
          border: '1px solid rgba(0,245,212,0.2)',
          borderRadius: 20,
          maxWidth: 700,
          width: '100%',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          padding: 'clamp(20px, 5vw, 32px)',
          color: '#e6f9f5',
          fontFamily: 'var(--font-main)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, border: 'none',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
        >
          <FiX />
        </button>

        {/* Header */}
        <h2 style={{ 
          margin: '0 0 6px 0', 
          fontSize: 'clamp(24px, 6vw, 32px)', 
          fontWeight: 800, 
          color: '#fff',
          lineHeight: 1.2,
          paddingRight: 36,
        }}>
          {diet.title}
        </h2>
        <p style={{ 
          margin: '0 0 20px 0', 
          fontSize: 'clamp(12px, 3vw, 14px)', 
          color: 'rgba(255,255,255,0.6)', 
          display: 'flex', 
          gap: 12, 
          flexWrap: 'wrap',
        }}>
          {diet.goal && <span>Goal: <strong>{diet.goal}</strong></span>}
          {diet.goal && <span>•</span>}
          <span><strong>{diet.totalCalories}</strong> kcal/day</span>
        </p>

        {/* Macros summary */}
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: 'clamp(10px, 3vw, 16px)', 
          marginBottom: 24,
          padding: 'clamp(12px, 3vw, 20px)', 
          background: 'rgba(0,245,212,0.05)', 
          borderRadius: 12, 
          border: '1px solid rgba(0,245,212,0.15)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 700, color: '#00f5d4' }}>
              {totalMacros.protein}g
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Protein
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 700, color: '#f59e0b' }}>
              {totalMacros.carbs}g
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Carbs
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(18px, 5vw, 28px)', fontWeight: 700, color: '#7c3aed' }}>
              {totalMacros.fat}g
            </div>
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              Fat
            </div>
          </div>
        </div>

        {/* Meals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 16px)' }}>
          {(diet.meals || []).map((meal, i) => {
            const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;
            return (
              <div key={i} style={{
                padding: 'clamp(12px, 3vw, 16px)', 
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${cfg.color}1a`,
                transition: 'all 0.2s',
              }}>
                {/* Meal header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 'clamp(10px, 3vw, 12px)', 
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 'clamp(20px, 5vw, 28px)', flexShrink: 0 }}>
                    {cfg.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 'clamp(10px, 2vw, 12px)', 
                      fontWeight: 700, 
                      color: cfg.color, 
                      letterSpacing: '1.5px', 
                      textTransform: 'uppercase',
                      marginBottom: 2,
                    }}>
                      {meal.type}
                    </div>
                    <div style={{ 
                      fontSize: 'clamp(14px, 4vw, 18px)', 
                      fontWeight: 800, 
                      color: '#fff', 
                      lineHeight: 1.2,
                    }}>
                      {meal.title}
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'right', 
                    flexShrink: 0,
                    minWidth: 'fit-content',
                  }}>
                    <div style={{ 
                      fontSize: 'clamp(14px, 4vw, 18px)', 
                      fontWeight: 700, 
                      color: cfg.color,
                    }}>
                      {meal.calories} kcal
                    </div>
                    {meal.time && (
                      <div style={{ 
                        fontSize: 'clamp(10px, 2vw, 11px)', 
                        color: 'rgba(255,255,255,0.5)', 
                        marginTop: 2,
                      }}>
                        {meal.time}
                      </div>
                    )}
                  </div>
                </div>

                {/* Foods list */}
                {meal.foods && meal.foods.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ 
                      fontSize: 'clamp(10px, 2vw, 11px)', 
                      fontWeight: 700, 
                      color: 'rgba(255,255,255,0.5)', 
                      marginBottom: 8, 
                      textTransform: 'uppercase', 
                      letterSpacing: '1px',
                    }}>
                      Ingredients
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {meal.foods.map((food, fi) => (
                        <div 
                          key={fi} 
                          style={{ 
                            fontSize: 'clamp(12px, 3vw, 14px)', 
                            color: 'rgba(255,255,255,0.75)', 
                            display: 'flex', 
                            gap: 8,
                            alignItems: 'flex-start',
                          }}
                        >
                          <span style={{ color: 'rgba(0,245,212,0.6)', flexShrink: 0 }}>•</span>
                          <span>{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Macros */}
                {meal.macros && (
                  <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', 
                    gap: 'clamp(8px, 2vw, 12px)',
                    padding: 'clamp(10px, 2vw, 12px)', 
                    background: 'rgba(255,255,255,0.01)', 
                    borderRadius: 8,
                    borderTop: `1px solid ${cfg.color}15`,
                    marginTop: 10,
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 'clamp(10px, 2vw, 11px)', 
                        color: 'rgba(255,255,255,0.5)', 
                        fontWeight: 700,
                        marginBottom: 4,
                      }}>
                        Protein
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(12px, 3vw, 14px)', 
                        fontWeight: 700, 
                        color: '#00f5d4',
                      }}>
                        {meal.macros.protein}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: 'clamp(10px, 2vw, 11px)', 
                        color: 'rgba(255,255,255,0.5)', 
                        fontWeight: 700,
                        marginBottom: 4,
                      }}>
                        Carbs
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(12px, 3vw, 14px)', 
                        fontWeight: 700, 
                        color: '#f59e0b',
                      }}>
                        {meal.macros.carbs}
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: 'clamp(10px, 2vw, 11px)', 
                        color: 'rgba(255,255,255,0.5)', 
                        fontWeight: 700,
                        marginBottom: 4,
                      }}>
                        Fat
                      </div>
                      <div style={{ 
                        fontSize: 'clamp(12px, 3vw, 14px)', 
                        fontWeight: 700, 
                        color: '#7c3aed',
                      }}>
                        {meal.macros.fat}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
