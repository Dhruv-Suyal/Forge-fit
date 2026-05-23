import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "../../utils/axios";

import { Header }          from "../../components/header";
import { DietHero }        from "./components/DietHero";
import { DietAIInput }     from "./components/DietAIInput";
import { DietMealPreview } from "./components/DietMealPreview";
import { DietSavedPlans }  from "./components/DietSavedPlans";
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

  const COLORS = {
    success: { bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.3)",  color: "#4ade80" },
    error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   color: "#f87171" },
    info:    { bg: "rgba(0,245,212,0.12)",   border: "rgba(0,245,212,0.3)",   color: "#00f5d4" },
  };
  const c = COLORS[type] || COLORS.info;

  return (
    <div ref={ref} style={{
      position: "fixed", top: 80, right: 24, zIndex: 2000,
      padding: "12px 20px", background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, color: c.color, fontFamily: "var(--font-main)",
      fontWeight: 600, fontSize: 13, backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxWidth: 320, lineHeight: 1.5,
    }}>{message}</div>
  );
}

function Divider({ color = "rgba(0,245,212,0.12)" }) {
  return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${color},transparent)`, margin: "0 48px" }} />;
}

// ── Main Diet Page ─────────────────────────────────────────────────────────────
export function DietPage() {
  const [generatedDiets, setGeneratedDiets] = useState(null);   // 3 AI variations
  const [dietList,       setDietList]       = useState([]);      // Profile.diets[]
  const [listLoading,    setListLoading]    = useState(true);
  const [aiLoading,      setAiLoading]      = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [savingId,       setSavingId]       = useState(null);
  const [lastForm,       setLastForm]       = useState(null);
  const [toast,          setToast]          = useState(null);

  const previewRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // ── Fetch saved diets from Profile ────────────────────────────────────────
  const fetchDiets = useCallback(async () => {
    setListLoading(true);
    try {
      const { data } = await api.get("/diet/getDiets");
      setDietList(Array.isArray(data.diets) ? data.diets : []);
    } catch (err) {
      console.error("[diet/getDiets]", err?.response?.data || err.message);
      setDietList([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => { fetchDiets(); }, [fetchDiets]);

  // ── Generate 3 diet variations via AI ─────────────────────────────────────
  const handleGenerate = useCallback(async (form) => {
    setAiLoading(true);
    setLastForm(form);
    setGeneratedDiets(null);
    try {
      const { data } = await api.post("/diet/generate", {
        title: form.title,
        goal:  form.goal || "general health",
        dietaryRestrictions: form.dietaryRestrictions || "none",
      });

      const diets = data?.diets;
      if (!Array.isArray(diets) || diets.length === 0) throw new Error("No diet plans returned");

      setGeneratedDiets(diets);
      showToast(`AI generated ${diets.length} diet variations ✨`, "info");

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    } catch (err) {
      console.error("[diet/generate]", err?.response?.data || err.message);
      showToast(err?.response?.data?.message || "Generation failed. Please try again.", "error");
      throw err;
    } finally {
      setAiLoading(false);
    }
  }, [showToast]);

  // ── Regenerate ────────────────────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    if (lastForm) handleGenerate(lastForm);
  }, [lastForm, handleGenerate]);

  // ── Save selected diet to Profile ─────────────────────────────────────────
  const handleSave = useCallback(async (diet, index) => {
    setSaving(true);
    setSavingId(index);
    try {
      const response = await api.post("/diet/save", {
        title:         diet.title,
        goal:          diet.goal,
        category:      diet.category,
        totalCalories: diet.totalCalories,
        image:         diet.image  || "",
        imageSearch:   diet.imageSearch || "",
        meals:         diet.meals,
      });
      console.log("[diet/save] Response:", response.data);
      showToast(`"${diet.title}" saved to today's wellness log! 🥗`, "success");
      await fetchDiets(); // refresh the list below
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Unknown error";
      console.error("[diet/save] Error:", { status: err?.response?.status, data: err?.response?.data, message: errorMsg });
      showToast(`Save failed: ${errorMsg}`, "error");
    } finally {
      setSaving(false);
      setSavingId(null);
    }
  }, [fetchDiets, showToast]);

  // ── Update saved diet ─────────────────────────────────────────────────────
  const handleUpdate = useCallback(async (dietId, updates) => {
    try {
      await api.put(`/diet/update/${dietId}`, updates);
      showToast("Diet plan updated! ✅", "success");
      await fetchDiets();
    } catch (err) {
      console.error("[diet/update]", err?.response?.data || err.message);
      showToast("Update failed. Please try again.", "error");
      throw err;
    }
  }, [fetchDiets, showToast]);

  // ── Delete saved diet ─────────────────────────────────────────────────────
  const handleDelete = useCallback(async (dietId) => {
    try {
      await api.delete(`/diet/delete/${dietId}`);
      setDietList(prev => prev.filter(d => d._id !== dietId));
      showToast("Diet plan removed from profile.", "info");
    } catch (err) {
      console.error("[diet/delete]", err?.response?.data || err.message);
      showToast("Delete failed. Please try again.", "error");
    }
  }, [showToast]);

  return (
    <div className="diet-page" style={{ minHeight: "100vh", background: "#00000e", fontFamily: "var(--font-main)", overflowX: "hidden" }}>

      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "5%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,212,0.04) 0%, transparent 70%)", animation: "diet-float 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)", animation: "diet-float 18s ease-in-out infinite reverse" }} />
      </div>

      {/* Header */}
      <Header />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* 1. Hero — shows saved plan count + first plan stats */}
        <DietHero todayPlan={dietList[0] ?? null} />

        <Divider color="rgba(0,245,212,0.12)" />

        {/* 2. AI Input */}
        <DietAIInput onGenerated={handleGenerate} loading={aiLoading} />

        <Divider color="rgba(124,58,237,0.12)" />

        {/* 3. Generated 3-card preview */}
        <div ref={previewRef}>
          <DietMealPreview
            diets={generatedDiets}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
            saving={saving}
            savingId={savingId}
          />
        </div>

        {generatedDiets?.length > 0 && <Divider color="rgba(245,158,11,0.1)" />}

        {/* 4. Saved plans from Profile */}
        <DietSavedPlans
          diets={dietList}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          loading={listLoading}
        />

      </div>

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// Named export alias — App.jsx uses: import { Diet } from "./pages/Diet/Diet"
export { DietPage as Diet };
export default DietPage;