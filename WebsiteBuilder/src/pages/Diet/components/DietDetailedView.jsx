import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiX, FiClock, FiTarget, FiZap, FiDroplet, FiLayers } from "react-icons/fi";

const MEAL_CONFIG = {
  Breakfast: { icon: "🌅", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  Lunch:     { icon: "🥗", color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  Snack:     { icon: "🍎", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.2)"  },
  Dinner:    { icon: "🍽️", color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)"  },
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80";

// ── Macro Pill ────────────────────────────────────────────────────────────────
function MacroPill({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 4, padding: "10px 14px", borderRadius: 14,
      background: `${color}14`, border: `1px solid ${color}30`, flex: 1, minWidth: 70,
    }}>
      <Icon size={15} style={{ color }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontFamily: "var(--font-main)", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>{label}</span>
    </div>
  );
}

// ── Ingredient Tag ────────────────────────────────────────────────────────────
function IngTag({ text, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: 11,
      fontFamily: "var(--font-main)", fontWeight: 600,
      background: `${color}12`, border: `1px solid ${color}28`, color: `${color}cc`,
    }}>
      {text}
    </span>
  );
}

// ── Meal Row (detailed) ───────────────────────────────────────────────────────
function MealRowDetailed({ meal, color, bg, border, icon }) {
  const ingredients = meal.ingredients || [];
  const macros = meal.macros || {};

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${border}`,
      background: bg, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderBottom: `1px solid ${border}`,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color, letterSpacing: "1.8px", textTransform: "uppercase", fontWeight: 700, marginBottom: 2 }}>
            {meal.type}
          </div>
          <div style={{ fontFamily: "var(--font-main)", fontWeight: 800, fontSize: 15, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {meal.title}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color }}>{meal.calories}</div>
          <div style={{ fontFamily: "var(--font-main)", fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>kcal</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Description */}
        {meal.description && (
          <p style={{ margin: 0, fontFamily: "var(--font-main)", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
            {meal.description}
          </p>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Ingredients</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ingredients.map((ing, i) => <IngTag key={i} text={ing} color={color} />)}
            </div>
          </div>
        )}

        {/* Macros mini row */}
        {(macros.protein || macros.carbs || macros.fat) && (
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            {macros.protein && <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>P: <b style={{ color: "rgba(255,255,255,0.7)" }}>{macros.protein}g</b></span>}
            {macros.carbs  && <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>C: <b style={{ color: "rgba(255,255,255,0.7)" }}>{macros.carbs}g</b></span>}
            {macros.fat    && <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>F: <b style={{ color: "rgba(255,255,255,0.7)" }}>{macros.fat}g</b></span>}
          </div>
        )}

        {/* Prep time */}
        {meal.prepTime && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            <FiClock size={11} /> {meal.prepTime} prep
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main DetailedView ─────────────────────────────────────────────────────────
export function DietDetailedView({ diet, onClose }) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  // Animate in
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(panelRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
    );
  }, []);

  const handleClose = () => {
    gsap.timeline()
      .to(panelRef.current,   { opacity: 0, y: 30, scale: 0.96, duration: 0.25, ease: "power2.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1")
      .call(onClose);
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const imgSrc = diet.image || FALLBACK_IMG;

  // Totals
  const totalProtein = (diet.meals || []).reduce((s, m) => s + (m.macros?.protein || 0), 0);
  const totalCarbs   = (diet.meals || []).reduce((s, m) => s + (m.macros?.carbs   || 0), 0);
  const totalFat     = (diet.meals || []).reduce((s, m) => s + (m.macros?.fat     || 0), 0);

  return (
    /* ── Overlay — uses absolute positioning inside a full-page wrapper ── */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",      /* Sheet slides up from bottom on mobile */
        justifyContent: "center",
        padding: "0",
        boxSizing: "border-box",
      }}
    >
      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "92dvh",
          overflowY: "auto",
          background: "#07070f",
          border: "1px solid rgba(0,245,212,0.15)",
          borderRadius: "24px 24px 0 0",   /* bottom-sheet style on mobile */
          display: "flex",
          flexDirection: "column",
          position: "relative",
          /* scrollbar */
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,245,212,0.2) transparent",
        }}
      >
        {/* ── Hero Image ── */}
        <div style={{ position: "relative", height: "clamp(180px,28vw,260px)", flexShrink: 0, overflow: "hidden" }}>
          <img
            src={imgSrc}
            alt={diet.title}
            onError={e => { e.currentTarget.src = FALLBACK_IMG; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {/* Gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #07070f 0%, transparent 60%)" }} />

          {/* Close button */}
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: "absolute", top: 14, right: 14,
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,245,212,0.2)"; e.currentTarget.style.borderColor = "rgba(0,245,212,0.5)"; e.currentTarget.style.color = "#00f5d4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "#fff"; }}
          >
            <FiX />
          </button>

          {/* Category badge */}
          <div style={{ position: "absolute", top: 14, left: 14 }}>
            <span style={{
              padding: "4px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700,
              fontFamily: "var(--font-mono)", letterSpacing: "1.5px", textTransform: "uppercase",
              background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.4)", color: "#00f5d4",
            }}>
              {diet.category || diet.goal || "Custom"}
            </span>
          </div>

          {/* Title overlay */}
          <div style={{ position: "absolute", bottom: 18, left: 20, right: 60 }}>
            <h2 style={{
              margin: 0, fontFamily: "var(--font-main)", fontWeight: 900,
              fontSize: "clamp(18px,4vw,26px)", color: "#fff",
              letterSpacing: "-0.5px", lineHeight: 1.2,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}>
              {diet.title}
            </h2>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <MacroPill icon={FiZap}    label="Calories" value={`${diet.totalCalories ?? 0}`}  color="#f59e0b" />
            {totalProtein > 0 && <MacroPill icon={FiTarget}  label="Protein"   value={`${totalProtein}g`}           color="#10b981" />}
            {totalCarbs   > 0 && <MacroPill icon={FiLayers}  label="Carbs"     value={`${totalCarbs}g`}             color="#0ea5e9" />}
            {totalFat     > 0 && <MacroPill icon={FiDroplet} label="Fat"       value={`${totalFat}g`}               color="#7c3aed" />}
          </div>

          {/* Goal + description */}
          {(diet.goal || diet.description) && (
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {diet.goal && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#00f5d4", marginBottom: 6 }}>
                  🎯 Goal — {diet.goal}
                </div>
              )}
              {diet.description && (
                <p style={{ margin: 0, fontFamily: "var(--font-main)", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {diet.description}
                </p>
              )}
            </div>
          )}

          {/* Meals section */}
          {(diet.meals || []).length > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(0,245,212,0.45)", marginBottom: 14 }}>
                ── Meal Breakdown ──
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {diet.meals.map((meal, i) => {
                  const cfg = MEAL_CONFIG[meal.type] ?? MEAL_CONFIG.Dinner;
                  return (
                    <MealRowDetailed
                      key={i}
                      meal={meal}
                      color={cfg.color}
                      bg={cfg.bg}
                      border={cfg.border}
                      icon={cfg.icon}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes / tips */}
          {diet.notes && (
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.15)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(0,245,212,0.5)", marginBottom: 6 }}>
                Tips & Notes
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-main)", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                {diet.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}