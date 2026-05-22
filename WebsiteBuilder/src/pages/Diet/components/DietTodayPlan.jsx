import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b", border: "rgba(245,158,11,0.2)"  },
  Lunch:     { icon: "🥗", color: "#10b981", border: "rgba(16,185,129,0.2)"  },
  Snack:     { icon: "🍎", color: "#0ea5e9", border: "rgba(14,165,233,0.2)"  },
  Dinner:    { icon: "🍽️", color: "#7c3aed", border: "rgba(124,58,237,0.2)" },
};

function TodayMealRow({ meal, index }) {
  const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 16,
      padding: "16px 20px", borderRadius: 16,
      background: "rgba(255,255,255,0.025)", border: `1px solid ${cfg.border}`,
      transition: "transform 0.25s",
    }}
      onMouseEnter={e => gsap.to(e.currentTarget, { x: 4, duration: 0.2 })}
      onMouseLeave={e => gsap.to(e.currentTarget, { x: 0, duration: 0.3 })}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{cfg.icon}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: cfg.color, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700 }}>{meal.type}</span>
          {meal.time && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>· {meal.time}</span>}
        </div>
        <div style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 3 }}>{meal.title}</div>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {(meal.foods || []).slice(0, 4).map((f, i) => (
            <span key={i} style={{
              padding: "3px 9px", borderRadius: 99,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
              fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.45)",
            }}>{f}</span>
          ))}
          {(meal.foods || []).length > 4 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.25)", padding: "3px 6px" }}>+{meal.foods.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Calories */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: cfg.color }}>{meal.calories}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "1px" }}>KCAL</div>
      </div>
    </div>
  );
}

export function DietTodayPlan({ dietPlan, loading }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true } }
    );
  }, []);

  return (
    <section style={{ padding: "60px 24px 100px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }} ref={sectionRef}>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "2.5px" }}>── TODAY'S PLAN ──</span>
          <h2 style={{ marginTop: 12, fontFamily: "var(--font-main)", fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            Today's{" "}
            <span style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nutrition Log
            </span>
          </h2>
        </div>

        {/* Card */}
        <div className="diet-glass" style={{ padding: 32 }}>

          {loading ? (
            /* Loading skeleton */
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 80, borderRadius: 16, background: "rgba(255,255,255,0.03)", animation: "diet-shimmer 1.5s infinite", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", animation: "diet-shimmer 1.5s infinite" }} />
                </div>
              ))}
            </div>
          ) : dietPlan ? (
            <>
              {/* Plan title bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 24, paddingBottom: 20,
                borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontFamily: "var(--font-main)", fontSize: 18, fontWeight: 800, color: "#fff" }}>{dietPlan.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 4 }}>{dietPlan.goal}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "#f59e0b", textShadow: "0 0 20px rgba(245,158,11,0.5)" }}>
                    {dietPlan.totalCalories}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "1.5px" }}>TOTAL KCAL</div>
                </div>
              </div>

              {/* Meal rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(dietPlan.meals || []).map((meal, i) => (
                  <TodayMealRow key={i} meal={meal} index={i} />
                ))}
              </div>
            </>
          ) : (
            /* Empty state */
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
              <div style={{ fontFamily: "var(--font-main)", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>No diet plan for today yet.</div>
              <div style={{ fontFamily: "var(--font-main)", fontSize: 13, color: "rgba(255,255,255,0.22)", marginTop: 8, lineHeight: 1.6 }}>
                Generate one above and tap <strong style={{ color: "rgba(0,245,212,0.5)" }}>Add to Today's Plan</strong> to log it here.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
