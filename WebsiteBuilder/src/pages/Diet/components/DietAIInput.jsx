import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AI_MESSAGES = [
  "Analyzing your nutrition profile...",
  "Calibrating macro ratios...",
  "Generating breakfast plan...",
  "Optimising lunch & dinner...",
  "Finalising your diet plan...",
];

const GOALS = [
  { value: "weight-loss",   label: "⚖️  Weight Loss",    color: "#ef4444" },
  { value: "muscle-gain",   label: "💪  Muscle Gain",    color: "#00f5d4" },
  { value: "maintenance",   label: "🍽️  Maintenance",   color: "#10b981" },
  { value: "performance",   label: "⚡  Performance",    color: "#f59e0b" },
  { value: "general health",label: "🌿  General Health", color: "#0ea5e9" },
];

const DIETARY_OPTIONS = [
  { value: "none",       label: "🥗 No Restrictions" },
  { value: "vegetarian", label: "🥬 Vegetarian" },
  { value: "vegan",      label: "🌱 Vegan" },
  { value: "keto",       label: "🥓 Keto" },
  { value: "paleo",      label: "🍖 Paleo" },
  { value: "gluten-free",label: "🌾 Gluten-Free" },
];

export function DietAIInput({ onGenerated, loading: externalLoading }) {
  const [form,    setForm]    = useState({ title: "", goal: "", dietaryRestrictions: "none" });
  const [loading, setLoading] = useState(false);
  const [aiMsg,   setAiMsg]   = useState(AI_MESSAGES[0]);
  const [error,   setError]   = useState("");
  const cardRef  = useRef(null);
  const timerRef = useRef(null);

  const isLoading = loading || externalLoading;

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: cardRef.current, start: "top 85%", once: true },
      }
    );
  }, []);

  const startMsgCycle = () => {
    let i = 0;
    timerRef.current = setInterval(() => {
      i = (i + 1) % AI_MESSAGES.length;
      setAiMsg(AI_MESSAGES[i]);
    }, 1800);
  };

  const handleGenerate = async () => {
    if (!form.title.trim() || isLoading) return;
    setLoading(true);
    setError("");
    setAiMsg(AI_MESSAGES[0]);
    startMsgCycle();
    try {
      await onGenerated(form);
    } catch (err) {
      setError(err?.response?.data?.message || "Generation failed. Please try again.");
    } finally {
      clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const inputStyle = {
    width: "100%", borderRadius: 14, padding: "13px 18px",
    background: "rgba(255,255,255,0.04)", color: "#e2e8f0",
    fontFamily: "var(--font-main)", fontSize: 15,
    border: "1px solid rgba(255,255,255,0.1)",
    caretColor: "#00f5d4", transition: "border 0.2s, box-shadow 0.2s",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)", fontSize: 10,
    color: "rgba(0,245,212,0.6)", letterSpacing: "2px",
    display: "block", marginBottom: 8,
  };

  return (
    <section id="diet-ai-input" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "2.5px" }}>── STEP 01 ──</span>
          <h2 style={{
            marginTop: 12, fontFamily: "var(--font-main)",
            fontSize: "clamp(26px,4vw,42px)", fontWeight: 800,
            color: "#fff", letterSpacing: "-1.5px",
          }}>
            Tell the AI Your{" "}
            <span className="diet-gradient-text">Nutrition Goals</span>
          </h2>
          <p style={{ marginTop: 10, fontFamily: "var(--font-main)", fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Enter a plan name and select your goal — the AI handles the rest.
          </p>
        </div>

        {/* Card */}
        <div ref={cardRef} className="diet-glass" style={{ padding: 36 }}>

          {/* Ambient glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,245,212,0.06),transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, position: "relative", zIndex: 1 }}>

            {/* Plan Title */}
            <div>
              <label style={labelStyle}>PLAN TITLE *</label>
              <input
                className="diet-input"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Lean Bulk Protocol, Keto Reset, Clean Eating..."
                style={inputStyle}
                disabled={isLoading}
              />
            </div>

            {/* Goal */}
            <div>
              <label style={labelStyle}>PRIMARY GOAL</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
                {GOALS.map(g => {
                  const active = form.goal === g.value;
                  return (
                    <button key={g.value}
                      onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                      disabled={isLoading}
                      style={{
                        padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600,
                        textAlign: "left", transition: "all 0.2s",
                        background: active ? `${g.color}18` : "rgba(255,255,255,0.03)",
                        border: active ? `1px solid ${g.color}55` : "1px solid rgba(255,255,255,0.08)",
                        color: active ? g.color : "rgba(255,255,255,0.5)",
                        boxShadow: active ? `0 0 20px ${g.color}15` : "none",
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label style={labelStyle}>DIETARY RESTRICTIONS</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10 }}>
                {DIETARY_OPTIONS.map(d => {
                  const active = form.dietaryRestrictions === d.value;
                  return (
                    <button key={d.value}
                      onClick={() => setForm(f => ({ ...f, dietaryRestrictions: d.value }))}
                      disabled={isLoading}
                      style={{
                        padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        fontFamily: "var(--font-main)", fontSize: 13, fontWeight: 600,
                        textAlign: "center", transition: "all 0.2s",
                        background: active ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.03)",
                        border: active ? "1px solid rgba(0,245,212,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        color: active ? "#00f5d4" : "rgba(255,255,255,0.5)",
                        boxShadow: active ? "0 0 20px rgba(0,245,212,0.15)" : "none",
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", fontFamily: "var(--font-main)", fontSize: 13, color: "#f87171" }}>
              ⚠ {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !form.title.trim()}
            style={{
              marginTop: 24, width: "100%", padding: "16px 0", borderRadius: 16, border: "none",
              fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 15, cursor: isLoading || !form.title.trim() ? "not-allowed" : "pointer",
              background: isLoading ? "transparent" : "linear-gradient(135deg,#00f5d4,#7c3aed)",
              color: isLoading ? "#00f5d4" : "#000",
              border: isLoading ? "1px solid rgba(0,245,212,0.3)" : "none",
              opacity: !form.title.trim() && !isLoading ? 0.4 : 1,
              boxShadow: !isLoading && form.title.trim() ? "0 8px 32px rgba(0,245,212,0.22)" : "none",
              transition: "all 0.25s",
              position: "relative", overflow: "hidden",
            }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00f5d4", animation: "diet-spin 0.8s linear infinite", display: "inline-block", flexShrink: 0 }} />
                {aiMsg}
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                🧠 Generate My Diet Plan
              </span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
