import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { FiTrash2, FiClock, FiTarget, FiLayers, FiPlay } from "react-icons/fi";

const DIFF_BADGE = (d) => {
  const map = {
    beginner: "ex-badge-beginner",
    intermediate: "ex-badge-intermediate",
    advanced: "ex-badge-advanced",
    expert: "ex-badge-expert",
  };
  return map[(d || "").toLowerCase()] || "ex-badge-beginner";
};

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

// ── Single Exercise Card ──────────────────────────────────────────────────────
function ExerciseCard({ exercise, onDelete }) {
  const cardRef    = useRef(null);
  const [imgErr,    setImgErr]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const videoId = getYouTubeId(exercise.video);
  const imgSrc  = (imgErr || !exercise.image)
    ? `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400`
    : exercise.image;

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 16;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
    gsap.to(card, { rotateY: x, rotateX: y, duration: 0.3, ease: "power2.out", transformPerspective: 800 });
  }, []);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { boxShadow: "0 8px 60px rgba(0,245,212,0.18), 0 0 0 1px rgba(0,245,212,0.3)", duration: 0.3 });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateY: 0, rotateX: 0,
      boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
      duration: 0.5, ease: "elastic.out(1,0.5)",
    });
  };

  const handleDelete = () => {
    setDeleting(true);
    gsap.timeline()
      .to(cardRef.current, { opacity: 0, scale: 0.95, y: -10, duration: 0.25, ease: "power2.in" })
      .to(cardRef.current, { height: 0, marginBottom: 0, duration: 0.35, ease: "power2.inOut" })
      .call(() => onDelete(exercise._id));
  };

  return (
    <div
      ref={cardRef}
      className="ex-glass ex-tilt-card"
      style={{
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
        cursor: "default",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image / Video */}
      <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#000" }}>
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
              onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
              onMouseEnter={e => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.6 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { scale: 1,    duration: 0.6 })}
            />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, rgba(0,0,14,0.9), transparent)" }} />

            {/* YouTube button */}
            {videoId && (
              <button
                onClick={() => setShowVideo(true)}
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  background: "rgba(255,0,0,0.85)",
                  border: "none",
                  borderRadius: 7,
                  color: "#fff",
                  fontFamily: "var(--font-main)",
                  fontWeight: 700,
                  fontSize: 10,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,0,0,1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,0,0,0.85)"}
              >
                <FiPlay style={{ fontSize: 9 }} /> Watch
              </button>
            )}
          </>
        )}

        {/* Difficulty badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span className={`ex-badge ${DIFF_BADGE(exercise.difficulty)}`}>{exercise.difficulty || "N/A"}</span>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete exercise"
          style={{
            position: "absolute", top: 12, right: 12,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 13,
            transition: "all 0.2s",
            opacity: deleting ? 0.5 : 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <FiTrash2 />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px 20px" }}>
        <h3 style={{ margin: "0 0 12px", fontFamily: "var(--font-main)", fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.3px" }}>
          {exercise.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {exercise.goal && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <FiTarget style={{ color: "rgba(0,245,212,0.6)", fontSize: 11, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{exercise.goal}</span>
            </div>
          )}
          {exercise.category && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <FiLayers style={{ color: "rgba(0,245,212,0.6)", fontSize: 11, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{exercise.category}</span>
            </div>
          )}
          {exercise.preferredTime && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <FiClock style={{ color: "rgba(0,245,212,0.6)", fontSize: 11, flexShrink: 0 }} />
              <span style={{ fontFamily: "var(--font-main)", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{exercise.preferredTime}</span>
            </div>
          )}
        </div>

        {/* Sets / Reps chips */}
        {(exercise.sets || exercise.reps || exercise.duration) && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
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
      </div>
    </div>
  );
}

// ── Saved Routines Grid ───────────────────────────────────────────────────────
export function SavedRoutines({ exercises, onDelete, loading }) {
  const sectionRef = useRef(null);
  const gridRef    = useRef(null);

  useEffect(() => {
    if (!gridRef.current || !exercises?.length) return;
    const cards = gridRef.current.querySelectorAll(".ex-glass");
    gsap.fromTo(cards,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
      }
    );
  }, [exercises]);

  return (
    <section ref={sectionRef} style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="ex-section-label" style={{ textAlign: "center", marginBottom: 12 }}>YOUR LIBRARY</div>
      <h2 style={{
        textAlign: "center",
        fontFamily: "var(--font-main)",
        fontWeight: 800,
        fontSize: "clamp(26px,4vw,44px)",
        color: "#fff",
        marginBottom: 12,
        letterSpacing: "-1px",
      }}>
        Saved <span className="ex-gradient-text">Routines</span>
      </h2>
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-main)", fontSize: 14, marginBottom: 48 }}>
        {exercises?.length || 0} exercise{exercises?.length !== 1 ? "s" : ""} saved to your profile
      </p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
          <div className="ex-spinner" />
        </div>
      ) : exercises?.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 24px",
          border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 24,
          color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-main)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💪</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.35)" }}>No exercises saved yet</div>
          <div style={{ fontSize: 13 }}>Generate your first AI workout above to get started</div>
        </div>
      ) : (
        <div
          ref={gridRef}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}
        >
          {exercises.map(ex => (
            <ExerciseCard key={ex._id} exercise={ex} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
