import { useState, useEffect, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";

gsap.registerPlugin(ScrollTrigger);

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = {
  generate: "/api/ai/manual-diet",
  save:     "/api/diet",
  list:     "/api/diet",
  delete:   (id) => `/api/diet/${id}`,
  articles: "/api/diet/articles",
};

const AI_MESSAGES = [
  "Analyzing your nutritional needs...",
  "Scanning 10,000+ diet protocols...",
  "Calibrating macronutrient ratios...",
  "Optimizing for your goals...",
  "Generating personalized plan...",
];

const ORB_TIPS = [
  "💧 You're 2 glasses behind on hydration today.",
  "🥗 Your protein intake is looking strong this week.",
  "🔥 3-day nutrition streak — keep it going!",
  "⚡ Meal prep Sunday = effortless weekdays.",
  "🧠 Omega-3 rich foods boost cognitive performance.",
  "🌙 Avoid heavy carbs 2hrs before sleep.",
];

const GOAL_COLORS = {
  "weight-loss":   { from: "#ef4444", to: "#f97316", text: "#fca5a5" },
  "muscle-gain":   { from: "#8b5cf6", to: "#06b6d4", text: "#c4b5fd" },
  "maintenance":   { from: "#10b981", to: "#3b82f6", text: "#6ee7b7" },
  "performance":   { from: "#f59e0b", to: "#ef4444", text: "#fcd34d" },
  "default":       { from: "#00f5d4", to: "#7c3aed", text: "#00f5d4" },
};

function goalColor(goal = "default") {
  const key = goal?.toLowerCase().replace(/\s+/g, "-");
  return GOAL_COLORS[key] || GOAL_COLORS.default;
}

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
function Particles({ count = 28 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 6,
      duration: Math.random() * 8 + 6,
      color: ["#00f5d4", "#7c3aed", "#f59e0b", "#0ea5e9"][Math.floor(Math.random() * 4)],
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animation: `dietFloat ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── ENERGY RING ──────────────────────────────────────────────────────────────
function EnergyRing({ size = 120, color = "#00f5d4", delay = 0 }) {
  return (
    <div
      className="absolute rounded-full border opacity-20"
      style={{
        width: size,
        height: size,
        borderColor: color,
        boxShadow: `0 0 30px ${color}44, inset 0 0 30px ${color}22`,
        animation: `dietSpin ${8 + delay}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function HeroSection() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".diet-hero-badge",    { opacity: 0, y: 20, duration: 0.6 }, 0.1)
      .from(".diet-hero-title",    { opacity: 0, y: 40, duration: 0.8 }, 0.25)
      .from(".diet-hero-sub",      { opacity: 0, y: 24, duration: 0.7 }, 0.45)
      .from(".diet-hero-stat",     { opacity: 0, y: 32, scale: 0.9, duration: 0.5, stagger: 0.1 }, 0.55)
      .from(".diet-hero-cta",      { opacity: 0, y: 16, duration: 0.5 }, 0.85);
  }, { scope: heroRef });

  const stats = [
    { label: "Calories Tracked",  value: "2,847", unit: "kcal", icon: "🔥", color: "#f97316" },
    { label: "Protein Goal",      value: "94%",   unit: "met",  icon: "💪", color: "#00f5d4" },
    { label: "Hydration",         value: "6/8",   unit: "cups", icon: "💧", color: "#0ea5e9" },
    { label: "Meal Streak",       value: "7",     unit: "days", icon: "⚡", color: "#f59e0b" },
  ];

  return (
    <section ref={heroRef} className="relative min-h-[55vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-6">
      {/* Gradient mesh bg */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,245,212,0.12) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 80% 60%, rgba(124,58,237,0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 80% at 10% 80%, rgba(14,165,233,0.08) 0%, transparent 50%)" }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,245,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,212,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <Particles count={24} />

      {/* Concentric energy rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <EnergyRing size={520} color="#00f5d4" delay={0} />
        <EnergyRing size={380} color="#7c3aed" delay={2} />
        <EnergyRing size={250} color="#f59e0b" delay={4} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        <div className="diet-hero-badge inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" style={{ background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.25)", backdropFilter: "blur(12px)" }}>
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ boxShadow: "0 0 8px #00f5d4" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(0,245,212,0.8)", letterSpacing: "2px" }}>AI NUTRITION ENGINE · ACTIVE</span>
        </div>

        <h1 className="diet-hero-title mb-5 leading-none" style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(42px, 7vw, 88px)", fontWeight: 900, letterSpacing: "-3px" }}>
          <span style={{ color: "#fff" }}>Forge Your</span>{" "}
          <span style={{ background: "linear-gradient(135deg, #00f5d4, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ultimate</span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.9)" }}>Body</span>
        </h1>

        <p className="diet-hero-sub mb-10 max-w-xl mx-auto" style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, color: "rgba(255,255,255,0.45)", fontWeight: 300, lineHeight: 1.7 }}>
          AI-powered nutrition intelligence that adapts to your physiology, goals, and lifestyle in real time.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
          {stats.map((s, i) => (
            <div key={i} className="diet-hero-stat rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}15 0%, transparent 65%)` }} />
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: s.color, textShadow: `0 0 16px ${s.color}66` }}>{s.value}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", marginTop: 2 }}>{s.unit}</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button className="diet-hero-cta relative group overflow-hidden px-10 py-4 rounded-2xl font-bold text-sm tracking-wide transition-transform active:scale-95"
          style={{ fontFamily: "'Sora', sans-serif", background: "linear-gradient(135deg, #00f5d4, #7c3aed)", color: "#000", boxShadow: "0 8px 32px rgba(0,245,212,0.3), 0 0 0 1px rgba(0,245,212,0.2)", fontSize: 14 }}
          onClick={() => document.getElementById("ai-input-section")?.scrollIntoView({ behavior: "smooth" })}>
          <span className="relative z-10">⚡ Generate My Diet Plan</span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, #7c3aed, #00f5d4)" }} />
        </button>
      </div>
    </section>
  );
}

// ─── AI INPUT SECTION ─────────────────────────────────────────────────────────
function AIInputSection({ onGenerated, onLoadingChange }) {
  const [form, setForm] = useState({ name: "", goal: "", calories: "", restrictions: "" });
  const [loading, setLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const cardRef = useRef(null);
  const intervalRef = useRef(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0, y: 50, scale: 0.97, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: cardRef.current, start: "top 85%", once: true },
    });
  });

  const cycleMessages = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setMsgIdx(i => {
        const next = (i + 1) % AI_MESSAGES.length;
        setAiMsg(AI_MESSAGES[next]);
        return next;
      });
    }, 1800);
  }, []);

  const handleGenerate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    onLoadingChange(true);
    setAiMsg(AI_MESSAGES[0]);
    cycleMessages();
    try {
      const { data } = await axios.post(API.generate, {
        name: form.name,
        goal: form.goal,
        targetCalories: form.calories,
        restrictions: form.restrictions,
      });
      clearInterval(intervalRef.current);
      onGenerated(data.diet || data);
    } catch (err) {
      console.error(err);
      clearInterval(intervalRef.current);
    } finally {
      setLoading(false);
      onLoadingChange(false);
      setAiMsg("");
    }
  };

  const goals = ["Weight Loss", "Muscle Gain", "Maintenance", "Performance"];

  return (
    <section id="ai-input-section" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block mb-3 text-xs tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,212,0.6)" }}>── STEP 01 ──</span>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: "-1.5px" }}>
            Tell the AI Your <span style={{ background: "linear-gradient(135deg, #00f5d4, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nutrition Goals</span>
          </h2>
        </div>

        <div ref={cardRef} className="relative rounded-3xl overflow-hidden p-8"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          {/* Top shimmer */}
          <div className="absolute top-0 left-10 right-10 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,245,212,0.5), transparent)" }} />
          {/* Ambient corner glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,245,212,0.08), transparent 70%)" }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* Diet Name */}
            <div className="sm:col-span-2">
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "2px", display: "block", marginBottom: 8 }}>DIET PLAN NAME</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Lean Bulk Protocol, Keto Reset..."
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontFamily: "'Sora', sans-serif", fontSize: 15, caretColor: "#00f5d4" }}
                onFocus={e => { e.target.style.border = "1px solid rgba(0,245,212,0.5)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,245,212,0.08)"; }}
                onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Goal */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "2px", display: "block", marginBottom: 8 }}>PRIMARY GOAL</label>
              <select
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: form.goal ? "#e2e8f0" : "rgba(255,255,255,0.3)", fontFamily: "'Sora', sans-serif", fontSize: 15, cursor: "pointer" }}>
                <option value="" style={{ background: "#0a0a1a" }}>Select goal...</option>
                {goals.map(g => <option key={g} value={g} style={{ background: "#0a0a1a" }}>{g}</option>)}
              </select>
            </div>

            {/* Calories */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "2px", display: "block", marginBottom: 8 }}>TARGET CALORIES</label>
              <input
                type="number"
                value={form.calories}
                onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                placeholder="e.g. 2200"
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontFamily: "'Sora', sans-serif", fontSize: 15, caretColor: "#00f5d4" }}
                onFocus={e => { e.target.style.border = "1px solid rgba(0,245,212,0.5)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,245,212,0.08)"; }}
                onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Restrictions */}
            <div className="sm:col-span-2">
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "2px", display: "block", marginBottom: 8 }}>DIETARY RESTRICTIONS (OPTIONAL)</label>
              <input
                value={form.restrictions}
                onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
                placeholder="e.g. Vegetarian, No gluten, Lactose intolerant..."
                className="w-full rounded-2xl px-5 py-4 outline-none transition-all duration-300"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontFamily: "'Sora', sans-serif", fontSize: 15, caretColor: "#00f5d4" }}
                onFocus={e => { e.target.style.border = "1px solid rgba(0,245,212,0.5)"; e.target.style.boxShadow = "0 0 0 4px rgba(0,245,212,0.08)"; }}
                onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !form.name.trim()}
            className="w-full py-5 rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 relative overflow-hidden group"
            style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, background: loading ? "rgba(0,245,212,0.08)" : "linear-gradient(135deg, #00f5d4, #7c3aed)", color: loading ? "#00f5d4" : "#000", border: loading ? "1px solid rgba(0,245,212,0.3)" : "none", opacity: !form.name.trim() ? 0.5 : 1, cursor: !form.name.trim() ? "not-allowed" : "pointer", boxShadow: !loading && form.name.trim() ? "0 8px 32px rgba(0,245,212,0.25)" : "none" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="relative w-5 h-5 flex-shrink-0">
                  <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
                </span>
                <span>{aiMsg || AI_MESSAGES[0]}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🧠</span> Generate With AI
              </span>
            )}
            {!loading && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #7c3aed, #00f5d4)" }} />}
            {!loading && <span className="relative z-10 flex items-center justify-center gap-2">🧠 Generate With AI</span>}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── GENERATED DIET PREVIEW ───────────────────────────────────────────────────
function GeneratedDietPreview({ diet, onSave, onRegenerate }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const gc = goalColor(diet?.goal);

  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
    );
    gsap.to(cardRef.current, {
      y: -6, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true
    });
  }, { dependencies: [diet] });

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(API.save, diet);
      setSaved(true);
      onSave?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!diet) return null;

  const macros = diet.macros || [
    { label: "Protein", value: diet.protein || "140g", color: "#00f5d4" },
    { label: "Carbs",   value: diet.carbs   || "220g", color: "#f59e0b" },
    { label: "Fat",     value: diet.fat      || "65g",  color: "#f97316" },
    { label: "Fiber",   value: diet.fiber    || "32g",  color: "#10b981" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block mb-3 text-xs tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,212,0.6)" }}>── AI GENERATED ──</span>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            Your <span style={{ background: `linear-gradient(135deg, ${gc.from}, ${gc.to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Personalized Plan</span>
          </h2>
        </div>

        <div ref={cardRef} className="rounded-3xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid rgba(255,255,255,0.12)`, backdropFilter: "blur(32px)", boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)` }}>
          {/* Top gradient bar */}
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${gc.from}, ${gc.to})` }} />

          <div className="p-8">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${gc.from}22`, color: gc.text, border: `1px solid ${gc.from}44`, letterSpacing: "1px", fontSize: 10 }}>{(diet.goal || "CUSTOM").toUpperCase()}</span>
                  {diet.category && <span className="px-3 py-1 rounded-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{diet.category}</span>}
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{diet.name || diet.title || "Custom Diet Plan"}</h3>
              </div>
              {diet.calories && (
                <div className="text-center flex-shrink-0 px-5 py-3 rounded-2xl" style={{ background: `${gc.from}11`, border: `1px solid ${gc.from}33` }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 800, color: gc.from, textShadow: `0 0 20px ${gc.from}66` }}>{diet.calories}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px" }}>KCAL/DAY</div>
                </div>
              )}
            </div>

            {/* Description */}
            {diet.description && (
              <p className="mb-8 leading-relaxed" style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>{diet.description}</p>
            )}

            {/* Macros */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {macros.map((m, i) => (
                <div key={i} className="rounded-2xl p-4 text-center relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${m.color}22` }}>
                  <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}15, transparent 70%)` }} />
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: m.color, textShadow: `0 0 12px ${m.color}66` }}>{m.value}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "1.5px", marginTop: 4 }}>{m.label.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* Meals */}
            {diet.meals?.length > 0 && (
              <div className="mb-8">
                <h4 className="mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.6)", letterSpacing: "2px" }}>MEAL BREAKDOWN</h4>
                <div className="space-y-3">
                  {diet.meals.map((meal, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{meal.icon || ["🌅", "☕", "🥗", "🍎", "🍽️", "🌙"][i] || "🥘"}</div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{meal.name || meal.meal}</div>
                        {meal.items && <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{Array.isArray(meal.items) ? meal.items.join(" · ") : meal.items}</div>}
                      </div>
                      {meal.calories && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: gc.from, flexShrink: 0 }}>{meal.calories} kcal</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleSave} disabled={saving || saved}
                className="flex-1 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95"
                style={{ fontFamily: "'Sora', sans-serif", background: saved ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #00f5d4, #0ea5e9)", color: saved ? "#10b981" : "#000", border: saved ? "1px solid rgba(16,185,129,0.4)" : "none", boxShadow: !saved ? "0 8px 24px rgba(0,245,212,0.25)" : "none", opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : saved ? "✅ Saved to Routine!" : "💾 Save Diet Plan"}
              </button>
              <button onClick={onRegenerate}
                className="flex-1 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95"
                style={{ fontFamily: "'Sora', sans-serif", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", cursor: "pointer" }}>
                🔄 Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SAVED DIET CARD ──────────────────────────────────────────────────────────
function DietCard({ diet, onDelete }) {
  const cardRef = useRef(null);
  const gc = goalColor(diet.goal);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    gsap.to(cardRef.current, {
      opacity: 0, scale: 0.85, y: -20, duration: 0.4, ease: "power2.in",
      onComplete: () => onDelete(diet._id),
    });
    try { await axios.delete(API.delete(diet._id)); } catch (e) { console.error(e); }
  };

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    gsap.to(cardRef.current, { rotateX: y, rotateY: x, duration: 0.3, ease: "power1.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
  };

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl overflow-hidden cursor-pointer group"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", transformStyle: "preserve-3d", transition: "box-shadow 0.3s", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${gc.from}33`; }}>

      {/* Top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${gc.from}, ${gc.to})` }} />

      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${gc.from}0d 0%, transparent 60%)` }} />

      {/* Image / placeholder */}
      <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${gc.from}22, ${gc.to}22)` }}>
        {diet.image ? (
          <img src={diet.image} alt={diet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 52 }}>
            {diet.goal?.toLowerCase().includes("weight") ? "🥗" : diet.goal?.toLowerCase().includes("muscle") ? "🥩" : "🍽️"}
          </div>
        )}
        {/* Delete btn */}
        <button onClick={handleDelete} disabled={deleting}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", backdropFilter: "blur(8px)", cursor: "pointer" }}>
          {deleting ? <span className="animate-spin text-xs">↻</span> : "✕"}
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", background: `${gc.from}18`, color: gc.text, border: `1px solid ${gc.from}33`, fontSize: 9, letterSpacing: "1px" }}>{(diet.goal || "DIET").toUpperCase()}</span>
        </div>
        <h3 className="mb-1 font-bold" style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, color: "#e2e8f0", letterSpacing: "-0.3px" }}>{diet.name || diet.title}</h3>
        {diet.calories && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: gc.from }}>{diet.calories} kcal/day</p>
        )}
        {diet.description && (
          <p className="mt-2 line-clamp-2" style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{diet.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── SAVED DIETS SECTION ──────────────────────────────────────────────────────
function SavedDietsSection({ diets, setDiets }) {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.from(".diet-saved-card", {
      opacity: 0, y: 40, scale: 0.95, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: sectionRef.current, start: "top 80%", once: true },
    });
  }, { scope: sectionRef, dependencies: [diets] });

  const handleDelete = (id) => {
    setTimeout(() => setDiets(prev => prev.filter(d => d._id !== id)), 450);
  };

  if (!diets.length) return null;

  return (
    <section ref={sectionRef} className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="block mb-2 text-xs tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,212,0.6)" }}>── SAVED PLANS ──</span>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
              Your Diet <span style={{ background: "linear-gradient(135deg, #7c3aed, #00f5d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Routines</span>
            </h2>
          </div>
          <div className="px-4 py-2 rounded-full" style={{ background: "rgba(0,245,212,0.06)", border: "1px solid rgba(0,245,212,0.15)" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#00f5d4", fontWeight: 700 }}>{diets.length}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 6, letterSpacing: "1px" }}>PLANS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {diets.map((diet) => (
            <div key={diet._id} className="diet-saved-card">
              <DietCard diet={diet} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ARTICLE CARD ─────────────────────────────────────────────────────────────
function ArticleCard({ article, index }) {
  const cardRef = useRef(null);

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0, y: 40, duration: 0.6, ease: "power3.out", delay: index * 0.1,
      scrollTrigger: { trigger: cardRef.current, start: "top 88%", once: true },
    });
  });

  return (
    <a ref={cardRef} href={article.url} target="_blank" rel="noopener noreferrer"
      className="group block rounded-3xl overflow-hidden transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)", textDecoration: "none" }}
      onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(0,245,212,0.25)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}>

      <div className="relative h-44 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        {article.image ? (
          <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.1), rgba(124,58,237,0.1))" }}>📰</div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,14,0.8) 0%, transparent 50%)" }} />
        {article.source && (
          <span className="absolute bottom-3 left-4 text-xs px-2 py-1 rounded-lg" style={{ fontFamily: "'JetBrains Mono', monospace", background: "rgba(0,0,14,0.7)", color: "rgba(0,245,212,0.7)", border: "1px solid rgba(0,245,212,0.2)", fontSize: 9, letterSpacing: "1px" }}>{article.source}</span>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-2 font-bold leading-snug group-hover:text-teal-400 transition-colors duration-200" style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: "#e2e8f0", letterSpacing: "-0.2px", lineHeight: 1.5 }}>{article.title}</h3>
        {article.description && (
          <p className="line-clamp-2" style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{article.description}</p>
        )}
        <div className="mt-3 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,245,212,0.5)", letterSpacing: "1px" }}>
          READ ARTICLE <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
        </div>
      </div>
    </a>
  );
}

// ─── ARTICLES SECTION ─────────────────────────────────────────────────────────
function ArticlesSection({ articles }) {
  if (!articles.length) return null;
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="block mb-3 text-xs tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(0,245,212,0.6)" }}>── KNOWLEDGE BASE ──</span>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            Diet <span style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
          </h2>
          <p className="mt-2" style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Science-backed nutrition insights curated by AI</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, i) => <ArticleCard key={i} article={a} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── FLOATING AI ORBS ─────────────────────────────────────────────────────────
function FloatingAIAssistant() {
  const [open, setOpen] = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const orbRef = useRef(null);
  const panelRef = useRef(null);

  useGSAP(() => {
    gsap.to(orbRef.current, {
      y: -12, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true,
    });
  });

  const showTip = useCallback((idx) => {
    const text = ORBS_TIPS?.[idx] ?? ORBS_TIPS[0];
    setDisplayText("");
    setTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, ++i));
      if (i >= text.length) { clearInterval(interval); setTyping(false); }
    }, 28);
    return () => clearInterval(interval);
  }, []);

  const ORBS_TIPS = ORB_TIPS;

  const handleOpen = () => {
    setOpen(o => {
      if (!o) showTip(tipIdx);
      return !o;
    });
  };

  const nextTip = () => {
    const next = (tipIdx + 1) % ORBS_TIPS.length;
    setTipIdx(next);
    showTip(next);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Panel */}
      {open && (
        <div ref={panelRef} className="rounded-3xl p-5 w-72 relative overflow-hidden"
          style={{ background: "rgba(0,0,14,0.95)", border: "1px solid rgba(0,245,212,0.25)", backdropFilter: "blur(32px)", boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,245,212,0.1)", animation: "dietSlideUp 0.35s cubic-bezier(0.22,1,0.36,1)" }}>
          <div className="absolute top-0 left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,245,212,0.5), transparent)" }} />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: "#00f5d4", boxShadow: "0 0 8px #00f5d4", animation: "fhp-blink 1.2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(0,245,212,0.6)", letterSpacing: "2px" }}>AI NUTRITION ASSISTANT</span>
          </div>
          <div className="rounded-2xl p-4 mb-4 min-h-20 relative" style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.1)" }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
              {displayText}
              {typing && <span className="animate-pulse">▋</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={nextTip}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ fontFamily: "'Sora', sans-serif", background: "rgba(0,245,212,0.08)", border: "1px solid rgba(0,245,212,0.2)", color: "#00f5d4", cursor: "pointer" }}>
              Next Tip →
            </button>
            <button onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12 }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Orb */}
      <button ref={orbRef} onClick={handleOpen}
        className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90"
        style={{ background: "linear-gradient(135deg, #00f5d4, #7c3aed)", boxShadow: "0 0 0 4px rgba(0,245,212,0.15), 0 0 0 12px rgba(0,245,212,0.06), 0 16px 40px rgba(0,245,212,0.3)", border: "none" }}>
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "#00f5d4" }} />
        <span className="text-2xl relative z-10">🧠</span>
      </button>
    </div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 max-w-6xl mx-auto">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,245,212,0.3)", boxShadow: "0 0 8px rgba(0,245,212,0.3)" }} />
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
    </div>
  );
}

// ─── MOCK ARTICLES (fallback) ─────────────────────────────────────────────────
const MOCK_ARTICLES = [
  { title: "The Science of Intermittent Fasting: What Your Body Does Hour by Hour", description: "Discover the metabolic changes that occur during extended fasting windows and how to optimize them.", source: "Healthline", image: null, url: "#" },
  { title: "Protein Timing: Does It Really Matter for Muscle Growth?", description: "New research reveals the nuanced truth about anabolic windows and protein distribution throughout the day.", source: "PubMed", image: null, url: "#" },
  { title: "Mediterranean Diet Ranked #1 for Heart Health Again in 2025", description: "For the seventh year running, experts rate this eating pattern as the most balanced and sustainable.", source: "WHO Report", image: null, url: "#" },
  { title: "The Gut-Brain Axis: How Your Diet Shapes Mental Performance", description: "Emerging science shows how specific foods directly influence neurotransmitter production and cognitive clarity.", source: "Nature", image: null, url: "#" },
  { title: "Creatine for Athletes: The Definitive 2025 Research Summary", description: "Meta-analysis of 240+ studies confirms performance benefits across resistance training and endurance sports.", source: "ISSN", image: null, url: "#" },
  { title: "Anti-Inflammatory Eating: The 30 Foods That Change Everything", description: "Chronically high inflammation is the root cause of most lifestyle diseases. These foods directly combat it.", source: "Harvard Health", image: null, url: "#" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ROOT DIET PAGE
// ═════════════════════════════════════════════════════════════════════════════
export function Diet() {
  const [generatedDiet, setGeneratedDiet] = useState(null);
  const [diets, setDiets] = useState([]);
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [aiLoading, setAiLoading] = useState(false);
  const pageRef = useRef(null);

  // Fetch saved diets
  useEffect(() => {
    axios.get(API.list)
      .then(r => setDiets(r.data?.diets || r.data || []))
      .catch(() => {});
  }, []);

  // Fetch articles
  useEffect(() => {
    axios.get(API.articles)
      .then(r => setArticles(r.data?.articles || r.data || MOCK_ARTICLES))
      .catch(() => setArticles(MOCK_ARTICLES));
  }, []);

  const handleGenerated = (diet) => {
    setGeneratedDiet(diet);
    setTimeout(() => {
      document.getElementById("diet-preview")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSaved = () => {
    axios.get(API.list)
      .then(r => setDiets(r.data?.diets || r.data || []))
      .catch(() => {});
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        * { box-sizing: border-box; }

        .diet-page {
          min-height: 100vh;
          background: #00000e;
          color: #fff;
          font-family: 'Sora', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        @keyframes dietFloat {
          from { transform: translateY(0) translateX(0); opacity: 0.3; }
          to   { transform: translateY(-20px) translateX(8px); opacity: 0.6; }
        }
        @keyframes dietSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dietSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fhp-blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,212,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-track { background: transparent; }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        select option { background: #0a0a1a; color: #e2e8f0; }
      `}</style>

      <div ref={pageRef} className="diet-page">
        {/* 1. HERO */}
        <HeroSection />

        <SectionDivider />

        {/* 2. AI INPUT */}
        <AIInputSection onGenerated={handleGenerated} onLoadingChange={setAiLoading} />

        {/* 3. GENERATED PREVIEW */}
        {generatedDiet && (
          <div id="diet-preview">
            <SectionDivider />
            <GeneratedDietPreview
              diet={generatedDiet}
              onSave={handleSaved}
              onRegenerate={() => setGeneratedDiet(null)}
            />
          </div>
        )}

        {/* 4. SAVED DIETS */}
        {diets.length > 0 && (
          <>
            <SectionDivider />
            <SavedDietsSection diets={diets} setDiets={setDiets} />
          </>
        )}

        {/* 5. ARTICLES */}
        <SectionDivider />
        <ArticlesSection articles={articles} />

        {/* Bottom padding */}
        <div className="h-32" />

        {/* 6. FLOATING AI ASSISTANT */}
        <FloatingAIAssistant />
      </div>
    </>
  );
}