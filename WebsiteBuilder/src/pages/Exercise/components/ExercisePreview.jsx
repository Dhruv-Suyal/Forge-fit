import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import {
  FiSave, FiRefreshCw, FiEdit2, FiX, FiCheck,
  FiTarget, FiLayers, FiBarChart2, FiClock, FiRepeat, FiPlay,
} from "react-icons/fi";

const DIFF_BADGE = (d) => {
  const map = {
    beginner: "ex-badge-beginner",
    intermediate: "ex-badge-intermediate",
    advanced: "ex-badge-advanced",
    expert: "ex-badge-expert",
  };
  return map[(d || "").toLowerCase()] || "ex-badge-beginner";
};

// Extract YouTube video ID from any YouTube URL
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── Single Exercise Result Card ───────────────────────────────────────────────
function ExerciseCard({ exercise: initialExercise, index, onSave, saving }) {
  const cardRef   = useRef(null);
  const [editMode,  setEditMode]  = useState(false);
  const [exercise,  setExercise]  = useState(initialExercise);
  const [imgError,  setImgError]  = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Entrance stagger
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 50, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, delay: index * 0.12, ease: "back.out(1.4)" }
    );
  }, [index]);

  const videoId = getYouTubeId(exercise.video);
  const imgSrc  = imgError || !exercise.image
    ? `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800`
    : exercise.image;

  const metaItems = [
    { icon: <FiTarget />,    label: "Goal",       key: "goal",          value: exercise.goal },
    { icon: <FiLayers />,    label: "Category",   key: "category",      value: exercise.category },
    { icon: <FiBarChart2 />, label: "Difficulty", key: "difficulty",    value: exercise.difficulty, isBadge: true },
    { icon: <FiRepeat />,    label: "Sets",        key: "sets",          value: exercise.sets },
    { icon: <FiRepeat />,    label: "Reps",        key: "reps",          value: exercise.reps },
    { icon: <FiClock />,     label: "Duration",    key: "duration",      value: exercise.duration ? `${exercise.duration} min` : null },
    { icon: <FiClock />,     label: "Best Time",   key: "preferredTime", value: exercise.preferredTime },
  ].filter(m => m.value != null && m.value !== "");

  const handleSave = () => {
    gsap.timeline()
      .to(cardRef.current, { scale: 0.97, duration: 0.1 })
      .to(cardRef.current, { scale: 1, duration: 0.2, ease: "back.out(1.4)" });
    onSave(exercise, index);
  };

  return (
    <div
      ref={cardRef}
      className="ex-glass"
      style={{
        opacity: 0,
        border: "1px solid rgba(0,245,212,0.15)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.3s, border-color 0.3s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.35)"; e.currentTarget.style.boxShadow = "0 8px 48px rgba(0,245,212,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,245,212,0.15)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,0,0,0.4)"; }}
    >
      {/* ── Image / Video area ─────────────────────────────────────────── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0, background: "#000" }}>
        {showVideo && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={exercise.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <>
            <img
              src={imgSrc}
              alt={exercise.title}
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
              onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.06, duration: 0.5 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1, duration: 0.5 })}
            />
            {/* Gradient overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to top, rgba(0,0,14,0.95), transparent)" }} />

            {/* Video play button (only if video URL exists) */}
            {videoId && (
              <button
                onClick={() => setShowVideo(true)}
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(255,0,0,0.85)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontFamily: "var(--font-main)",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                  transition: "background 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,0,0,1)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,0,0,0.85)"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <FiPlay style={{ fontSize: 10 }} /> Watch Video
              </button>
            )}
          </>
        )}

        {/* Difficulty badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span className={`ex-badge ${DIFF_BADGE(exercise.difficulty)}`}>⚡ {exercise.difficulty}</span>
        </div>

        {/* Edit toggle */}
        <button
          onClick={() => { setEditMode(m => !m); if (editMode) setExercise(initialExercise); }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: editMode ? "rgba(0,245,212,0.2)" : "rgba(0,0,0,0.5)",
            border: `1px solid ${editMode ? "rgba(0,245,212,0.5)" : "rgba(255,255,255,0.2)"}`,
            color: editMode ? "#00f5d4" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 13,
            backdropFilter: "blur(4px)",
            transition: "all 0.2s",
          }}
          title={editMode ? "Cancel edit" : "Edit exercise"}
        >
          {editMode ? <FiX /> : <FiEdit2 />}
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Title */}
        {editMode ? (
          <input
            value={exercise.title || ""}
            onChange={e => setExercise(p => ({ ...p, title: e.target.value }))}
            className="ex-input-glow"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(0,245,212,0.3)",
              borderRadius: 10,
              padding: "8px 12px",
              color: "#fff",
              fontFamily: "var(--font-main)",
              fontWeight: 800,
              fontSize: 16,
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <h3 style={{
            margin: 0,
            fontFamily: "var(--font-main)",
            fontWeight: 800,
            fontSize: 17,
            color: "#fff",
            letterSpacing: "-0.4px",
            lineHeight: 1.3,
          }}>
            {exercise.title}
          </h3>
        )}

        {/* Meta grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
          {metaItems.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
              <span style={{ color: "rgba(0,245,212,0.55)", fontSize: 11, marginTop: 2, flexShrink: 0 }}>{m.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 1 }}>{m.label}</div>
                {m.isBadge
                  ? <span className={`ex-badge ${DIFF_BADGE(m.value)}`} style={{ fontSize: 9 }}>{m.value}</span>
                  : editMode
                    ? (
                      <input
                        value={exercise[m.key] ?? ""}
                        onChange={e => setExercise(p => ({ ...p, [m.key]: e.target.value }))}
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,245,212,0.2)", borderRadius: 6, padding: "3px 7px", color: "#fff", fontFamily: "var(--font-main)", fontSize: 11, fontWeight: 600, width: "100%", outline: "none", boxSizing: "border-box" }}
                      />
                    )
                    : <div style={{ fontFamily: "var(--font-main)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{m.value}</div>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Sets / Reps / Duration chips */}
        {(exercise.sets || exercise.reps || exercise.duration) && !editMode && (
          <div style={{ display: "flex", gap: 8 }}>
            {exercise.sets && (
              <div style={{ flex: 1, padding: "6px 10px", background: "rgba(0,245,212,0.06)", borderRadius: 10, border: "1px solid rgba(0,245,212,0.12)", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#00f5d4" }}>{exercise.sets}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Sets</div>
              </div>
            )}
            {exercise.reps && (
              <div style={{ flex: 1, padding: "6px 10px", background: "rgba(124,58,237,0.06)", borderRadius: 10, border: "1px solid rgba(124,58,237,0.15)", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>{exercise.reps}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Reps</div>
              </div>
            )}
            {exercise.duration && (
              <div style={{ flex: 1, padding: "6px 10px", background: "rgba(251,191,36,0.06)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.15)", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "#fbbf24" }}>{exercise.duration}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Min</div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {editMode ? (
          <textarea
            value={exercise.description || ""}
            onChange={e => setExercise(p => ({ ...p, description: e.target.value }))}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,245,212,0.2)",
              borderRadius: 10,
              padding: "10px 12px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-main)",
              fontSize: 12,
              lineHeight: 1.6,
              width: "100%",
              resize: "vertical",
              outline: "none",
              minHeight: 72,
              boxSizing: "border-box",
            }}
            placeholder="Exercise description..."
          />
        ) : exercise.description ? (
          <p style={{
            margin: 0,
            fontFamily: "var(--font-main)",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.7,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {exercise.description}
          </p>
        ) : null}

        {/* Save button — pushed to bottom */}
        <div style={{ marginTop: "auto", paddingTop: 4 }}>
          <button
            className="ex-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {editMode ? <FiCheck /> : <FiSave />}
            {saving ? "Saving..." : editMode ? "Save Edited to Profile" : "Save to Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview Section (array of cards) ─────────────────────────────────────────
export function ExercisePreview({ exercises, onSave, onRegenerate, saving, savingId }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !exercises?.length) return;
    gsap.fromTo(sectionRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, [exercises]);

  if (!exercises?.length) return null;

  return (
    <section ref={sectionRef} style={{ padding: "0 24px 80px", maxWidth: 1280, margin: "0 auto", opacity: 0 }}>
      {/* Header */}
      <div className="ex-section-label" style={{ textAlign: "center", marginBottom: 12 }}>AI RESULTS</div>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-main)",
        fontWeight: 800,
        fontSize: "clamp(24px,4vw,42px)",
        color: "#fff",
        marginBottom: 8,
        letterSpacing: "-1px",
      }}>
        Choose Your <span className="ex-gradient-text">Exercise</span>
      </h2>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-main)", fontSize: 14, marginBottom: 40 }}>
        AI generated {exercises.length} variations — pick the one that fits your goal, or edit before saving.
      </p>

      {/* Cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
        marginBottom: 32,
      }}>
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={i}
            exercise={ex}
            index={i}
            onSave={onSave}
            saving={saving && savingId === i}
          />
        ))}
      </div>

      {/* Regenerate */}
      <div style={{ textAlign: "center" }}>
        <button
          className="ex-btn-ghost"
          onClick={onRegenerate}
          style={{ padding: "12px 28px", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}
        >
          <FiRefreshCw /> Regenerate All
        </button>
      </div>
    </section>
  );
}
