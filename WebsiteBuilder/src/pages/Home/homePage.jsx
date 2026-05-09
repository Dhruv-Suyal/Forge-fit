import { useState, useEffect, useRef } from "react";
import "./home.css";
import { Header } from "../../components/header";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger)


const WORDS = ["stunning", "powerful", "blazing-fast", "pixel-perfect", "production-ready"];

const FEATURES = [
  { icon: "✦", title: "Prompt to Website", desc: "Type what you want. Our AI reads intent, structure, and aesthetics — generating a complete site in under 15 seconds." },
  { icon: "◈", title: "Visual Editor", desc: "Refine every pixel after generation. Drag, resize, recolor — full design control without touching code." },
  { icon: "⬡", title: "Export Clean Code", desc: "Download production-ready React + Tailwind. No lock-in. No bloat. Code you're proud to ship." },
  { icon: "⊕", title: "One-Click Deploy", desc: "Connect your domain and go live instantly. Global CDN, SSL, and edge delivery included." },
  { icon: "◎", title: "CMS Scaffolding", desc: "Auto-generate headless CMS schemas and API routes based on your content. Backend, handled." },
  { icon: "⟡", title: "Iterative Prompting", desc: "Not right? Refine it. The AI remembers your context and updates surgically." },
];

const STEPS = [
  { num: "01", title: "Describe your vision", desc: "Write a prompt like you're texting a designer. The more detail, the better the output." },
  { num: "02", title: "AI generates instantly", desc: "Watch your website materialize in real time — layout, copy, components, and style." },
  { num: "03", title: "Refine & publish", desc: "Tweak with follow-up prompts or the visual editor, then deploy with a single click." },
];

const PLANS = [
  { name: "Free", price: "$0", desc: "For individuals exploring AI-generated websites.", features: ["5 generations/month", "HTML export", "Community support", "Subdomain hosting"], cta: "Get Started", hot: false },
  { name: "Pro", price: "$29", desc: "For founders and creators who ship fast.", features: ["Unlimited generations", "React + Tailwind export", "Custom domain + SSL", "CMS scaffolding", "Priority support"], cta: "Start Pro", hot: true },
  { name: "Team", price: "$99", desc: "For agencies and teams building at scale.", features: ["Everything in Pro", "5 team seats", "API access", "White-label export", "Dedicated manager"], cta: "Contact Sales", hot: false },
];

const EXAMPLES = [
  "Dark SaaS landing page for a PM tool",
  "Luxury e-commerce for handmade ceramics",
  "Portfolio for a motion designer",
  "Booking platform for a high-end spa",
];

const STATS = [
  { value: "12s", label: "Avg. generation" },
  { value: "50K+", label: "Sites built" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "User rating" },
];

