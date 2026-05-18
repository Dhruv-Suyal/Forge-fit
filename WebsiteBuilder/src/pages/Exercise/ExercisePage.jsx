import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../utils/axios";

import { Header }          from "../../components/header";
import { HeroSection }     from "./components/HeroSection";
import { AIInputSection }  from "./components/AIInputSection";
import { ExercisePreview } from "./components/ExercisePreview";
import { SavedRoutines }   from "./components/SavedRoutines";
import { WorkoutTimeline } from "./components/WorkoutTimeline";
import { AIAssistant }     from "./components/AIAssistant";
import "./exercise.css";

gsap.registerPlugin(ScrollTrigger);

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.4)" }
    );
    const t = setTimeout(() => {
      gsap.to(ref.current, { opacity: 0, x: 60, duration: 0.3, onComplete: onClose });
    }, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",  color: "#4ade80" },
    error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   color: "#f87171" },
    info:    { bg: "rgba(0,245,212,0.12)",   border: "rgba(0,245,212,0.3)",   color: "#00f5d4" },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 2000,
        padding: "12px 20px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        color: c.color,
        fontFamily: "var(--font-main)",
        fontWeight: 600,
        fontSize: 13,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth: 320,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}

// ── FALLBACK exercises (when backend unavailable) ─────────────────────────────
function makeFallback(form) {
  return [
    {
      title:        `${form.title} — Strength Focus`,
      goal:         "Build raw strength and muscle mass",
      category:     "strength",
      difficulty:   (form.difficulty || "beginner").toLowerCase(),
      sets:         4, reps: 8, duration: form.duration || 30,
      preferredTime: form.preferredTime || "7:00 AM",
      image:        null, video: null,
      description:  `Heavy compound ${form.title} to maximise strength gains.`,
    },
    {
      title:        `${form.title} — Hypertrophy`,
      goal:         "Maximise muscle size and definition",
      category:     "muscle-building",
      difficulty:   (form.difficulty || "beginner").toLowerCase(),
      sets:         4, reps: 12, duration: form.duration || 40,
      preferredTime: form.preferredTime || "9:00 AM",
      image:        null, video: null,
      description:  `Moderate-load ${form.title} in the hypertrophy rep range.`,
    },
    {
      title:        `${form.title} — Cardio Burn`,
      goal:         "Improve cardiovascular endurance",
      category:     "cardio",
      difficulty:   (form.difficulty || "beginner").toLowerCase(),
      sets:         3, reps: 20, duration: form.duration || 20,
      preferredTime: form.preferredTime || "6:30 PM",
      image:        null, video: null,
      description:  `High-rep ${form.title} circuit to elevate heart rate and burn calories.`,
    },
    {
      title:        `${form.title} — Mobility`,
      goal:         "Increase range of motion and flexibility",
      category:     "mobility",
      difficulty:   "beginner",
      sets:         2, reps: 15, duration: 15,
      preferredTime: "9:00 PM",
      image:        null, video: null,
      description:  `Controlled ${form.title} focusing on full range of motion.`,
    },
  ];
}

