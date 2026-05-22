import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  Lunch:     { icon: "🥗", color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  Snack:     { icon: "🍎", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)"  },
  Dinner:    { icon: "🍽️", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)"  },
};

function MealCard({ meal, index }) {
  const ref = useRef(null);
  const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0,  scale: 1, duration: 0.65, delay: index * 0.12, ease: "power3.out" }
    );
  }, [index]);

  return (
    <div ref={ref} style={{
      borderRadius: 20, padding: 24,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      backdropFilter: "blur(16px)",
      transition: "transform 0.25s, box-shadow 0.25s",
      cursor: "default",
    }}
      onMouseEnter={e => gsap.to(e.currentTarget, { y: -5, scale: 1.02, duration: 0.3, ease: "power2.out" })}
      onMouseLeave={e => gsap.to(e.currentTarget, { y: 0,  scale: 1,    duration: 0.45, ease: "elastic.out(1,0.5)" })}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{cfg.icon}</span>
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: cfg.color, letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700,
            }}>{meal.type}</div>
            <div style={{ fontFamily: "var(--font-main)", fontSize: 15, fontWeight: 700, color: "#fff", marginTop: 2 }}>{meal.title}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: cfg.color, textShadow: `0 0 14px ${cfg.color}88` }}>{meal.calories}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "1px" }}>KCAL</div>
        </div>
      </div>

      {/* Time */}
      {meal.time && (
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>⏰</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "1px" }}>{meal.time}</span>
        </div>
      )}

      {/* Foods */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(meal.foods || []).map((food, i) => (
          <span key={i} style={{
            padding: "4px 10px", borderRadius: 99,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.55)",
          }}>{food}</span>
        ))}
      </div>

      {/* Macros */}
      {meal.macros && (
        <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {Object.entries(meal.macros).map(([key, val]) => (
            <div key={key} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: cfg.color }}>{val}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "1px", textTransform: "uppercase" }}>{key}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DietMealPreview({ diet, onSave, saving, onDismiss }) {
  const [saved, setSaved] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, [diet]);

  if (!diet) return null;

  const handleSave = async () => {
    if (saving || saved) return;
    await onSave(diet);
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  return (
    <section style={{ padding: "60px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Section header */}
        <div ref={headerRef} style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "2.5px" }}>── AI GENERATED ──</span>
          <h2 style={{ marginTop: 12, fontFamily: "var(--font-main)", fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            Your{" "}
            <span className="diet-gradient-text">Personalized Plan</span>
          </h2>

          {/* Plan summary strip */}
          <div style={{
            marginTop: 20, display: "inline-flex", alignItems: "center", gap: 16,
            padding: "12px 24px", borderRadius: 99,
            background: "rgba(0,245,212,0.05)", border: "1px solid rgba(0,245,212,0.18)",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-main)", fontSize: 14, fontWeight: 700, color: "#fff" }}>{diet.title}</span>
            <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(0,245,212,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>{diet.goal}</span>
            <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>
              {diet.totalCalories} kcal/day
            </span>
          </div>
        </div>

        {/* Meal grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 18 }}>
          {(diet.meals || []).map((meal, i) => (
            <MealCard key={i} meal={meal} index={i} />
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={handleSave} disabled={saving || saved}
            style={{
              padding: "14px 36px", borderRadius: 14, border: "none", cursor: saving || saved ? "default" : "pointer",
              fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 14,
              background: saved ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#00f5d4,#7c3aed)",
              color: saved ? "#4ade80" : "#000",
              border: saved ? "1px solid rgba(74,222,128,0.3)" : "none",
              boxShadow: !saved && !saving ? "0 8px 28px rgba(0,245,212,0.22)" : "none",
              transition: "all 0.25s", display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {saving ? (
              <>
                <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00f5d4", animation: "diet-spin 0.8s linear infinite", display: "inline-block" }} />
                Saving...
              </>
            ) : saved ? "✅ Added to Today's Plan!" : "➕ Add to Today's Plan"}
          </button>

          <button onClick={onDismiss}
            style={{
              padding: "14px 28px", borderRadius: 14, cursor: "pointer",
              fontFamily: "var(--font-main)", fontWeight: 600, fontSize: 14,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.45)", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            ✕ Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}