export function Home() {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [focused, setFocused] = useState(false);
  const textRef = useRef(null);
  const pricingRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const showCaseRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % WORDS.length); setWordVisible(true); }, 400);
    }, 2800);
    return () => clearInterval(t);
  }, []);

 // ANIMATION
 useGSAP(() => {
  // ── HERO ──
  gsap.from(".BADGE",      { y: -100, opacity: 0, delay: 1, duration: 1 });
  gsap.from(".HEADLINE",   { x: -140, opacity: 0, delay: 1, duration: 1 });
  gsap.from(".SUBHEADING", { x:  140, opacity: 0, delay: 1, duration: 1 });
  gsap.from(".PROMPTBOX",  { y:  140, opacity: 0, delay: 1, duration: 1 });

  // ── STATS ──
  gsap.from(".STATBARELEM", {
    y: 120, opacity: 0, stagger: 0.15,
    scrollTrigger: {
      trigger: ".STATBAR",
      start: "top 85%",
      end: "top 40%",
      scrub: 1,
      once: true,
    }
  });

  // ── FEATURES HEADING ──
  gsap.from(".FEATURESHEADING", {
    x: -140, opacity: 0,
    scrollTrigger: {
      trigger: ".FEATURESHEADING",
      start: "top 90%",
      end: "top 60%",
      scrub: 1,
      once: true,
    }
  });

  // ── FEATURES GRID ──
  gsap.from(".FEATUREGRID", {
    y: 200, opacity: 0,
    scrollTrigger: {
      trigger: ".FEATUREGRID",
      start: "top 90%",
      end: "top 40%",
      scrub: 1,
      once: true,
    }
  });

  // ── HOW IT WORKS HEADING ──
  gsap.from(".HOWITWORKSHEADING", {
    x: -200, opacity: 0,
    scrollTrigger: {
      trigger: ".HOWITWORKSANIMATIONSTART",
      start: "top 90%",
      end: "top 60%",
      scrub: 1,
      once: true,
    }
  });

  // ── HOW IT WORKS STEPS ──
  gsap.from(".HOWITWORKSTEP", {
    y: 200, opacity: 0,
    scrollTrigger: {
      trigger: ".HOWITWORKSANIMATIONSTART",
      start: "top 70%",
      end: "top 20%",
      scrub: 1,
      once: true,
    }
  });

  // ── PREVIEW ──
  gsap.from(".PREVIEW", {
    y: 200, opacity: 0,
    scrollTrigger: {
      trigger: ".HOWITWORKSTEP",
      start: "top 70%",
      end: "bottom 30%",
      scrub: 1,
      once: true,
    }
  });

  // ── PRICING HEADING ──
  gsap.from(".PRICINGHEADING", {
    x: -200, opacity: 0,
    scrollTrigger: {
      trigger: ".PRICINGHEADING",
      start: "top 90%",
      end: "top 60%",
      scrub: 1,
      once: true,
    }
  });

  // ── PRICING GRID ──
  gsap.from(".PRICINGGRID", {
    y: 300, opacity: 0,
    scrollTrigger: {
      trigger: ".PRICINGHEADING",
      start: "top 70%",
      end: "top 10%",
      scrub: 1,
      once: true,
    }
  });

  // ── BANNER ──
  gsap.from(".BANNER", {
    y: 300, opacity: 0,
    scrollTrigger: {
      trigger: ".BANNER",
      start: "top 80%",
      end: "top 40%",
      scrub: 1,
      once: true,
    }
  });
});
  return (
    <div className="min-h-screen bg-[#000008] text-slate-200 overflow-x-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
        <Header pricingRef={pricingRef} howItWorksRef={howItWorksRef} featuresRef={featuresRef} showCaseRef={showCaseRef} />
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-5 overflow-hidden">
        <div className="hero-grid" />
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />

        <div className="relative z-10 flex flex-col items-center w-full">

          {/* Badge */}
          <div className=" BADGE badge-border animate-fadeUp-1 inline-flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-5 py-1.5 mb-9">
            <span className="badge-dot-pulse w-1.75 h-1.75 rounded-full bg-indigo-500 shrink-0" style={{ boxShadow: "0 0 10px #6366f1" }} />
            <span className="text-[13px] font-medium text-indigo-300 whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
              Now in public beta — 50,000+ sites built
            </span>
          </div>

          {/* Headline */}
          <div className="HEADLINE">
          <h1 className="animate-fadeUp-2 text-[clamp(40px,6.5vw,84px)] font-extrabold text-center leading-[1.07] tracking-[-2.5px] text-white mb-6">
            Build{" "}
            <span className={`grad-text inline-block ${wordVisible ? "word-in" : "word-out"}`}>
              {WORDS[wordIdx]}
            </span>
            <br />
            websites from a prompt.
          </h1>
          </div>

          {/* Sub */}
          <div className="SUBHEADING">
          <p className=" animate-fadeUp-3 text-center text-[clamp(15px,1.8vw,19px)] text-slate-600 font-normal leading-[1.8] max-w-125 mx-auto mb-12">
            Describe your website in plain English. Our AI generates a fully functional, production-ready site — in seconds.
          </p>
          </div>

          {/* Prompt Box */}
          <div className="PROMPTBOX">
          <div id=" PROMPTBOX" className=" animate-fadeUp-4 w-full max-w-175">
            <div
              className={`rounded-[20px] overflow-hidden transition-all duration-300 ${focused ? "prompt-glow border border-indigo-500/55" : "border border-white/8"}`}
              style={{ background: "rgba(255,255,255,0.025)", boxShadow: focused ? undefined : "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              {/* Top */}
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" style={{ boxShadow: "0 0 8px #6366f1" }} />
                  <span className="text-[10px] font-medium tracking-[2px] uppercase text-[#3a3a7a]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                    Describe your website
                  </span>
                </div>
                <textarea
                  ref={textRef}
                  className="w-full bg-transparent border-none outline-none text-slate-200 text-[15px] font-normal leading-[1.75] resize-none"
                  style={{ caretColor: "#818cf8", fontFamily: "'Sora', sans-serif" }}
                  rows={3}
                  placeholder="e.g. A sleek dark SaaS landing page for a project management tool with animated stats, pricing, and a glowing gradient CTA..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-black/20 border-t border-white/5 flex-wrap">
                <span className="text-[11px] text-[#252550]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                  {prompt.length > 0 ? `${prompt.length} chars` : "Be as detailed as you like"}
                </span>
                <button
                  className="grad-bg flex items-center gap-2 text-[14px] font-semibold text-white px-6 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden whitespace-nowrap"
                  style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.45)" }}
                >
                  <span className="absolute inset-0 bg-linear-to-br from-white/18 to-transparent" />
                  <span className="relative flex items-center gap-2">
                    Generate Website
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </button>
              </div>
            </div>

            {/* Example Pills */}
            <div className="animate-fadeUp-5 flex gap-2 mt-4 flex-wrap justify-center">
              <span className="text-[11px] text-[#252545] leading-7.25 shrink-0" style={{ fontFamily: "'JetBrains Mono',monospace" }}>Try →</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => { setPrompt(ex); textRef.current?.focus(); }}
                  className="bg-white/3 border border-white/[0.07] rounded-full px-4 py-1.5 text-[11px] text-slate-600 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/[0.07] transition-all duration-200 cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: "'JetBrains Mono',monospace" }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 opacity-30 z-10">
          <div className="w-px h-10 bg-linear-to-b from-transparent to-indigo-500" />
          <span className="text-[10px] tracking-[2px] uppercase text-indigo-400" style={{ fontFamily: "'JetBrains Mono',monospace" }}>scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════
           STATS
      ══════════════════════════════ */}
      <div className="border-t border-white/6 border-b bg-white/1.5 STATBAR">
        <div className="max-w-240 mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center STATBARELEM">
              <div className="grad-text text-[clamp(36px,4vw,56px)] font-extrabold tracking-[-2px] leading-none">{value}</div>
              <div className="mt-2.5 text-[12px] text-[#333358] tracking-[0.5px]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
           FEATURES
      ══════════════════════════════ */}
      <section ref={featuresRef} className="max-w-300 mx-auto px-8 py-28 pt-10">
        <div className=" FEATURESHEADING">
        <span className="inline-block bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-[11px] font-semibold text-indigo-400 tracking-[2px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono',monospace" }}>Features</span>
        <h2 className="text-[clamp(28px,4vw,54px)] font-extrabold tracking-[-2px] leading-[1.08] text-white mb-4">
          Everything you need.<br />
          <span className="grad-text">Nothing you don't.</span>
        </h2>
        <p className="text-base text-slate-600 font-normal leading-[1.75] max-w-105">
          ForgeAI handles design, code, and deployment — so you can focus on building the product.
        </p>
        </div>
        <div className="grid FEATUREGRID grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feat-top-line relative bg-white/[0.022] border border-white/6.5 rounded-[22px] p-9 transition-all duration-300 hover:border-indigo-500/25 hover:-translate-y-2.5 hover:bg-white/4 overflow-hidden"
              style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 mb-6 text-[20px] text-indigo-400">
                {f.icon}
              </div>
              <div className="text-[16px] font-bold text-slate-200 mb-3 tracking-[-0.2px]">{f.title}</div>
              <div className="text-[14px] text-slate-600 leading-[1.8]">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
           HOW IT WORKS
      ══════════════════════════════ */}
      <div ref={howItWorksRef} className="bg-white/[0.012] border-t border-b border-white/6">
        <section className="max-w-300 mx-auto px-8 py-28 pt-10">
          <div className=" HOWITWORKSHEADING">
          <span className="HOWITWORKSANIMATIONSTART inline-block bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-[11px] font-semibold text-indigo-400 tracking-[2px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono',monospace" }}>How It Works</span>
          <h2 className="text-[clamp(28px,4vw,54px)] font-extrabold tracking-[-2px] leading-[1.08] text-white mb-4">
            Three steps to a<br />
            <span className="grad-text">live website.</span>
          </h2>
          </div>

          {/* Steps */}
          <div className="HOWITWORKSTEP">
          <div className="steps-connector relative grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center px-3">
                <div
                  className="grad-bg relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-[15px] font-bold text-white mb-7"
                  style={{ fontFamily: "'JetBrains Mono',monospace", boxShadow: "0 0 36px rgba(99,102,241,0.45)" }}
                >
                  {s.num}
                </div>
                <div className="text-[17px] font-bold text-slate-200 mb-3 tracking-[-0.2px]">{s.title}</div>
                <div className="text-[14px] text-slate-600 leading-[1.8] PREVIEWSTART">{s.desc}</div>
              </div>
            ))}
          </div>
          </div>

          {/* Preview Window */}
          <div className="PREVIEW">
          <div className="preview-top-line relative bg-white/2 border border-white/[0.07] rounded-3xl overflow-hidden mt-16" style={{ boxShadow: "0 40px 140px rgba(0,0,0,0.6)" }}>
            {/* Browser Bar */}
            <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-white/6 bg-white/2">
              <div className="flex gap-1.75">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 max-w-[320px] mx-auto bg-white/4 border border-white/6 rounded-lg px-4 py-1.5 text-[12px] text-[#33335a] text-center" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                forgeai.app/preview/x9k2m
              </div>
            </div>

            {/* Live Badge */}
            <div className="absolute top-14.5 right-5 z-10 flex items-center gap-2 bg-[#000008]/92 border border-green-500/25 rounded-full px-3.5 py-1.5">
              <span className="gen-dot-pulse w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 8px #4ade80" }} />
              <span className="text-[11px] text-green-400" style={{ fontFamily: "'JetBrains Mono',monospace" }}>Generated in 11.2s</span>
            </div>

            {/* Fake Website Preview */}
            <div className="flex items-center justify-center px-8 py-12 min-h-75" style={{ background: "linear-gradient(180deg, rgba(8,4,28,0.9) 0%, rgba(0,0,8,1) 100%)" }}>
              <div className="flex flex-col items-center gap-5 w-full max-w-140 text-center">
                <div className="w-12 h-12 rounded-2xl grad-bg flex items-center justify-center text-[22px]" style={{ boxShadow: "0 0 32px rgba(99,102,241,0.5)" }}>⚡</div>
                <h3 className="text-[clamp(22px,4vw,38px)] font-extrabold tracking-[-1.5px] text-white leading-[1.1]">
                  Manage projects<br />
                  <span className="grad-text">at light speed.</span>
                </h3>
                <p className="text-[14px] text-slate-600 max-w-90 leading-[1.75]">
                  The only project tool built for teams that actually ship. AI-powered, deeply integrated, beautifully designed.
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <div className="grad-bg px-7 py-3 rounded-xl text-[14px] font-bold text-white" style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.45)" }}>Start Free Trial</div>
                  <div className="px-7 py-3 rounded-xl text-[14px] font-medium text-slate-600 border border-white/8">Watch Demo →</div>
                </div>
                <div className="flex gap-12 pt-7 border-t border-white/6 w-full justify-center">
                  {[["10K+", "Teams"], ["99.9%", "Uptime"], ["4.8★", "Rating"]].map(([v, l]) => (
                    <div key={l}>
                      <div className="grad-text text-[28px] font-extrabold tracking-[-1px]">{v}</div>
                      <div className="text-[11px] text-slate-700 mt-1" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════
           PRICING
      ══════════════════════════════ */}
      <section ref={pricingRef} className="max-w-300 mx-auto px-8 py-28 pt-12">
        <div className="PRICINGHEADING">
        <span className="inline-block bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-[11px] font-semibold text-indigo-400 tracking-[2px] uppercase mb-5" style={{ fontFamily: "'JetBrains Mono',monospace" }}>Pricing</span>
        <h2 className="text-[clamp(28px,4vw,54px)] font-extrabold tracking-[-2px] leading-[1.08] text-white mb-4">
          Simple, transparent<br />
          <span className="grad-text">pricing.</span>
        </h2>
        <p className="text-base text-slate-600 font-normal leading-[1.75] max-w-100">
          Start free. Scale as you grow. No hidden fees, ever.
        </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-225 md:max-w-none mx-auto PRICINGGRID">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`price-top-bar relative flex flex-col rounded-3xl p-10 transition-all duration-300 hover:-translate-y-1.5 ${
                plan.hot
                  ? "border border-indigo-500/40 overflow-hidden"
                  : "bg-white/[0.022] border border-white/[0.07] hover:border-indigo-500/25"
              }`}
              style={plan.hot ? {
                background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)",
                boxShadow: "0 0 0 1px rgba(168,85,247,0.1), 0 24px 80px rgba(99,102,241,0.15)"
              } : {}}
            >
              {plan.hot && (
                <div className="mb-5">
                  <span className="bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1 text-[11px] font-medium text-indigo-400 tracking-[1px]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className={`text-[11px] tracking-[2px] uppercase mb-2.5 font-medium ${plan.hot ? "text-indigo-400" : "text-[#33335a]"}`} style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                {plan.name}
              </div>
              <div className="flex items-end gap-1.5 mb-4">
                <span className="text-[54px] font-extrabold tracking-[-3px] text-white leading-none">{plan.price}</span>
                <span className="text-base text-slate-600 mb-1.5">/mo</span>
              </div>
              <p className="text-[14px] text-slate-600 leading-[1.7] mb-7">{plan.desc}</p>
              <div className="h-px bg-white/6 mb-7" />
              <div className="flex flex-col gap-3.5 flex-1 mb-8">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3 text-[14px] text-slate-600">
                    <div className="w-5 h-5 rounded-md bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 shrink-0">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              {plan.hot ? (
                <button className="BANNERSTART grad-bg w-full py-3.5 text-[15px] font-semibold text-white rounded-xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden" style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
                  <span className="absolute inset-0 bg-linear-to-br from-white/18 to-transparent" />
                  <span className="relative">{plan.cta}</span>
                </button>
              ) : (
                <button className="w-full py-3.5 text-[15px] font-medium text-slate-500 rounded-xl border border-white/10 hover:border-indigo-500/40 hover:text-slate-200 hover:bg-indigo-500/[0.07] bg-transparent cursor-pointer transition-all duration-200">
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
           CTA BANNER
      ══════════════════════════════ */}
      <div className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 65%)" }} />
        <div
          className="cta-top-line relative z-10 max-w-180 mx-auto text-center rounded-4xl px-14 py-20 BANNER"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(99,102,241,0.2)",
            boxShadow: "0 0 0 1px rgba(168,85,247,0.06), 0 40px 120px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)"
          }}
        >
          <h2 className="text-[clamp(28px,4.5vw,56px)] font-extrabold tracking-[-2px] leading-[1.1] text-white mb-4">
            Your next website starts<br />
            <span className="grad-text">with one sentence.</span>
          </h2>
          <p className="text-base text-slate-600 leading-[1.75] mb-11">
            Join 50,000+ builders who ship faster with ForgeAI.
          </p>
          <div ref={showCaseRef} className="flex gap-3.5 justify-center flex-wrap">
            <button className="grad-bg flex items-center gap-2 text-[15px] font-semibold text-white px-10 py-3.5 rounded-[14px] border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(99,102,241,0.45)" }}>
              <span className="absolute inset-0 bg-linear-to-br from-white/18 to-transparent" />
              <span className="relative flex items-center gap-2">
                Start Building Free
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
            </button>
            <button className="text-[15px] font-medium text-slate-500 px-8 py-3.5 rounded-[14px] border border-white/10 hover:border-indigo-500/40 hover:text-slate-200 hover:bg-indigo-500/[0.07] bg-transparent cursor-pointer transition-all duration-200">
              View Showcase
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
           FOOTER
      ══════════════════════════════ */}
      <footer className="border-t border-white/6 px-8 py-11">
        <div className="FOOTER max-w-300 mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="logo-icon relative w-8 h-8 rounded-[9px] flex items-center justify-center overflow-hidden shrink-0">
              <span className="relative z-10 text-[14px] font-bold text-white">W</span>
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">
              Forge<em className="not-italic grad-text">AI</em>
            </span>
          </div>
          <div className="flex gap-7 flex-wrap justify-center">
            {["Privacy", "Terms", "Status", "Blog", "Twitter", "GitHub"].map(l => (
              <a key={l} className="text-[13px] text-[#2a2a4a] hover:text-indigo-400 cursor-pointer transition-colors duration-200" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{l}</a>
            ))}
          </div>
          <span className="text-[12px] text-[#1e1e38]" style={{ fontFamily: "'JetBrains Mono',monospace" }}>© 2025 ForgeAI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}