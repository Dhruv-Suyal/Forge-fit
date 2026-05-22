import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../utils/axios";

import { Header }          from "../../components/header";
import { DietHero }        from "./components/DietHero";
import { DietAIInput }     from "./components/DietAIInput";
import { DietMealPreview } from "./components/DietMealPreview";
import { DietTodayPlan }   from "./components/DietTodayPlan";
import "./diet.css";

gsap.registerPlugin(ScrollTrigger);

// ── Toast ──────────────────────────────────────────────────────────────────────
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
    <div ref={ref} style={{
      position: "fixed", top: 80, right: 24, zIndex: 2000,
      padding: "12px 20px",
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, color: c.color,
      fontFamily: "var(--font-main)", fontWeight: 600, fontSize: 13,
      backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      maxWidth: 320, lineHeight: 1.5,
    }}>
      {message}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
function Divider({ color = "rgba(0,245,212,0.12)" }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      margin: "0 48px",
    }} />
  );
}

// ── Main Diet Page ─────────────────────────────────────────────────────────────
export function DietPage() {
  const [generatedDiet, setGeneratedDiet] = useState(null);   // AI result
  const [todayPlan,     setTodayPlan]     = useState(null);   // saved in WellnessLog
  const [planLoading,   setPlanLoading]   = useState(true);   // today fetch
  const [aiLoading,     setAiLoading]     = useState(false);  // generate call
  const [saving,        setSaving]        = useState(false);  // save call
  const [toast,         setToast]         = useState(null);

  const previewRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Fetch today's saved diet plan on mount ─────────────────────────────────
  const fetchTodayPlan = useCallback(async () => {
    setPlanLoading(true);
    try {
      const { data } = await api.get("/diet/today");
      setTodayPlan(data?.dietPlan ?? null);
    } catch (err) {
      console.error("[diet/today]", err?.response?.data || err.message);
      setTodayPlan(null);
    } finally {
      setPlanLoading(false);
    }
  }, []);

  useEffect(() => { fetchTodayPlan(); }, [fetchTodayPlan]);

  // ── Generate diet with AI ──────────────────────────────────────────────────
  const handleGenerate = useCallback(async (form) => {
    setAiLoading(true);
    setGeneratedDiet(null);
    try {
      const { data } = await api.post("/diet/generate", {
        title: form.title,
        goal:  form.goal || "general health",
      });

      const diet = data?.diet;
      if (!diet || !Array.isArray(diet.meals)) throw new Error("Invalid AI response");

      setGeneratedDiet(diet);
      showToast("Diet plan generated! Review and save below. 🧠", "info");

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    } catch (err) {
      console.error("[diet/generate]", err?.response?.data || err.message);
      showToast(err?.response?.data?.message || "Generation failed. Try again.", "error");
      throw err; // re-throw so DietAIInput can clear its loading state
    } finally {
      setAiLoading(false);
    }
  }, [showToast]);

  // ── Save diet to WellnessLog ───────────────────────────────────────────────
  const handleSave = useCallback(async (diet) => {
    setSaving(true);
    try {
      const { data } = await api.post("/diet/save", {
        title:         diet.title,
        goal:          diet.goal,
        totalCalories: diet.totalCalories,
        meals:         diet.meals,
      });
      setTodayPlan(data?.dietPlan ?? diet);
      showToast(`"${diet.title}" saved to today's wellness log! ✅`, "success");
    } catch (err) {
      console.error("[diet/save]", err?.response?.data || err.message);
      showToast("Save failed. Please try again.", "error");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  // ── Dismiss generated preview ──────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    setGeneratedDiet(null);
  }, []);

  return (
    <div
      className="diet-page"
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
          position: "absolute", top: "5%", left: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)",
          animation: "diet-float 14s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "-8%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)",
          animation: "diet-float 18s ease-in-out infinite reverse",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "40%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.025) 0%, transparent 70%)",
          animation: "diet-float 22s ease-in-out infinite 3s",
        }} />
      </div>

      {/* ── Header ── */}
      <Header />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* 1. Hero — shows today's plan stats */}
        <DietHero todayPlan={todayPlan} />

        <Divider color="rgba(0,245,212,0.12)" />

        {/* 2. AI Input form */}
        <DietAIInput onGenerated={handleGenerate} loading={aiLoading} />

        <Divider color="rgba(124,58,237,0.12)" />

        {/* 3. AI generated preview (shown after generate) */}
        {generatedDiet && (
          <div ref={previewRef}>
            <DietMealPreview
              diet={generatedDiet}
              onSave={handleSave}
              saving={saving}
              onDismiss={handleDismiss}
            />
            <Divider color="rgba(245,158,11,0.1)" />
          </div>
        )}

        {/* 4. Today's saved plan */}
        <DietTodayPlan
          dietPlan={todayPlan}
          loading={planLoading}
        />

      </div>

      {/* Toast notification */}
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

// Named export alias — keeps App.jsx import { Diet } working
export { DietPage as Diet };

// Default export
export default DietPage;