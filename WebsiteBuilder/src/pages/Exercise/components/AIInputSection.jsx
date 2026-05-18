import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { FiZap, FiClock, FiSun, FiBarChart2 } from "react-icons/fi";

const TIME_OPTIONS   = ["Morning", "Afternoon", "Evening", "Any Time"];
const DIFF_OPTIONS   = ["Beginner", "Intermediate", "Advanced", "Expert"];

const TYPING_MSGS = [
  "AI is analysing your fitness profile...",
  "Generating personalised workout plan...",
  "Optimising sets and reps for your goal...",
  "Almost ready — crafting the perfect routine...",
];

export function AIInputSection({ onGenerate, aiLoading }) {
  const sectionRef  = useRef(null);
  const cardRef     = useRef(null);
  const btnRef      = useRef(null);
  const loaderRef   = useRef(null);
  const typingRef   = useRef(null);
  const typingTimer = useRef(null);

  const [form, setForm] = useState({
    title: "",
    duration: "",
    preferredTime: "Morning",
    difficulty: "Beginner",
  });
  const [typingMsg, setTypingMsg] = useState(TYPING_MSGS[0]);

  // ── Scroll entrance ──────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  // ── Typing animation while loading ───────────────────────────────────────
  useEffect(() => {
    if (aiLoading) {
      let idx = 0;
      typingTimer.current = setInterval(() => {
        idx = (idx + 1) % TYPING_MSGS.length;
        setTypingMsg(TYPING_MSGS[idx]);
      }, 1800);
    } else {
      clearInterval(typingTimer.current);
      setTypingMsg(TYPING_MSGS[0]);
    }
    return () => clearInterval(typingTimer.current);
  }, [aiLoading]);

  // ── Loading overlay animation ─────────────────────────────────────────────
  useEffect(() => {
    if (!loaderRef.current) return;
    if (aiLoading) {
      gsap.fromTo(loaderRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(loaderRef.current, { opacity: 0, scale: 0.8, duration: 0.3 });
    }
  }, [aiLoading]);

  // ── Button hover via GSAP ────────────────────────────────────────────────
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const enter = () => gsap.to(btn, { scale: 1.04, duration: 0.2, ease: "power2.out" });
    const leave = () => gsap.to(btn, { scale: 1,    duration: 0.3, ease: "elastic.out(1,0.5)" });
    btn.addEventListener("mouseenter", enter);
    btn.addEventListener("mouseleave", leave);
    return () => { btn.removeEventListener("mouseenter", enter); btn.removeEventListener("mouseleave", leave); };
  }, []);

  // ── Animated border glow on focus/blur ───────────────────────────────────
  const handleFocus = (e) => gsap.to(e.currentTarget, { "--border-glow": 1, duration: 0.3 });
  const handleBlur  = (e) => gsap.to(e.currentTarget, { duration: 0.3 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    // GSAP button press animation
    gsap.timeline()
      .to(btnRef.current, { scale: 0.94, duration: 0.1 })
      .to(btnRef.current, { scale: 1.02, duration: 0.2, ease: "back.out(1.4)" })
      .to(btnRef.current, { scale: 1, duration: 0.15 });
    onGenerate(form);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px 14px 44px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    color: "#fff",
    fontFamily: "var(--font-main)",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    transition: "border-color 0.25s, box-shadow 0.25s",
    boxSizing: "border-box",
  };

  const iconWrap = {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(0,245,212,0.5)",
    fontSize: 16,
    display: "flex",
    pointerEvents: "none",
  };

  return (
    <section ref={sectionRef} style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
      {/* Section label */}
      <div className="ex-section-label" style={{ textAlign: "center", marginBottom: 12 }}>AI ENGINE</div>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-main)",
        fontWeight: 800,
        fontSize: "clamp(28px,5vw,48px)",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: "-1px",
      }}>
        Build Your <span className="ex-gradient-text">Perfect Workout</span>
      </h2>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-main)", fontSize: 15, marginBottom: 48 }}>
        Describe your exercise and let AI design the optimal routine for you.
      </p>

      {/* Input card */}
      <div
        ref={cardRef}
        className="ex-glass ex-glass-teal"
        style={{ padding: "40px", opacity: 0, position: "relative" }}
      >
        {/* Animated AI Loading overlay */}
        <div
          ref={loaderRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            background: "rgba(0,0,14,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            zIndex: 10,
            opacity: 0,
            pointerEvents: aiLoading ? "auto" : "none",
          }}
        >
          <div className="ex-spinner" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="ex-typing-text" style={{ fontSize: 14 }}>{typingMsg}</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#00f5d4",
                  animation: `ex-particle-drift 1.2s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.6,
                }} />
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
            gap: 20,
            marginBottom: 28,
          }}>
            {/* Exercise Name */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 0.5 }}>
                Exercise Name *
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><FiZap /></span>
                <input
                  type="text"
                  placeholder="e.g. Push-ups, Deadlift, HIIT Cardio..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="ex-input-glow"
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 0.5 }}>
                Duration (minutes)
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><FiClock /></span>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  min="5"
                  max="180"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="ex-input-glow"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Preferred Time */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 0.5 }}>
                Preferred Time
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><FiSun /></span>
                <select
                  value={form.preferredTime}
                  onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="ex-input-glow"
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t} style={{ background: "#00000e" }}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 0.5 }}>
                Difficulty Level
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><FiBarChart2 /></span>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="ex-input-glow"
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                >
                  {DIFF_OPTIONS.map(d => <option key={d} value={d} style={{ background: "#00000e" }}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            ref={btnRef}
            type="submit"
            className="ex-btn-primary"
            disabled={aiLoading}
            style={{
              width: "100%",
              padding: "18px 32px",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: aiLoading ? 0.7 : 1,
              cursor: aiLoading ? "not-allowed" : "pointer",
            }}
          >
            <FiZap style={{ fontSize: 18 }} />
            Generate With AI
          </button>
        </form>
      </div>
    </section>
  );
}
