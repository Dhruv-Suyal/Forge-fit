import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiTrash2, FiEdit2, FiX, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b", bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.2)"  },
  Lunch:     { icon: "🥗", color: "#10b981", bg: "rgba(16,185,129,0.07)",  border: "rgba(16,185,129,0.2)"  },
  Snack:     { icon: "🍎", color: "#0ea5e9", bg: "rgba(14,165,233,0.07)",  border: "rgba(14,165,233,0.2)"  },
  Dinner:    { icon: "🍽️", color: "#7c3aed", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.2)"  },
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80";

// ── Single Saved Diet Card ────────────────────────────────────────────────────
function SavedDietCard({ diet: initial, onDelete, onUpdate }) {
  const cardRef = useRef(null);
  const [diet,      setDiet]      = useState(initial);
  const [editMode,  setEditMode]  = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [imgError,  setImgError]  = useState(false);

  const imgSrc = imgError || !diet.image ? FALLBACK_IMG : diet.image;

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    gsap.to(card, { rotateY: x, rotateX: y, duration: 0.3, ease: "power2.out", transformPerspective: 800 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    gsap.to(cardRef.current, {
      rotateY: 0, rotateX: 0,
      boxShadow: "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)",
      duration: 0.5, ease: "elastic.out(1,0.5)",
    });
  }, []);

  const handleDelete = () => {
    setDeleting(true);
    gsap.timeline()
      .to(cardRef.current, { opacity: 0, scale: 0.95, y: -10, duration: 0.25, ease: "power2.in" })
      .to(cardRef.current, { height: 0, marginBottom: 0, duration: 0.3, ease: "power2.inOut" })
      .call(() => onDelete(diet._id));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await onUpdate(diet._id, {
        title:         diet.title,
        goal:          diet.goal,
        category:      diet.category,
        totalCalories: diet.totalCalories,
        meals:         diet.meals,
      });
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={cardRef} className="diet-glass"
      style={{
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)",
        cursor: "default", display: "flex", flexDirection: "column",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={e => gsap.to(e.currentTarget, { boxShadow: "0 8px 60px rgba(0,245,212,0.15), 0 0 0 1px rgba(0,245,212,0.25)", duration: 0.3 })}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden", flexShrink: 0, background: "#000" }}>
        <img src={imgSrc} alt={diet.title} onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
          onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.6 })}
          onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1,    duration: 0.6 })}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,14,0.92), transparent)" }} />

        {/* Category badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{
            padding: "4px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700,
            fontFamily: "var(--font-mono)", letterSpacing: "1.5px", textTransform: "uppercase",
            background: "rgba(0,245,212,0.12)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4",
          }}>{diet.category || "Custom"}</span>
        </div>

        {/* Edit toggle */}
        <button onClick={() => { setEditMode(m => !m); if (editMode) setDiet(initial); }}
          style={{
            position: "absolute", top: 12, right: 44,
            width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
            background: editMode ? "rgba(0,245,212,0.2)" : "rgba(0,0,0,0.55)",
            border: `1px solid ${editMode ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.2)"}`,
            color: editMode ? "#00f5d4" : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            backdropFilter: "blur(4px)", transition: "all 0.2s",
          }}
        >{editMode ? <FiX /> : <FiEdit2 />}</button>

        {/* Delete button */}
        <button onClick={handleDelete} disabled={deleting}
          style={{
            position: "absolute", top: 12, right: 12,
            width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            opacity: deleting ? 0.5 : 1, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
        ><FiTrash2 /></button>

        {/* Calories on image */}
        <div style={{ position: "absolute", bottom: 12, right: 14, fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#f59e0b", textShadow: "0 0 12px rgba(245,158,11,0.5)" }}>
          {diet.totalCalories} kcal
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Title */}
        {editMode ? (
          <input value={diet.title || ""} onChange={e => setDiet(p => ({ ...p, title: e.target.value }))}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,245,212,0.3)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontFamily: "var(--font-main)", fontWeight: 800, fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" }}
          />
        ) : (
          <h3 style={{ margin: 0, fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "-0.3px" }}>
            {diet.title}
          </h3>
        )}

        {/* Goal */}
        {editMode ? (
          <input value={diet.goal || ""} onChange={e => setDiet(p => ({ ...p, goal: e.target.value }))}
            placeholder="Goal (e.g. muscle-gain)"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,212,0.2)", borderRadius: 8, padding: "5px 10px", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-main)", fontSize: 12, outline: "none", boxSizing: "border-box" }}
          />
        ) : (
          <div style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>🎯 {diet.goal || "General"}</div>
        )}

        {/* Meals — collapsible */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(diet.meals || []).slice(0, expanded ? undefined : 2).map((meal, i) => {
            const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: cfg.color, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>{meal.type}</div>
                  <div style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meal.title}</div>
                  {expanded && meal.foods?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {meal.foods.slice(0,4).map((f,fi) => (
                        <span key={fi} style={{ padding: "2px 7px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-main)", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{f}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: cfg.color, flexShrink: 0 }}>{meal.calories}</div>
              </div>
            );
          })}

          {(diet.meals || []).length > 2 && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(0,245,212,0.5)", padding: "2px 0" }}
            >
              {expanded ? <><FiChevronUp /> Show less</> : <><FiChevronDown /> +{diet.meals.length - 2} more meals</>}
            </button>
          )}
        </div>

        {/* Edit save / cancel */}
        {editMode && (
          <button onClick={handleUpdate} disabled={saving}
            style={{
              marginTop: 6, width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,#00f5d4,#7c3aed)", color: "#000",
              fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              opacity: saving ? 0.7 : 1, transition: "all 0.2s",
            }}
          >
            {saving ? "Saving..." : <><FiCheck /> Save Changes</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Saved Diet Plans Grid ─────────────────────────────────────────────────────
export function DietSavedPlans({ diets, onDelete, onUpdate, loading }) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (!gridRef.current || !diets?.length) return;
    const cards = gridRef.current.querySelectorAll(".diet-glass");
    gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 80%", once: true },
      }
    );
  }, [diets]);

  return (
    <section style={{ padding: "60px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "2.5px", textAlign: "center", marginBottom: 12 }}>── YOUR LIBRARY ──</div>
      <h2 style={{ textAlign: "center", fontFamily: "var(--font-main)", fontWeight: 800, fontSize: "clamp(26px,4vw,42px)", color: "#fff", marginBottom: 8, letterSpacing: "-1px" }}>
        Saved <span className="diet-gradient-text">Diet Plans</span>
      </h2>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-main)", fontSize: 14, marginBottom: 48 }}>
        {diets?.length || 0} plan{diets?.length !== 1 ? "s" : ""} saved to your profile
      </p>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 380, borderRadius: 24, background: "rgba(255,255,255,0.03)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", animation: "diet-shimmer 1.6s infinite" }} />
            </div>
          ))}
        </div>
      ) : !diets?.length ? (
        <div style={{ textAlign: "center", padding: "80px 24px", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 24, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-main)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.32)" }}>No diet plans saved yet</div>
          <div style={{ fontSize: 13 }}>Generate your first AI diet plan above to get started</div>
        </div>
      ) : (
        <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
          {diets.map(d => (
            <SavedDietCard key={d._id} diet={d} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}
