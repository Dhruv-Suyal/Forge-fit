import { useRef, useEffect } from "react";
import { gsap } from "gsap";

const PARTICLES = [
  { x: 8,  y: 20, size: 5,  delay: 0,   dur: 7  },
  { x: 18, y: 70, size: 3.5,delay: 1.5, dur: 9  },
  { x: 30, y: 40, size: 4.5,delay: 0.8, dur: 8  },
  { x: 45, y: 15, size: 6,  delay: 2,   dur: 10 },
  { x: 60, y: 60, size: 4,  delay: 0.3, dur: 7  },
  { x: 72, y: 30, size: 3.5,delay: 1.2, dur: 9  },
  { x: 85, y: 75, size: 5.5,delay: 0.6, dur: 8  },
  { x: 92, y: 45, size: 4,  delay: 1.8, dur: 11 },
  { x: 25, y: 85, size: 3,  delay: 2.5, dur: 7  },
  { x: 55, y: 90, size: 5,  delay: 0.9, dur: 9  },
];

const COLORS = ["rgba(0,245,212,0.7)", "rgba(124,58,237,0.7)", "rgba(245,158,11,0.5)", "rgba(14,165,233,0.6)"];

export function DietHero({ todayPlan }) {
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const statsRef   = useRef(null);
  const glowRef    = useRef(null);
  const heroRef    = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
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

    gsap.to(statsRef.current?.children ?? [], {
      y: -8, duration: 3.2, ease: "sine.inOut",
      yoyo: true, repeat: -1, stagger: 0.4, delay: 1.5,
    });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
      gsap.to(glowRef.current, { x, y, duration: 1.2, ease: "power2.out" });
    };
    hero.addEventListener("mousemove", onMouseMove);
    return () => hero.removeEventListener("mousemove", onMouseMove);
  }, []);

  const totalCal   = todayPlan?.totalCalories ?? "—";
  const mealCount  = todayPlan?.meals?.length  ?? "—";
  const planTitle  = todayPlan?.title
    ? (todayPlan.title.length > 11 ? todayPlan.title.slice(0, 10) + "…" : todayPlan.title)
    : "None";

  const STATS = [
    { label: "Plan Calories",  value: totalCal,  unit: "kcal/day", icon: "🔥", color: "#f97316" },
    { label: "Meals Per Day",  value: mealCount,  unit: "meals",   icon: "🥗", color: "#00f5d4" },
    { label: "Active Plan",    value: planTitle,  unit: "",        icon: "⚡", color: "#7c3aed" },
  ];

  return (
    <section
      ref={heroRef}
      style={{
        position: "relative",
        minHeight: "82vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,245,212,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(124,58,237,0.08) 0%, transparent 60%), #00000e",
        paddingTop: 80,
      }}
    >
      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS[i % COLORS.length]}, transparent)`,
          animation: `diet-particle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Mouse glow */}
      <div ref={glowRef} style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,245,212,0.055) 0%, transparent 70%)",
        left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      {/* Rotating rings */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        {[
          { size: 320, grad: "linear-gradient(135deg,#00f5d4,transparent,#7c3aed)", anim: "diet-spin 14s linear infinite", border: "2px" },
          { size: 500, grad: "linear-gradient(225deg,#7c3aed,transparent,#f59e0b)", anim: "diet-spin-rev 20s linear infinite", border: "1px" },
        ].map((r, i) => (
          <div key={i} style={{
            position: i === 0 ? "relative" : "absolute",
            width: r.size, height: r.size, borderRadius: "50%",
            border: `${r.border} solid transparent`,
            background: `linear-gradient(#00000e,#00000e) padding-box, ${r.grad} border-box`,
            animation: r.anim,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 2, padding: "0 24px", maxWidth: 860 }}>
        {/* Live badge */}
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 10px #00f5d4", animation: "diet-dot 1.8s ease-out infinite" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(0,245,212,0.7)", fontWeight: 600 }}>
            AI NUTRITION ENGINE · ACTIVE
          </span>
        </div>

        {/* Heading */}
        <h1 ref={headingRef} style={{
          margin: 0, opacity: 0,
          fontSize: "clamp(42px,8vw,92px)",
          fontWeight: 900, fontFamily: "var(--font-main)",
          lineHeight: 1.05, letterSpacing: "-3px", color: "#fff",
        }}>
          Forge Your{" "}
          <span className="diet-gradient-text">Perfect</span>
          <br />Diet
        </h1>

        {/* Sub */}
        <p ref={subRef} style={{
          margin: "24px 0 0", opacity: 0,
          fontSize: "clamp(15px,2vw,19px)",
          fontFamily: "var(--font-main)", fontWeight: 400,
          color: "rgba(255,255,255,0.42)", lineHeight: 1.65,
        }}>
          AI-generated daily meal plans tailored to your goals —<br />
          breakfast, lunch, snack and dinner, perfectly balanced.
        </p>

        {/* Stat cards */}
        <div ref={statsRef} style={{ marginTop: 52, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.label} className="diet-glass diet-glass-teal"
              style={{ padding: "20px 28px", minWidth: 160, textAlign: "center", cursor: "default", opacity: 0 }}
              onMouseEnter={e => gsap.to(e.currentTarget, { y: -6, scale: 1.04, duration: 0.3, ease: "power2.out" })}
              onMouseLeave={e => gsap.to(e.currentTarget, { y: 0,  scale: 1,    duration: 0.5, ease: "elastic.out(1,0.5)" })}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: s.color, textShadow: `0 0 20px ${s.color}`, lineHeight: 1 }}>{s.value}</div>
              {s.unit && <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>{s.unit}</div>}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 5, fontFamily: "var(--font-main)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.38 }}>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #00f5d4, transparent)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}