// ── Main Exercise Page ────────────────────────────────────────────────────────
export function ExercisePage() {
  const [aiLoading,         setAiLoading]         = useState(false);
  const [generatedExercises,setGeneratedExercises] = useState(null);   // array | null
  const [exerciseList,      setExerciseList]       = useState([]);
  const [listLoading,       setListLoading]        = useState(true);
  const [saving,            setSaving]             = useState(false);
  const [savingId,          setSavingId]           = useState(null);   // index of card being saved
  const [lastForm,          setLastForm]           = useState(null);
  const [toast,             setToast]              = useState(null);

  const previewRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Fetch saved exercises ──────────────────────────────────────────────────
  const fetchExercises = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await api.get("/getExercise");
      setExerciseList(Array.isArray(data) ? data : data.exercises || []);
    } catch (err) {
      console.error("Fetch exercises error:", err);
      setExerciseList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  // ── Generate exercises via AI ──────────────────────────────────────────────
  const handleGenerate = useCallback(async (form) => {
    setAiLoading(true);
    setLastForm(form);
    setGeneratedExercises(null);

    try {
      // Note: backend route is POST /api/SearchExercise
      const { data } = await api.post("/SearchExercise", {
        title:         form.title,
        duration:      form.duration,
        preferredTime: form.preferredTime,
        difficulty:    form.difficulty,
      });

      const exercises = data?.exercises;
      if (!Array.isArray(exercises) || exercises.length === 0) throw new Error("No exercises returned");

      setGeneratedExercises(exercises);
      showToast(`AI generated ${exercises.length} exercise variations ✨`, "info");

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (err) {
      console.error("Generate error:", err?.response?.data || err.message);
      // Graceful offline fallback
      const fallback = makeFallback(form);
      setGeneratedExercises(fallback);
      showToast("Offline mode — using AI fallback data", "error");
    } finally {
      setAiLoading(false);
    }
  }, [showToast]);

  // ── Regenerate ─────────────────────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    if (lastForm) handleGenerate(lastForm);
  }, [lastForm, handleGenerate]);

  // ── Save a single exercise (called with the (possibly edited) exercise obj) ─
  const handleSave = useCallback(async (exercise, index) => {
    setSaving(true);
    setSavingId(index);
    try {
      await api.post("/addExercise", {
        title:         exercise.title,
        goal:          exercise.goal,
        category:      exercise.category,
        difficulty:    exercise.difficulty,
        sets:          Number(exercise.sets)  || undefined,
        reps:          Number(exercise.reps)  || undefined,
        duration:      Number(exercise.duration) || undefined,
        preferredTime: exercise.preferredTime,
        image:         exercise.image  || "",
        video:         exercise.video  || "",
      });
      showToast(`"${exercise.title}" saved to your profile! 💪`, "success");
      await fetchExercises();
    } catch (err) {
      console.error("Save error:", err?.response?.data || err.message);
      showToast("Failed to save exercise. Check your connection.", "error");
    } finally {
      setSaving(false);
      setSavingId(null);
    }
  }, [fetchExercises, showToast]);

  // ── Delete exercise ────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (exerciseId) => {
    try {
      await api.delete(`/deleteExercise/${exerciseId}`);
      setExerciseList(prev => prev.filter(e => e._id !== exerciseId));
      showToast("Exercise removed from profile.", "info");
    } catch (err) {
      console.error("Delete error:", err?.response?.data || err.message);
      showToast("Delete failed. Please try again.", "error");
    }
  }, [showToast]);

  return (
    <div
      className="ex-page"
      style={{
        minHeight: "100vh",
        background: "#00000e",
        fontFamily: "var(--font-main)",
        overflowX: "hidden",
      }}
    >
      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          top: "5%", left: "-10%",
          width: 700, height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)",
          animation: "ex-float-slow 14s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "15%", right: "-8%",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)",
          animation: "ex-float-slow 18s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Header */}
      <Header />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 1. Hero */}
        <HeroSection />

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,245,212,0.15), transparent)", margin: "0 48px" }} />

        {/* 2. AI Input */}
        <AIInputSection onGenerate={handleGenerate} aiLoading={aiLoading} />

        {/* 3. AI Results Preview (array of cards) */}
        <div ref={previewRef}>
          <ExercisePreview
            exercises={generatedExercises}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
            saving={saving}
            savingId={savingId}
          />
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)", margin: "0 48px" }} />

        {/* 4. Saved Routines */}
        <SavedRoutines
          exercises={exerciseList}
          onDelete={handleDelete}
          loading={listLoading}
        />

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,245,212,0.1), transparent)", margin: "0 48px" }} />

        {/* 5. Workout Timeline */}
        <WorkoutTimeline exercises={exerciseList} />

        <div style={{ height: 120 }} />
      </div>

      {/* 6. Floating AI Assistant */}
      <AIAssistant />

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
