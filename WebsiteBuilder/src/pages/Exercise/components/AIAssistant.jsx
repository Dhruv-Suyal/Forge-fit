import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { FiX, FiZap } from "react-icons/fi";

const AI_TIPS = [
  {
    icon: "🏋️",
    title: "Ready for today's workout?",
    body: "Your AI-scheduled routine has 3 sessions lined up. Best start time: 8:00 AM.",
  },
  {
    icon: "💪",
    title: "Chest recovery is optimal.",
    body: "48 hours since your last push workout. Your muscles are primed and ready to push harder today.",
  },
  {
    icon: "💧",
    title: "Hydration reminder",
    body: "You missed your hydration goal yesterday. Aim for 2.5L today — dehydration reduces performance by up to 15%.",
  },
  {
    icon: "🔥",
    title: "Streak incoming!",
    body: "One more session today keeps your 21-day streak alive. You're crushing it — don't stop now.",
  },
  {
    icon: "🌙",
    title: "Recovery window open.",
    body: "Tonight is ideal for deep recovery. Sleep before midnight and your HRV will peak for tomorrow's lift.",
  },
];

export function AIAssistant() {
  const [open, setOpen]   = useState(false);
  const [tipIdx, setTipIdx] = useState(0);
  const panelRef = useRef(null);
  const orbRef   = useRef(null);

  const tip = AI_TIPS[tipIdx];

  // Cycle to new tip each time panel opens
  const toggle = () => {
    if (!open) {
      setTipIdx(i => (i + 1) % AI_TIPS.length);
    }
    setOpen(o => !o);
  };

  // Panel spring open/close
  useEffect(() => {
    if (!panelRef.current) return;
    if (open) {
      panelRef.current.style.display = "flex";
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(panelRef.current, {
        opacity: 0, y: 20, scale: 0.92, duration: 0.25, ease: "power2.in",
        onComplete: () => { if (panelRef.current) panelRef.current.style.display = "none"; },
      });
    }
  }, [open]);

  return (
    <>
      {/* AI Panel */}
      <div
        ref={panelRef}
        className="ex-glass"
        style={{
          display: "none",
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 300,
          zIndex: 1000,
          border: "1px solid rgba(0,245,212,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,245,212,0.06)",
          flexDirection: "column",
          overflow: "visible",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00f5d4, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              boxShadow: "0 0 12px rgba(0,245,212,0.4)",
            }}>
              <FiZap style={{ color: "#000" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 12, color: "#fff" }}>ForgeAI Assistant</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(0,245,212,0.6)", letterSpacing: 1, textTransform: "uppercase" }}>AI · Active</div>
            </div>
          </div>
          <button
            onClick={toggle}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              padding: 4,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
          >
            <FiX />
          </button>
        </div>

        {/* Tip message */}
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center", animation: "ex-float-slow 3s ease-in-out infinite" }}>
            {tip.icon}
          </div>
          <h4 style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-main)",
            fontWeight: 700,
            fontSize: 14,
            color: "#fff",
            lineHeight: 1.4,
          }}>
            {tip.title}
          </h4>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-main)",
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
          }}>
            {tip.body}
          </p>
        </div>

        {/* Tip indicator dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 16 }}>
          {AI_TIPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setTipIdx(i)}
              style={{
                width: i === tipIdx ? 16 : 5,
                height: 5,
                borderRadius: 99,
                background: i === tipIdx ? "#00f5d4" : "rgba(255,255,255,0.12)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Arrow pointing to orb */}
        <div style={{
          position: "absolute",
          bottom: -8,
          right: 24,
          width: 16,
          height: 8,
          background: "rgba(0,245,212,0.15)",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }} />
      </div>

      {/* Floating AI Orb */}
      <div
        ref={orbRef}
        className="ex-orb"
        onClick={toggle}
        title="AI Assistant"
        style={{
          background: open
            ? "linear-gradient(135deg, #7c3aed, #00f5d4)"
            : "linear-gradient(135deg, #00f5d4, #7c3aed)",
        }}
      >
        <FiZap style={{ color: "#000", fontSize: 22, filter: "drop-shadow(0 0 4px rgba(0,0,0,0.5))" }} />

        {/* Notification badge */}
        {!open && (
          <div style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#f87171",
            border: "2px solid #00000e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            fontWeight: 700,
            color: "#fff",
          }}>
            {AI_TIPS.length}
          </div>
        )}
      </div>
    </>
  );
}
