import { useRef, useEffect } from "react";
import { gsap } from "gsap";

// ── Stat cards data ──────────────────────────────────────────────────────────
const STATS = [
  { label: "Workouts Done",   value: "142",  unit: "sessions", icon: "🏋️", color: "#00f5d4" },
  { label: "Calories Burned", value: "48.2k",unit: "kcal",     icon: "🔥", color: "#f59e0b" },
  { label: "Active Streak",   value: "21",   unit: "days",     icon: "⚡", color: "#7c3aed" },
];

// ── Floating particle component ───────────────────────────────────────────────
function Particle({ x, y, size, delay, duration }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: Math.random() > 0.5
          ? "radial-gradient(circle, rgba(0,245,212,0.7), transparent)"
          : "radial-gradient(circle, rgba(124,58,237,0.7), transparent)",
        animation: `ex-particle-drift ${duration}s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
      }}
    />
  );
}

export function HeroSection() {
  const heroRef   = useRef(null);
  const headingRef = useRef(null);
  const subRef    = useRef(null);
  const statsRef  = useRef(null);
  const ring1Ref  = useRef(null);
  const ring2Ref  = useRef(null);
  const ring3Ref  = useRef(null);
  const glowRef   = useRef(null);

  // ── Mouse parallax glow ─────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouse = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 60;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 40;
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x, y, duration: 1.2, ease: "power2.out",
        });
      }
    };
    hero.addEventListener("mousemove", handleMouse);
    return () => hero.removeEventListener("mousemove", handleMouse);
  }, []);

  // ── GSAP entrance animations ─────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(headingRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(subRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(statsRef.current?.children ?? [],
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.4)" },
      "-=0.3"
    );

    // Energy rings entrance
    gsap.fromTo([ring1Ref.current, ring2Ref.current, ring3Ref.current],
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: "power2.out", delay: 0.4 }
    );

    // Floating loop on stats
    gsap.to(statsRef.current?.children ?? [], {
      y: -8,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.4,
      delay: 1.5,
    });
  }, []);

  // ── Stable particle seed ──────────────────────────────────────────────────
  const particles = [
    { x:8,  y:20, size:"6px",  delay:0,   duration:7  },
    { x:18, y:70, size:"4px",  delay:1.5, duration:9  },
    { x:30, y:40, size:"5px",  delay:0.8, duration:8  },
    { x:45, y:15, size:"8px",  delay:2,   duration:10 },
    { x:60, y:60, size:"5px",  delay:0.3, duration:7  },
    { x:72, y:30, size:"4px",  delay:1.2, duration:9  },
    { x:85, y:75, size:"7px",  delay:0.6, duration:8  },
    { x:92, y:45, size:"5px",  delay:1.8, duration:11 },
    { x:25, y:85, size:"4px",  delay:2.5, duration:7  },
    { x:55, y:90, size:"6px",  delay:0.9, duration:9  },
    { x:78, y:12, size:"5px",  delay:1.4, duration:8  },
    { x:40, y:55, size:"3px",  delay:0.2, duration:10 },
  ];

  return (
    <section
      ref={heroRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,245,212,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 60%), #00000e",
        paddingTop: 64,
      }}
    >
      {/* Background particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Mouse-follow glow orb */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,212,0.06) 0%, transparent 70%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          transition: "none",
        }}
      />

      {/* Energy rings */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div ref={ring1Ref} className="ex-ring ex-ring-1" style={{ width: 320, height: 320, opacity: 0 }} />
        <div ref={ring2Ref} className="ex-ring ex-ring-2" style={{ position: "absolute", width: 480, height: 480, opacity: 0 }} />
        <div ref={ring3Ref} className="ex-ring ex-ring-3" style={{ position: "absolute", width: 640, height: 640, opacity: 0 }} />

        {/* Rotating gradient arc */}
        <div style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "2px solid transparent",
          background: "linear-gradient(#00000e,#00000e) padding-box, linear-gradient(135deg, #00f5d4, transparent, #7c3aed) border-box",
          animation: "ex-rotate-slow 12s linear infinite",
        }} />
        <div style={{
          position: "absolute",
          width: 480,
          height: 480,
          borderRadius: "50%",
          border: "1px solid transparent",
          background: "linear-gradient(#00000e,#00000e) padding-box, linear-gradient(225deg, #7c3aed, transparent, #00f5d4) border-box",
          animation: "ex-rotate-reverse 18s linear infinite",
        }} />
      </div>

      {/* Hero content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 24px", maxWidth: 860 }}>
        {/* Label */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 10px #00f5d4", animation: "ex-dot-live 1.8s ease-out infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(0,245,212,0.7)", fontWeight: 600 }}>
            AI-POWERED FITNESS SYSTEM
          </span>
        </div>

        {/* Main heading */}
        <h1
          ref={headingRef}
          style={{
            margin: 0,
            fontSize: "clamp(42px, 8vw, 96px)",
            fontWeight: 900,
            fontFamily: "var(--font-main)",
            lineHeight: 1.05,
            letterSpacing: "-3px",
            color: "#fff",
            opacity: 0,
          }}
        >
          Forge Your{" "}
          <span className="ex-gradient-text">Ultimate</span>
          <br />
          Body
        </h1>

        {/* Subheading */}
        <p
          ref={subRef}
          style={{
            margin: "24px 0 0",
            fontSize: "clamp(15px, 2vw, 20px)",
            fontFamily: "var(--font-main)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.6,
            opacity: 0,
          }}
        >
          AI-powered adaptive workout system — generates, personalises, and evolves<br className="hidden sm:block" />
          your exercise plan based on your goals and performance.
        </p>

        {/* Stats cards */}
        <div
          ref={statsRef}
          style={{
            marginTop: 56,
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {STATS.map(stat => (
            <div
              key={stat.label}
              className="ex-glass ex-glass-teal"
              style={{
                padding: "20px 28px",
                minWidth: 160,
                textAlign: "center",
                cursor: "default",
                opacity: 0,
                transition: "border-color 0.3s",
              }}
              onMouseEnter={e => {
                gsap.to(e.currentTarget, { y: -6, scale: 1.04, duration: 0.3, ease: "power2.out" });
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)" });
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 28,
                fontWeight: 700,
                color: stat.color,
                textShadow: `0 0 20px ${stat.color}`,
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                {stat.unit}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: "var(--font-main)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #00f5d4, transparent)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}
