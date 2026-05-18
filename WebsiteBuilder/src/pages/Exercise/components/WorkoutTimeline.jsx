import { useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fixed, sensible daily workout time slots
const TIME_SLOTS = [
  { time: "7:00 AM",  label: "Morning Warmup",     icon: "🌅", color: "#fbbf24" },
  { time: "9:00 AM",  label: "Strength Training",   icon: "💪", color: "#00f5d4" },
  { time: "12:00 PM", label: "Midday Power Session", icon: "⚡", color: "#7c3aed" },
  { time: "4:00 PM",  label: "Afternoon Cardio",    icon: "🔥", color: "#f87171" },
  { time: "6:30 PM",  label: "Evening Workout",     icon: "🌙", color: "#60a5fa" },
  { time: "9:00 PM",  label: "Night Stretching",    icon: "🌟", color: "#4ade80" },
];

// Parse "7:00 AM" → Date object for today
function parseTime(timeStr) {
  const now  = new Date();
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return now;
  let hour   = parseInt(match[1], 10);
  const min  = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const d = new Date(now);
  d.setHours(hour, min, 0, 0);
  return d;
}

function buildTimeline(exercises) {
  const now = new Date();

  return TIME_SLOTS.map((slot, i) => {
    const slotDate  = parseTime(slot.time);
    const isPast    = now > slotDate;
    const isCurrent = Math.abs(now - slotDate) < 60 * 60 * 1000 && !isPast;

    // Assign exercises cyclically; fall back to slot label
    const ex = exercises.length > 0 ? exercises[i % exercises.length] : null;

    return {
      ...slot,
      exercise: ex?.title || slot.label,
      duration: ex?.duration || (20 + i * 5),
      sets:     ex?.sets,
      reps:     ex?.reps,
      isPast,
      isCurrent,
      progress: isPast ? 100 : isCurrent ? 55 : 0,
    };
  });
}

// ── Timeline Item ─────────────────────────────────────────────────────────────
function TimelineItem({ item }) {
  return (
    <div
      style={{ display: "flex", gap: 0, position: "relative" }}
      data-timeline-item
    >
      {/* Time label */}
      <div style={{
        width: 80,
        flexShrink: 0,
        textAlign: "right",
        paddingTop: 6,
        paddingRight: 20,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 700,
          color: item.isCurrent ? "#00f5d4"
               : item.isPast    ? "rgba(255,255,255,0.25)"
               :                  "rgba(255,255,255,0.4)",
          letterSpacing: 0.3,
          whiteSpace: "nowrap",
        }}>
          {item.time}
        </span>
      </div>

      {/* Dot + connecting line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          flexShrink: 0,
          marginTop: 3,
          zIndex: 2,
          position: "relative",
          background: item.isPast
            ? "#00f5d4"
            : item.isCurrent
            ? "#00f5d4"
            : "rgba(255,255,255,0.1)",
          border: item.isCurrent
            ? "3px solid rgba(0,245,212,0.35)"
            : item.isPast
            ? "2px solid rgba(0,245,212,0.5)"
            : "2px solid rgba(255,255,255,0.1)",
          boxShadow: item.isCurrent ? "0 0 16px rgba(0,245,212,0.9)" : "none",
          animation: item.isCurrent ? "ex-dot-live 1.5s ease-out infinite" : "none",
        }} />
        <div style={{
          width: 2,
          flex: 1,
          minHeight: 32,
          background: item.isPast
            ? "linear-gradient(to bottom, rgba(0,245,212,0.5), rgba(0,245,212,0.15))"
            : "rgba(255,255,255,0.05)",
          marginTop: 3,
          marginBottom: 3,
        }} />
      </div>

      {/* Content card */}
      <div style={{ flex: 1, paddingLeft: 16, paddingBottom: 24 }}>
        <div
          className="ex-glass"
          style={{
            padding: "14px 18px",
            border: item.isCurrent
              ? "1px solid rgba(0,245,212,0.35)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: item.isCurrent
              ? "0 0 28px rgba(0,245,212,0.1), 0 4px 20px rgba(0,0,0,0.3)"
              : "0 2px 12px rgba(0,0,0,0.2)",
            opacity: item.isPast ? 0.5 : 1,
            transition: "all 0.3s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: item.progress > 0 ? 12 : 0 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                <span style={{
                  fontFamily: "var(--font-main)",
                  fontWeight: 700,
                  fontSize: 14,
                  color: item.isCurrent ? "#fff" : "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 200,
                }}>
                  {item.exercise}
                </span>

                {item.isCurrent && (
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(0,245,212,0.12)",
                    border: "1px solid rgba(0,245,212,0.35)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "#00f5d4",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}>◉ NOW</span>
                )}

                {item.isPast && (
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "#4ade80",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}>✓ DONE</span>
                )}
              </div>

              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                {item.duration} min
                {item.sets ? ` · ${item.sets} sets` : ""}
                {item.reps  ? ` · ${item.reps} reps` : ""}
              </div>
            </div>
          </div>

          {/* Progress bar — only when there's progress */}
          {item.progress > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: 1, textTransform: "uppercase" }}>Progress</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: item.isCurrent ? "#00f5d4" : "rgba(74,222,128,0.7)" }}>{item.progress}%</span>
              </div>
              <div className="ex-progress-bar">
                <div
                  className="ex-progress-fill"
                  style={{ "--fill-width": `${item.progress}%`, width: 0 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Workout Timeline ──────────────────────────────────────────────────────────
export function WorkoutTimeline({ exercises }) {
  const sectionRef = useRef(null);
  const timeline   = useMemo(() => buildTimeline(exercises || []), [exercises]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const items = sectionRef.current.querySelectorAll("[data-timeline-item]");
    gsap.fromTo(items,
      { opacity: 0, x: -24 },
      {
        opacity: 1, x: 0, duration: 0.55, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      }
    );
  }, [timeline]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <section style={{ padding: "80px 24px", maxWidth: 780, margin: "0 auto" }}>
      <div className="ex-section-label" style={{ textAlign: "center", marginBottom: 12 }}>TODAY</div>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-main)",
        fontWeight: 800,
        fontSize: "clamp(26px,4vw,44px)",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: "-1px",
      }}>
        Workout <span className="ex-gradient-text">Timeline</span>
      </h2>

      {/* Current time indicator */}
      <div style={{
        textAlign: "center",
        marginBottom: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 10px #00f5d4", animation: "ex-dot-live 1.8s ease-out infinite" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(0,245,212,0.6)", letterSpacing: 1 }}>
          NOW {timeStr}
        </span>
      </div>

      <div ref={sectionRef}>
        {timeline.map((item, i) => (
          <TimelineItem key={i} item={item} />
        ))}
      </div>
    </section>
  );
}
