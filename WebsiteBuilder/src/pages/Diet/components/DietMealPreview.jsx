import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { FiSave, FiRefreshCw, FiEdit2, FiX, FiCheck, FiEye } from "react-icons/fi";
import { DietDetailedView } from "./DietDetailedView";

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b" },
  Lunch:     { icon: "🥗", color: "#10b981" },
  Snack:     { icon: "🍎", color: "#0ea5e9" },
  Dinner:    { icon: "🍽️", color: "#7c3aed" },
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80";

// ── Single Diet Plan Card ─────────────────────────────────────────────────────
function DietCard({ diet: initialDiet, index, onSave, saving }) {
  const cardRef  = useRef(null);
  const [diet,      setDiet]      = useState(initialDiet);
  const [imgError,  setImgError]  = useState(false);
  const [editMode,  setEditMode]  = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, delay: index * 0.13, ease: "back.out(1.4)" }
    );
  }, [index]);

  const imgSrc = imgError || !diet.image ? FALLBACK_IMG : diet.image;

  const handleSave = () => {
    gsap.timeline()
      .to(cardRef.current, { scale: 0.97, duration: 0.1 })
      .to(cardRef.current, { scale: 1, duration: 0.2, ease: "back.out(1.4)" });
    onSave(diet, index);
  };

  return (
    <div ref={cardRef} className="diet-glass"
      style={{
        opacity: 0, display: "flex", flexDirection: "column", overflow: "hidden",
        border: "1px solid rgba(0,245,212,0.15)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
        transition: "box-shadow 0.3s, border-color 0.3s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.35)"; e.currentTarget.style.boxShadow = "0 8px 48px rgba(0,245,212,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.15)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,0,0,0.4)"; }}
    >
      {/* ── Image ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0, background: "#000" }}>
        <img src={imgSrc} alt={diet.title} onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
          onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.06, duration: 0.5 })}
          onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.5 })}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to top, rgba(0,0,14,0.95), transparent)" }} />

        {/* Category badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "1.5px", textTransform: "uppercase",
            background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.4)", color: "#00f5d4",
          }}>
            {diet.category || diet.goal || "Custom"}
          </span>
        </div>

        {/* Edit toggle */}
        <button onClick={() => { setEditMode(m => !m); if (editMode) setDiet(initialDiet); }}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer",
            background: editMode ? "rgba(0,245,212,0.2)" : "rgba(0,0,0,0.5)",
            border: `1px solid ${editMode ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.2)"}`,
            color: editMode ? "#00f5d4" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            backdropFilter: "blur(4px)", transition: "all 0.2s",
          }}
        >
          {editMode ? <FiX /> : <FiEdit2 />}
        </button>

        {/* Calorie badge on image */}
        <div style={{ position: "absolute", bottom: 14, right: 14 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "#f59e0b",
            textShadow: "0 0 16px rgba(245,158,11,0.6)",
          }}>
            {diet.totalCalories} kcal
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Title */}
        {editMode ? (
          <input value={diet.title || ""} onChange={e => setDiet(p => ({ ...p, title: e.target.value }))}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,245,212,0.3)",
              borderRadius: 10, padding: "8px 12px", color: "#fff",
              fontFamily: "var(--font-main)", fontWeight: 800, fontSize: 16,
              width: "100%", outline: "none", boxSizing: "border-box",
            }}
          />
        ) : (
          <h3 style={{ margin: 0, fontFamily: "var(--font-main)", fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.3 }}>
            {diet.title}
          </h3>
        )}

        {/* Goal + calories row */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {editMode ? (
            <input value={diet.goal || ""} onChange={e => setDiet(p => ({ ...p, goal: e.target.value }))}
              placeholder="Goal"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,245,212,0.2)", borderRadius: 8, padding: "5px 10px", color: "#fff", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, outline: "none", flex: 1 }}
            />
          ) : diet.goal ? (
            <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)" }}>
              🎯 {diet.goal}
            </span>
          ) : null}
          {editMode && (
            <input value={diet.totalCalories || ""} onChange={e => setDiet(p => ({ ...p, totalCalories: Number(e.target.value) }))}
              type="number" placeholder="Calories"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,245,212,0.2)", borderRadius: 8, padding: "5px 10px", color: "#f59e0b", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, outline: "none", width: 100 }}
            />
          )}
        </div>

        {/* Meals list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(diet.meals || []).slice(0, expanded ? undefined : 2).map((meal, i) => {
            const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${cfg.color}22` }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: cfg.color, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>{meal.type}</div>
                  <div style={{ fontFamily: "var(--font-main)", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meal.title}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>{meal.calories} cal</div>
              </div>
            );
          })}
          {(diet.meals || []).length > 2 && (
            <button onClick={() => setExpanded(e => !e)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(0,245,212,0.55)", padding: "2px 0", textAlign: "left" }}>
              {expanded ? "▲ Show less" : `▼ +${(diet.meals.length - 2)} more meals`}
            </button>
          )}
        </div>

        {/* Buttons */}
        <div style={{ marginTop: "auto", paddingTop: 4, display: "flex", gap: 10 }}>
          <button onClick={() => setShowDetail(true)} disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(0,245,212,0.3)",
              background: "transparent", cursor: "pointer",
              color: "#00f5d4", fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.25s",
            }}
          >
            <FiEye /> View Full
          </button>

          <button onClick={handleSave} disabled={saving}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "none", cursor: saving ? "not-allowed" : "pointer",
              background: saving ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#00f5d4,#7c3aed)",
              color: saving ? "rgba(255,255,255,0.4)" : "#000",
              fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: !saving ? "0 4px 20px rgba(0,245,212,0.2)" : "none",
              transition: "all 0.25s",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00f5d4", animation: "diet-spin 0.8s linear infinite", display: "inline-block" }} />Saving...</>
            ) : (
              <>{editMode ? <FiCheck /> : <FiSave />}{editMode ? "Save Edited" : "Save"}</>
            )}
          </button>
        </div>

        {/* Detailed View Modal */}
        {showDetail && (
          <DietDetailedView diet={diet} onClose={() => setShowDetail(false)} />
        )}
      </div>
    </div>
  );
}

// ── Preview Section (3 cards) ─────────────────────────────────────────────────
export function DietMealPreview({ diets, onSave, onRegenerate, saving, savingId }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !diets?.length) return;
    gsap.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
  }, [diets]);

  if (!diets?.length) return null;

  return (
    <section ref={sectionRef} style={{ padding: "0 24px 80px", maxWidth: 1200, margin: "0 auto", opacity: 0 }}>
      {/* Header */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "2.5px", textAlign: "center", marginBottom: 12 }}>── AI RESULTS ──</div>
      <h2 style={{ textAlign: "center", fontFamily: "var(--font-main)", fontWeight: 800, fontSize: "clamp(24px,4vw,40px)", color: "#fff", marginBottom: 8, letterSpacing: "-1px" }}>
        Choose Your <span className="diet-gradient-text">Diet Plan</span>
      </h2>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-main)", fontSize: 14, marginBottom: 40 }}>
        AI generated {diets.length} variations — pick one that fits, or edit before saving.
      </p>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24, marginBottom: 32 }}>
        {diets.map((d, i) => (
          <DietCard key={i} diet={d} index={i} onSave={onSave} saving={saving && savingId === i} />
        ))}
      </div>

      {/* Regenerate */}
      <div style={{ textAlign: "center" }}>
        <button onClick={onRegenerate}
          style={{
            padding: "12px 28px", borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.35)"; e.currentTarget.style.color = "#00f5d4"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          <FiRefreshCw /> Regenerate All
        </button>
      </div>
    </section>
  );
}
