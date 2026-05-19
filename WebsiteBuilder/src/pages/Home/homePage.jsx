import { useState, useEffect, useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axios";
import { Header } from "../../components/header";

// ══════════════════════════════════════════════════════════════════════════════
// TICKER — static motivational feed
// ══════════════════════════════════════════════════════════════════════════════
const TICKER_ITEMS = [
  { type: "quote", text: "Discipline is the bridge between goals and accomplishment. — Jim Rohn" },
  { type: "weather", text: "🌤 Stay hydrated · Drink water every hour for peak performance" },
  { type: "news", text: "📰 WHO: 7-9 hrs sleep is key to metabolic health in adults" },
  { type: "alert", text: "⚡ ForgeFit AI · Your personalised tasks are ready for today" },
  { type: "quote", text: "The body achieves what the mind believes." },
  { type: "news", text: "📰 Study: 10-min cold exposure boosts dopamine by 250% — Nature, 2025" },
  { type: "quote", text: "You don't rise to the level of your goals, you fall to the level of your systems." },
];

// Category → icon
const CAT_ICON = { workout: "⚡", exercise: "⚡", fitness: "⚡", nutrition: "⟡", food: "⟡", meal: "⟡", mindfulness: "◎", meditation: "◎", sleep: "◎", rest: "◎", learning: "◈", reading: "◈", hydration: "💧" };
function catIcon(cat) { if (!cat) return "✦"; const k = cat.toLowerCase(); for (const [key, v] of Object.entries(CAT_ICON)) { if (k.includes(key)) return v; } return "✦"; }

// Convert "10:00 PM" → "22:00"
function to24h(str) {
  if (!str || (!str.includes('AM') && !str.includes('PM'))) return str || "22:00";
  const [time, mer] = str.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

// Transform TodayTask docs → activity row shape
function transformTasks(tasks) {
  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();
  return tasks.map(t => {
    const tMins = timeToMins(t.scheduledTime || '00:00');
    const diff = tMins - nowM;
    const status = t.completed ? 'done' : diff > 30 ? 'upcoming' : diff >= -30 ? 'active' : 'upcoming';
    return {
      id: t._id,
      time: t.scheduledTime || '--:--',
      label: t.title,
      duration: t.duration ? `${t.duration} min` : '--',
      icon: catIcon(t.category),
      status,
      scoreDelta: t.xpReward || 10,
    };
  });
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }
function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return t;
}
function timeToMins(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}
function minsUntil(timeStr) {
  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();
  const tgt = timeToMins(timeStr);
  return tgt - nowM;
}
function fmtCountdown(mins) {
  if (mins <= 0) return "Now";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score = 87, size = 150, stroke = 9 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [prog, setProg] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProg(score), 400); return () => clearTimeout(t); }, [score]);
  const color = score >= 80 ? "#00f5d4" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeLinecap="round"
          strokeDashoffset={circ - (circ * prog / 100)}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)", filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--ff-mono)", fontSize: 38, fontWeight: 700, color, textShadow: `0 0 20px ${color}80`, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginTop: 4 }}>TODAY</span>
      </div>
    </div>
  );
}

// ─── mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ val, max = 100, color = "#00f5d4", label, sub }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW((val / max) * 100), 500); }, [val, max]);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color }}>{sub}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 99, boxShadow: `0 0 8px ${color}`, transition: "width 1.1s cubic-bezier(.22,1,.36,1)" }} />
      </div>
    </div>
  );
}

// ─── panel wrapper ────────────────────────────────────────────────────────────
function Panel({ children, style = {}, className = "" }) {
  return (
    <div className={`fp-panel ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="fp-section-label">{children}</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// LEFT: DAILY ACTIVITY
// ══════════════════════════════════════════════════════════════════════════════
function ActivityPanel({ activities, onMarkDone }) {
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <Panel style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
      <SectionLabel>Daily Activity</SectionLabel>
      {/* ← this div scrolls, not the page */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 2 }} className="fp-scroll">
        {activities.map((act, i) => {
          const isActive = act.status === "active";
          const isDone = act.status === "done";
          const isMissed = act.status === "missed";
          const isUp = act.status === "upcoming";
          const accentColor = isDone ? "#00f5d4" : isActive ? "#f59e0b" : isMissed ? "#ef4444" : "rgba(255,255,255,0.18)";

          return (
            <div key={act.id} className={`fp-activity-row ${isActive ? "fp-activity-active" : ""} ${isDone ? "fp-activity-done" : ""}`}>
              {i < activities.length - 1 && (
                <div className="fp-timeline-line" style={{ background: isDone ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.05)" }} />
              )}
              <div className="fp-act-dot" style={{
                background: isDone ? "#00f5d4" : isActive ? "#f59e0b" : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${accentColor}`,
                boxShadow: (isDone || isActive) ? `0 0 10px ${accentColor}` : "none",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: accentColor, letterSpacing: 1 }}>{act.time}</span>
                  {isDone && <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "#00f5d4", background: "rgba(0,245,212,0.1)", borderRadius: 4, padding: "1px 6px" }}>+{act.scoreDelta} pts</span>}
                  {isMissed && <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "#ef4444", background: "rgba(239,68,68,0.1)", borderRadius: 4, padding: "1px 6px" }}>−{act.scoreDelta} pts</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, opacity: isDone ? 0.5 : 1 }}>{act.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isDone ? "rgba(255,255,255,0.35)" : isActive ? "#fff" : "rgba(255,255,255,0.7)", textDecoration: isDone ? "line-through" : "none", fontFamily: "var(--ff-body)" }}>{act.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{act.duration}</span>
                  {(isActive || isUp) && <button className="fp-done-btn" onClick={() => onMarkDone(act.id)}>✓ Done</button>}
                  {isDone && <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(0,245,212,0.4)" }}>Completed</span>}
                  {isMissed && <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(239,68,68,0.4)" }}>Missed</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CENTER: SCORES + SLEEP (side by side)
// ══════════════════════════════════════════════════════════════════════════════
function CenterPanel({ user, activities, sleep }) {
  const clock = useClock();
  const done = activities.filter(a => a.status === "done").length;
  const total = activities.length;
  const timeStr = `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}`;
  const dateStr = clock.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekScores = [62, 78, 85, 70, 91, 88, user.todayScore];
  const sleepCountdown = minsUntil(sleep.bedtime);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Clock */}
      <Panel className="fp-center-panel" style={{ textAlign: "center", padding: "18px 20px 14px" }}>
        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 36, fontWeight: 700, color: "#00f5d4", textShadow: "0 0 24px rgba(0,245,212,0.4)", letterSpacing: 3, lineHeight: 1 }}>{timeStr}</div>
        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginTop: 6 }}>{dateStr.toUpperCase()}</div>
      </Panel>

      {/* Score ring + Sleep side by side */}
      <Panel className="fp-center-panel" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 0, padding: "20px 18px 18px", position: "relative" }}>

        {/* LEFT: ring + stat pills */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingRight: 16 }}>
          <div style={{ position: "absolute", top: 12, left: 14, fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(0,245,212,0.4)", letterSpacing: 2 }}>TODAY SCORE</div>
          <ScoreRing score={user.todayScore} size={150} stroke={9} />
          <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
            {[
              ["Streak", `${user.streak}d`, "#f59e0b"],
              ["Tasks", `${done}/${total}`, "#00f5d4"],
              ["Weekly", `${user.weekScore}`, "#7c3aed"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center", padding: "9px 6px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", minWidth: 52 }}>
                <div style={{ fontFamily: "var(--ff-mono)", fontSize: 14, fontWeight: 700, color: c, textShadow: `0 0 10px ${c}66` }}>{v}</div>
                <div style={{ fontFamily: "var(--ff-mono)", fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 3, letterSpacing: 1 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

        {/* RIGHT: sleep schedule */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, paddingLeft: 16 }}>
          <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, letterSpacing: 2, color: "rgba(0,245,212,0.45)", textTransform: "uppercase", marginBottom: 2 }}>Sleep Schedule</div>
          {[
            { label: "SLEEP AT", time: sleep.bedtime, color: "#7c3aed", icon: "🌙" },
            { label: "WAKE UP", time: sleep.wakeTime, color: "#f59e0b", icon: "☀️" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}22` }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--ff-mono)", fontSize: 20, fontWeight: 700, color: s.color, textShadow: `0 0 12px ${s.color}55`, lineHeight: 1 }}>{s.time}</div>
                <div style={{ fontFamily: "var(--ff-mono)", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: 1.5, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
          {sleepCountdown > 0 && (
            <div style={{ textAlign: "center", padding: "7px", borderRadius: 10, background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: "rgba(124,58,237,0.8)", letterSpacing: 1 }}>
                Sleep in <strong style={{ color: "#7c3aed" }}>{fmtCountdown(sleepCountdown)}</strong>
              </span>
            </div>
          )}
          <MiniBar val={sleep.hoursActual || 0} max={sleep.hoursTarget} color="#7c3aed" label="TARGET" sub={`${sleep.hoursTarget} hrs`} />
        </div>
      </Panel>

      {/* Weekly bar chart */}
      <Panel className="fp-center-panel" style={{ padding: "14px 16px" }}>
        <SectionLabel>This Week</SectionLabel>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60, marginTop: 6 }}>
          {weekDays.map((d, i) => {
            const s = weekScores[i];
            const isToday = i === 6;
            const col = s >= 80 ? "#00f5d4" : s >= 60 ? "#f59e0b" : "#ef4444";
            return (
              <div key={`${d}-${i}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: "100%", background: isToday ? col : `${col}55`, borderRadius: "4px 4px 0 0", height: `${(s / 100) * 50}px`, boxShadow: isToday ? `0 0 8px ${col}` : "none", transition: "height 1s ease", minHeight: 4, position: "relative" }}>
                  {isToday && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--ff-mono)", fontSize: 8, color: col, whiteSpace: "nowrap" }}>{s}</div>}
                </div>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: isToday ? col : "rgba(255,255,255,0.2)" }}>{d}</span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Next activity countdown */}
      {(() => {
        const next = activities.find(a => a.status === "upcoming" || a.status === "active");
        if (!next) return null;
        const mins = minsUntil(next.time);
        return (
          <Panel style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{next.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{next.label}</div>
              <div style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{next.time} · {next.duration}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--ff-mono)", fontSize: 14, fontWeight: 700, color: "#f59e0b", textShadow: "0 0 10px rgba(245,158,11,0.5)" }}>{fmtCountdown(mins)}</div>
              <div style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>NEXT UP</div>
            </div>
          </Panel>
        );
      })()}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RIGHT: WELLNESS PANEL (sleep removed — now in CenterPanel)
// ══════════════════════════════════════════════════════════════════════════════
function WellnessPanel({ water, food, screenTime, onWaterTap, onFoodDone, onScreenTimeUpdate }) {
  const [editScreen, setEditScreen] = useState(null);
  const [editVal, setEditVal] = useState("");

  return (
    // No overflow here — the parent column div owns the scroll
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>

      {/* ── WATER ── */}
      <Panel>
        <SectionLabel>Water Intake</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--ff-mono)", fontSize: 22, fontWeight: 700, color: "#0ea5e9", textShadow: "0 0 12px rgba(14,165,233,0.5)" }}>{water.consumed}</span>
          <span style={{ fontFamily: "var(--ff-mono)", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>/ {water.target} glasses</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--ff-mono)", fontSize: 10, color: "#0ea5e9" }}>{water.consumed * water.glassML} ml</span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {Array.from({ length: water.target }).map((_, i) => {
            const filled = i < water.consumed;
            return (
              <button key={i} onClick={() => onWaterTap(i + 1)}
                title={filled ? "Tap to undo" : "Tap to log glass"}
                style={{
                  width: 34, height: 42, borderRadius: 8, cursor: "pointer",
                  background: filled ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${filled ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, transition: "all 0.2s",
                  boxShadow: filled ? "0 0 10px rgba(14,165,233,0.2)" : "none",
                  transform: filled ? "translateY(-1px)" : "none",
                }}
              >{filled ? "💧" : "○"}</button>
            );
          })}
        </div>
        <MiniBar val={water.consumed} max={water.target} color="#0ea5e9" label="DAILY GOAL" sub={`${Math.round((water.consumed / water.target) * 100)}%`} />
      </Panel>

      {/* ── FOOD ── */}
      <Panel>
        <SectionLabel>Food Intake</SectionLabel>
        {food.map(meal => (
          <div key={meal.id} style={{
            marginBottom: 10, padding: "11px 13px", borderRadius: 11,
            background: meal.done ? "rgba(0,245,212,0.04)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${meal.done ? "rgba(0,245,212,0.2)" : "rgba(255,255,255,0.06)"}`,
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <span style={{ fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 700, color: meal.done ? "rgba(255,255,255,0.4)" : "#e2e8f0" }}>{meal.meal}</span>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>{meal.time}</span>
              </div>
              <button onClick={() => onFoodDone(meal.id)} style={{
                width: 26, height: 26, borderRadius: 7, cursor: "pointer",
                background: meal.done ? "rgba(0,245,212,0.15)" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${meal.done ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: meal.done ? "#00f5d4" : "rgba(255,255,255,0.2)", fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: meal.done ? "0 0 8px rgba(0,245,212,0.25)" : "none", transition: "all 0.2s",
              }}>✓</button>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {meal.items.map((item, j) => (
                <span key={j} style={{
                  fontFamily: "var(--ff-mono)", fontSize: 10,
                  color: meal.done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.03)", borderRadius: 4,
                  padding: "2px 7px", textDecoration: meal.done ? "line-through" : "none",
                }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </Panel>

      {/* ── SCREEN TIME ── */}
      <Panel>
        <SectionLabel>Screen Time Limits</SectionLabel>
        {screenTime.map(app => {
          const pct = Math.min((app.used / app.limit) * 100, 100);
          const over = app.used >= app.limit;
          return (
            <div key={app.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12 }}>{app.icon}</span>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 600, color: over ? "#ef4444" : "rgba(255,255,255,0.65)" }}>{app.app}</span>
                  {over && <span style={{ fontFamily: "var(--ff-mono)", fontSize: 8, color: "#ef4444", background: "rgba(239,68,68,0.1)", borderRadius: 4, padding: "1px 5px", letterSpacing: 1 }}>OVER LIMIT</span>}
                </div>
                {editScreen === app.id ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input type="number" value={editVal} min={0} max={180}
                      onChange={e => setEditVal(e.target.value)}
                      style={{ width: 44, padding: "2px 6px", borderRadius: 6, border: "1px solid rgba(0,245,212,0.3)", background: "rgba(0,245,212,0.06)", color: "#00f5d4", fontFamily: "var(--ff-mono)", fontSize: 11, outline: "none" }}
                    />
                    <button onClick={() => { onScreenTimeUpdate(app.id, Number(editVal)); setEditScreen(null); }}
                      style={{ background: "rgba(0,245,212,0.15)", border: "1px solid rgba(0,245,212,0.3)", borderRadius: 6, color: "#00f5d4", fontSize: 11, cursor: "pointer", padding: "2px 7px" }}>✓</button>
                    <button onClick={() => setEditScreen(null)}
                      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.3)", fontSize: 11, cursor: "pointer", padding: "2px 7px" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditScreen(app.id); setEditVal(app.used); }}
                    style={{ fontFamily: "var(--ff-mono)", fontSize: 11, color: over ? "#ef4444" : app.color, background: "transparent", border: "none", cursor: "pointer", padding: "2px 4px" }}>
                    {app.used} / {app.limit} min
                  </button>
                )}
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: over ? "#ef4444" : app.color, borderRadius: 99, boxShadow: `0 0 8px ${over ? "#ef4444" : app.color}66`, transition: "width 0.8s ease" }} />
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BOTTOM TICKER
// ══════════════════════════════════════════════════════════════════════════════
function Ticker({ items }) {
  const TYPE_COLOR = { quote: "#00f5d4", weather: "#0ea5e9", news: "rgba(255,255,255,0.5)", alert: "#f59e0b" };
  const TYPE_PREFIX = { quote: "◈ THOUGHT", weather: "⟡ WEATHER", news: "✦ NEWS", alert: "⚠ ALERT" };
  return (
    <div style={{ height: 40, background: "rgba(0,0,14,0.95)", borderTop: "1px solid rgba(0,245,212,0.1)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ flexShrink: 0, padding: "0 14px", height: "100%", display: "flex", alignItems: "center", gap: 6, background: "rgba(0,245,212,0.07)", borderRight: "1px solid rgba(0,245,212,0.15)" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 8px #00f5d4", animation: "fhp-blink 1.2s ease-in-out infinite" }} />
        <span style={{ fontFamily: "var(--ff-mono)", fontSize: 9, color: "rgba(0,245,212,0.7)", letterSpacing: 2, whiteSpace: "nowrap" }}>LIVE FEED</span>
      </div>
      <div style={{ flex: 1, overflow: "hidden", height: "100%", position: "relative" }}>
        <div style={{ display: "flex", animation: "fhp-marquee 55s linear infinite", alignItems: "center", height: "100%" }}>
          {[...items, ...items].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 28px", whiteSpace: "nowrap", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: 8, color: TYPE_COLOR[item.type] || "#fff", letterSpacing: 1.5, opacity: 0.7 }}>{TYPE_PREFIX[item.type]}</span>
              <span style={{ fontFamily: "var(--ff-body)", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LOADING / ERROR
// ══════════════════════════════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#00000e", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(0,245,212,0.15)", borderTopColor: "#00f5d4", animation: "fp-spin 0.9s linear infinite" }} />
      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "rgba(0,245,212,0.5)", letterSpacing: 3 }}>LOADING YOUR DAY</span>
      <style>{"@keyframes fp-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
export function Home() {
  const { user: authUser, profile } = useAuth();

  const [rawTasks, setRawTasks] = useState([]);
  const [wellness, setWellness] = useState(null);
  const [weeklyScores, setWeeklyScores] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const tickerRef = useRef(null);

  useEffect(() => {
    api.get('/home/today')
      .then(res => {
        setRawTasks(res.data.tasks || []);
        setWellness(res.data.wellness || null);
        setWeeklyScores(res.data.weeklyScores || [0, 0, 0, 0, 0, 0, 0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useGSAP(() => {
    if (loading || !containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".fp-grid-bg", { opacity: 0, duration: 0.8 }, 0)
      .from(".fp-glow-l", { opacity: 0, x: -80, duration: 1.2 }, 0)
      .from(".fp-glow-r", { opacity: 0, x: 80, duration: 1.2 }, 0)
      .from(".fp-activity-row", { opacity: 0, x: -28, duration: 0.45, stagger: 0.045 }, 0.15)
      .from(".fp-center-panel", { opacity: 0, y: 22, scale: 0.96, duration: 0.5, stagger: 0.1 }, 0.1)
      .from(".fp-right-panel", { opacity: 0, x: 28, duration: 0.45, stagger: 0.09 }, 0.25)
      .from(tickerRef.current, { opacity: 0, y: 18, duration: 0.5 }, 0.55);
  }, { scope: containerRef, dependencies: [loading] });

  // ── derived values ──────────────────────────────────────────────────────────
  const activities = transformTasks(rawTasks);
  const completedXP = rawTasks.filter(t => t.completed).reduce((s, t) => s + (t.xpReward || 0), 0);
  const totalXP = rawTasks.reduce((s, t) => s + (t.xpReward || 0), 0);
  const todayScore = totalXP > 0 ? Math.round((completedXP / totalXP) * 100) : 0;

  const userData = {
    name: profile?.displayName || authUser?.name || "Athlete",
    todayScore,
    weekScore: weeklyScores[weeklyScores.length - 1] || 0,
    streak: 12,
  };

  const water = wellness?.water || { target: 8, consumed: 0, glassML: 250 };
  const food = wellness?.food || [];
  const screenTime = wellness?.screenTime || [];
  const sleep = {
    bedtime: to24h(profile?.sleepTime || "10:00 PM"),
    wakeTime: to24h(profile?.wakeUpTime || "06:00 AM"),
    hoursTarget: 7.5,
    hoursActual: null,
  };

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleMarkDone = useCallback(async (id) => {
    setRawTasks(prev => prev.map(t => t._id === id ? { ...t, completed: true } : t));
    try { await api.patch(`/home/tasks/${id}/done`); }
    catch { setRawTasks(prev => prev.map(t => t._id === id ? { ...t, completed: false } : t)); }
  }, []);

  const handleWaterTap = useCallback(async (slot) => {
    const next = water.consumed >= slot ? slot - 1 : slot;
    setWellness(prev => ({ ...prev, water: { ...prev.water, consumed: next } }));
    try { await api.patch('/home/wellness/water', { consumed: next }); }
    catch { setWellness(prev => ({ ...prev, water: { ...prev.water, consumed: water.consumed } })); }
  }, [water]);

  const handleFoodDone = useCallback(async (id) => {
    setWellness(prev => ({ ...prev, food: prev.food.map(f => f.id === id ? { ...f, done: !f.done } : f) }));
    try { await api.patch(`/home/wellness/food/${id}`); }
    catch { setWellness(prev => ({ ...prev, food: prev.food.map(f => f.id === id ? { ...f, done: !f.done } : f) })); }
  }, []);

  const handleScreenTimeUpdate = useCallback(async (id, minutes) => {
    setWellness(prev => ({ ...prev, screenTime: prev.screenTime.map(s => s.id === id ? { ...s, used: minutes } : s) }));
    try { await api.patch('/home/wellness/screentime', { id, minutes }); }
    catch { }
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div style={{ minHeight: "100vh", background: "#00000e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", color: "#ef4444", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠</div>
        <div style={{ fontSize: 13 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "8px 18px", borderRadius: 8, background: "rgba(0,245,212,0.1)", border: "1px solid rgba(0,245,212,0.3)", color: "#00f5d4", cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
      </div>
    </div>
  );

  return (
    <>
      <Header />

      {/* ROOT — fixed viewport height, no page scroll ever */}
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          overflow: "hidden",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          paddingTop: 64,
          fontFamily: "var(--ff-body)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

          :root {
            --bg:      #00000e;
            --bg2:     rgba(255,255,255,0.022);
            --border:  rgba(255,255,255,0.07);
            --teal:    #00f5d4;
            --purple:  #7c3aed;
            --amber:   #f59e0b;
            --blue:    #0ea5e9;
            --ff-body: 'Sora', sans-serif;
            --ff-mono: 'JetBrains Mono', monospace;
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          /* ── 3-column grid ── */
          .fp-grid {
            display: grid;
            grid-template-columns: 272px 1fr 300px;
            gap: 12px;
            padding: 12px 16px 8px;
            flex: 1;
            min-height: 0;
          }
          @media (max-width: 1100px) {
            .fp-grid { grid-template-columns: 240px 1fr 260px; gap: 8px; padding: 8px 10px; }
          }
          @media (max-width: 820px) {
            .fp-grid { grid-template-columns: 1fr; overflow-y: auto; }
          }

          /*
           * Each column: flex column, min-height 0 so children can shrink,
           * overflow hidden so the column itself clips — scroll is on the
           * inner content or on the column via overflowY:auto inline style.
           */
          .fp-col {
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          /* panel */
          .fp-panel {
            background: rgba(255,255,255,0.022);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            padding: 14px 14px 12px;
            position: relative;
            overflow: hidden;
          }
          .fp-panel::before {
            content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0,245,212,0.3), transparent);
          }

          .fp-section-label {
            font-family: var(--ff-mono); font-size: 9px; letter-spacing: 2px;
            color: rgba(0,245,212,0.45); text-transform: uppercase; margin-bottom: 12px;
          }

          /* activity rows */
          .fp-activity-row {
            display: flex; align-items: flex-start; gap: 10px;
            padding: 10px 6px; border-radius: 10px;
            transition: background 0.18s; margin-bottom: 2px; position: relative;
          }
          .fp-activity-row:hover   { background: rgba(255,255,255,0.025); }
          .fp-activity-active      { background: rgba(245,158,11,0.05) !important; border: 1px solid rgba(245,158,11,0.12); border-radius: 10px; }
          .fp-activity-done        { opacity: 0.55; }

          .fp-act-dot {
            width: 10px; height: 10px; border-radius: 50%;
            flex-shrink: 0; margin-top: 4px; transition: all 0.2s;
          }
          .fp-timeline-line {
            position: absolute; left: 10px; top: 24px; width: 1px; height: calc(100% - 8px);
            pointer-events: none;
          }

          .fp-done-btn {
            font-family: var(--ff-mono); font-size: 10px; font-weight: 500;
            color: rgba(0,245,212,0.7); background: rgba(0,245,212,0.06);
            border: 1px solid rgba(0,245,212,0.2); border-radius: 6px;
            padding: 3px 10px; cursor: pointer; letter-spacing: 0.5px; transition: all 0.18s;
          }
          .fp-done-btn:hover { background: rgba(0,245,212,0.12); color: #00f5d4; border-color: rgba(0,245,212,0.4); box-shadow: 0 0 10px rgba(0,245,212,0.15); }

          /* thin custom scrollbar */
          .fp-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,245,212,0.15) transparent; }
          .fp-scroll::-webkit-scrollbar       { width: 3px; }
          .fp-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,212,0.15); border-radius: 99px; }

          /* ambient */
          .fp-grid-bg {
            position: fixed; inset: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(0,245,212,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,212,0.025) 1px, transparent 1px);
            background-size: 52px 52px;
            mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          }
          .fp-glow-l { position: fixed; left: -200px; top: 30%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(ellipse, rgba(0,245,212,0.06) 0%, transparent 70%); pointer-events: none; }
          .fp-glow-r { position: fixed; right: -200px; top: 50%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%); pointer-events: none; }

          @keyframes fhp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @keyframes fhp-blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }

          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        `}</style>

        <div className="fp-grid-bg" />
        <div className="fp-glow-l" />
        <div className="fp-glow-r" />

        {/* ── 3-COLUMN GRID ── */}
        <div className="fp-grid">

          {/* LEFT — panel itself handles inner scroll */}
          <div className="fp-col">
            <ActivityPanel activities={activities} onMarkDone={handleMarkDone} />
          </div>

          {/* CENTER — column scrolls */}
          <div className="fp-col fp-scroll" style={{ overflowY: "auto" }}>
            <CenterPanel user={userData} activities={activities} sleep={sleep} />
          </div>

          {/* RIGHT — column scrolls; WellnessPanel is just a plain flex div */}
          <div className="fp-col fp-scroll" style={{ overflowY: "auto" }}>
            <WellnessPanel
              water={water}
              food={food}
              screenTime={screenTime}
              onWaterTap={handleWaterTap}
              onFoodDone={handleFoodDone}
              onScreenTimeUpdate={handleScreenTimeUpdate}
            />
          </div>
        </div>

        {/* TICKER — always pinned at the bottom */}
        <div ref={tickerRef}>
          <Ticker items={TICKER_ITEMS} />
        </div>
      </div>
    </>
  );
}