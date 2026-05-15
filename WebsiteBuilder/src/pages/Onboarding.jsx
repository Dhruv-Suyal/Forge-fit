import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/axios";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 BACKEND CONFIG — replace this one URL with your real endpoint
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = "https://your-api.com"; // ← replace with your backend base URL

// The component will POST to: `${API_BASE}/api/onboarding`
// with this JSON body:
// {
//   displayName : "Alex Chen",
//   dateOfBirth : "1998-05-14",
//   biologicalSex: "male",
//   height       : 175,          // cm
//   weight       : 72,           // kg
//   location: {
//     displayName: "Mumbai, Maharashtra, India",
//     city       : "Mumbai",
//     country    : "India",
//     lat        : 19.0760,
//     lon        : 72.8777,
//   },
//   primaryGoal  : "muscle",
// }
//
// On success your backend should respond with HTTP 200 and optional JSON:
// { "message": "Profile saved", "userId": "..." }
// On error: any non-2xx status — the UI shows the error message.
// ─────────────────────────────────────────────────────────────────────────────

// ─── STEPS ───────────────────────────────────────────────────────────────────
const STEPS = [
  { id:"name",     icon:"◈", label:"Identity",   title:"What should we call you?",      sub:"Your display name powers the HUD header and all AI greetings." },
  { id:"dob",      icon:"⟡", label:"Biometrics", title:"When were you born?",            sub:"We calculate age-adjusted VO₂ max, HRV norms and recovery baselines." },
  { id:"sex",      icon:"⊕", label:"Biology",    title:"What is your biological sex?",  sub:"Used for metabolic rate, heart-rate zones, and hormone-cycle modelling." },
  { id:"body",     icon:"⚡", label:"Body",       title:"Your height & weight",           sub:"Unlocks BMI, TDEE, pace prediction, and training-load calculations." },
  { id:"location", icon:"◎", label:"Location",   title:"Where are you based?",           sub:"Enables real-time weather, temperature, and local-time scoring in your HUD." },
  { id:"goal",     icon:"✦", label:"Goal",       title:"What's your primary goal?",     sub:"The AI weights your daily score around what you're optimising for." },
];

const GOALS = [
  { id:"fat",       label:"Fat Loss",       desc:"Burn & lean out",     icon:"🔥" },
  { id:"muscle",    label:"Muscle Gain",    desc:"Build & strengthen",  icon:"⚡" },
  { id:"endurance", label:"Endurance",      desc:"Stamina & cardio",    icon:"🏃" },
  { id:"flex",      label:"Flexibility",    desc:"Mobility & recovery", icon:"🌀" },
  { id:"health",    label:"General Health", desc:"Balanced wellness",   icon:"◎" },
  { id:"sport",     label:"Sport-Specific", desc:"Peak performance",    icon:"⟡" },
];

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const S = {
  label: { display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(0,245,212,0.5)", letterSpacing:2, marginBottom:10 },
  input: { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"13px 16px 13px 44px", color:"#e2e8f0", fontSize:15, outline:"none", fontFamily:"'Sora',sans-serif", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s" },
  inputPlain: { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"13px 16px", color:"#e2e8f0", fontSize:15, outline:"none", fontFamily:"'Sora',sans-serif", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s" },
  inputRight: { width:"100%", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"13px 44px 13px 16px", color:"#e2e8f0", fontSize:15, outline:"none", fontFamily:"'Sora',sans-serif", boxSizing:"border-box", transition:"border-color 0.2s, box-shadow 0.2s" },
  hint: { fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.18)", lineHeight:1.6, marginTop:10 },
  unit: { position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(0,245,212,0.5)", letterSpacing:1 },
  stat: { flex:1, padding:"12px 14px", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(0,245,212,0.1)", borderRadius:10 },
};

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 22) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut(""); let i = 0;
    const t = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(t); }, speed);
    return () => clearInterval(t);
  }, [text]);
  return out;
}

// ─── PARTICLE CANVAS ──────────────────────────────────────────────────────────
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.3,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,245,212,0.35)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,245,212,${0.08 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }} />;
}

// ─── LOCATION STEP (Nominatim autocomplete) ───────────────────────────────────
function LocationStep({ data, onChange }) {
  const [query, setQuery] = useState(data.location?.displayName || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const typed = useTypewriter("Real coordinates are stored for live weather & temperature in your HUD.", 22);

  // Debounced Nominatim search (free, no API key needed)
  const search = useCallback((q) => {
    clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en", "User-Agent": "ForgeFit-App/1.0" } }
        );
        const json = await res.json();
        setSuggestions(json);
        setOpen(json.length > 0);
      } catch { setSuggestions([]); setOpen(false); }
      finally { setLoading(false); }
    }, 380);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange("location", null); // clear saved location while typing
    search(v);
  };

  const pickSuggestion = (place) => {
    const city   = place.address?.city || place.address?.town || place.address?.village || place.address?.county || place.name;
    const country = place.address?.country || "";
    const displayName = [city, place.address?.state, country].filter(Boolean).join(", ");
    const loc = { displayName, city, country, lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    setQuery(displayName);
    onChange("location", loc);
    setSuggestions([]); setOpen(false);
  };

  // GPS auto-detect
  const detectGPS = () => {
    if (!navigator.geolocation) { setGpsError("Geolocation not supported by your browser."); return; }
    setGpsLoading(true); setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en", "User-Agent": "ForgeFit-App/1.0" } }
          );
          const place = await res.json();
          const city = place.address?.city || place.address?.town || place.address?.village || place.address?.county || "Unknown";
          const country = place.address?.country || "";
          const displayName = [city, place.address?.state, country].filter(Boolean).join(", ");
          const loc = { displayName, city, country, lat: coords.latitude, lon: coords.longitude };
          setQuery(displayName);
          onChange("location", loc);
        } catch { setGpsError("Could not reverse-geocode your position."); }
        finally { setGpsLoading(false); }
      },
      (err) => { setGpsError("Location access denied. Please search manually."); setGpsLoading(false); }
    );
  };

  return (
    <div>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(0,245,212,0.55)", letterSpacing:1, marginBottom:26, minHeight:34, lineHeight:1.7 }}>
        {typed}<span style={{ animation:"blink 1s step-end infinite", color:"#00f5d4" }}>▋</span>
      </p>

      <label style={S.label}>Search your city or region</label>

      {/* Search input + GPS button row */}
      <div style={{ display:"flex", gap:8, marginBottom:0 }}>
        <div style={{ position:"relative", flex:1 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(0,245,212,0.4)", fontSize:16, pointerEvents:"none" }}>◎</span>
          <input
            type="text"
            placeholder="e.g. Mumbai, Tokyo, London…"
            value={query}
            onChange={handleInput}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            autoComplete="off"
            style={{ ...S.input, borderRadius: open ? "12px 12px 0 0" : 12 }}
          />
          {loading && (
            <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(0,245,212,0.4)", animation:"blink 0.8s step-end infinite" }}>…</span>
          )}
        </div>

        {/* GPS detect button */}
        <button
          onClick={detectGPS}
          disabled={gpsLoading}
          title="Use my current location"
          style={{
            flexShrink:0, width:48, height:48, borderRadius:12, border:"1px solid rgba(0,245,212,0.2)",
            background:"rgba(0,245,212,0.06)", cursor:gpsLoading?"wait":"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            boxShadow: gpsLoading ? "0 0 16px rgba(0,245,212,0.25)" : "none",
            transition:"all 0.2s",
          }}
        >
          {gpsLoading ? <span style={{ animation:"spinSlow 1s linear infinite", display:"inline-block" }}>⟳</span> : "📍"}
        </button>
      </div>

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div style={{
          background:"rgba(0,0,20,0.97)", border:"1px solid rgba(0,245,212,0.18)",
          borderTop:"none", borderRadius:"0 0 12px 12px",
          overflow:"hidden", zIndex:50, position:"relative",
          boxShadow:"0 16px 40px rgba(0,0,0,0.7)",
        }}>
          {suggestions.map((place, i) => {
            const city = place.address?.city || place.address?.town || place.address?.village || place.name;
            const region = [place.address?.state, place.address?.country].filter(Boolean).join(", ");
            const typeLabel = place.type ? place.type.replace(/_/g, " ") : place.class;
            return (
              <button
                key={place.place_id}
                onMouseDown={() => pickSuggestion(place)}
                style={{
                  width:"100%", textAlign:"left", padding:"11px 16px",
                  background:"transparent", border:"none",
                  borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:12,
                  transition:"background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,245,212,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize:15, flexShrink:0, opacity:0.6 }}>◎</span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{city}</span>
                  <span style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{region}</span>
                </span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(0,245,212,0.35)", flexShrink:0, letterSpacing:1 }}>{typeLabel}</span>
              </button>
            );
          })}
          <div style={{ padding:"7px 16px", background:"rgba(0,0,0,0.3)", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.15)", letterSpacing:1 }}>© OpenStreetMap contributors · Nominatim</span>
          </div>
        </div>
      )}

      {/* GPS error */}
      {gpsError && (
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#ef4444", marginTop:10, lineHeight:1.5 }}>⚠ {gpsError}</p>
      )}

      {/* Confirmed location tile */}
      {data.location?.lat && (
        <div style={{ marginTop:14, padding:"13px 16px", background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.18)", borderRadius:12, display:"flex", gap:14 }}>
          <span style={{ fontSize:20, marginTop:2 }}>✅</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:4 }}>{data.location.displayName}</div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"rgba(0,245,212,0.55)", letterSpacing:1 }}>
              LAT {data.location.lat.toFixed(4)} · LON {data.location.lon.toFixed(4)}
            </div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.2)", marginTop:4, letterSpacing:0.5 }}>
              Stored for live weather & temp in your HUD
            </div>
          </div>
        </div>
      )}

      <p style={{ ...S.hint, marginTop:12 }}>Coordinates are stored securely and never shared. Used only for your ForgeFit HUD weather widget.</p>
    </div>
  );
}

// ─── STEP CONTENT ─────────────────────────────────────────────────────────────
function StepContent({ step, data, onChange }) {
  const typed = useTypewriter(step.sub, 22);

  if (step.id === "location") return <LocationStep data={data} onChange={onChange} />;

  return (
    <div style={{ animation:"slideIn 0.42s cubic-bezier(.22,1,.36,1)" }}>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(0,245,212,0.55)", letterSpacing:1, marginBottom:26, minHeight:34, lineHeight:1.7 }}>
        {typed}<span style={{ animation:"blink 1s step-end infinite", color:"#00f5d4" }}>▋</span>
      </p>

      {/* NAME */}
      {step.id === "name" && (
        <div>
          <label style={S.label}>Display name</label>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"rgba(0,245,212,0.4)", fontSize:16 }}>◈</span>
            <input autoFocus type="text" placeholder="e.g. Alex Chen" value={data.name || ""} onChange={e => onChange("name", e.target.value)} style={S.input} />
          </div>
          <p style={S.hint}>Appears in the HUD header and all AI messages.</p>
          {(data.name || "").trim().length > 1 && (
            <div style={{ marginTop:20, padding:"14px 18px", background:"rgba(0,245,212,0.04)", border:"1px solid rgba(0,245,212,0.15)", borderRadius:12 }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(0,245,212,0.4)", letterSpacing:2 }}>HUD PREVIEW</span>
              <p style={{ marginTop:8, fontSize:14, color:"rgba(255,255,255,0.6)" }}>
                Welcome back, <strong style={{ color:"#00f5d4", textShadow:"0 0 10px rgba(0,245,212,0.5)" }}>{data.name}</strong>. Neural sync complete.
              </p>
            </div>
          )}
        </div>
      )}

      {/* DOB */}
      {step.id === "dob" && (
        <div>
          <label style={S.label}>Date of birth</label>
          <input type="date" value={data.dob || ""} onChange={e => onChange("dob", e.target.value)} max={new Date().toISOString().split("T")[0]} style={{ ...S.inputPlain, colorScheme:"dark" }} />
          {data.dob && (() => {
            const age = Math.floor((Date.now() - new Date(data.dob)) / (365.25 * 24 * 3600 * 1000));
            const z2lo = Math.round((220 - age) * 0.60), z2hi = Math.round((220 - age) * 0.70);
            const hrv = age < 30 ? "70–90 ms" : age < 45 ? "55–75 ms" : "40–60 ms";
            return (
              <div style={{ display:"flex", gap:10, marginTop:18 }}>
                {[["Age",`${age} yrs`,"#00f5d4"],["HRV Norm",hrv,"#7c3aed"],["Zone 2 HR",`${z2lo}–${z2hi} bpm`,"#0ea5e9"]].map(([l,v,c]) => (
                  <div key={l} style={S.stat}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(0,245,212,0.5)", letterSpacing:2, marginBottom:6 }}>{l}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:c, textShadow:`0 0 10px ${c}66` }}>{v}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* SEX */}
      {step.id === "sex" && (
        <div>
          <label style={S.label}>Biological sex</label>
          <div style={{ display:"flex", gap:12, marginBottom:20 }}>
            {[["male","♂","Male"],["female","♀","Female"],["other","⊕","Prefer not to say"]].map(([val,sym,lbl]) => (
              <button key={val} onClick={() => onChange("sex", val)} style={{
                flex:1, padding:"20px 10px", borderRadius:14, cursor:"pointer",
                border: data.sex === val ? "1.5px solid rgba(0,245,212,0.6)" : "1px solid rgba(255,255,255,0.08)",
                background: data.sex === val ? "rgba(0,245,212,0.07)" : "rgba(255,255,255,0.02)",
                boxShadow: data.sex === val ? "0 0 24px rgba(0,245,212,0.14)" : "none",
                transition:"all 0.25s", display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:26, color: data.sex===val?"#00f5d4":"rgba(255,255,255,0.2)", textShadow:data.sex===val?"0 0 14px rgba(0,245,212,0.7)":"none", transition:"all 0.25s" }}>{sym}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:1, color:data.sex===val?"rgba(0,245,212,0.8)":"rgba(255,255,255,0.25)" }}>{lbl}</span>
              </button>
            ))}
          </div>
          <p style={S.hint}>Used for metabolic rate & hormone-cycle tracking. Never shared externally.</p>
        </div>
      )}

      {/* BODY */}
      {step.id === "body" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
            {[["height","Height","175","100","250","cm"],["weight","Weight","72","30","300","kg"]].map(([key,lbl,ph,mn,mx,unit]) => (
              <div key={key}>
                <label style={S.label}>{lbl}</label>
                <div style={{ position:"relative" }}>
                  <input type="number" placeholder={ph} min={mn} max={mx} value={data[key] || ""} onChange={e => onChange(key, e.target.value)} style={S.inputRight} />
                  <span style={S.unit}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
          {data.height && data.weight && (() => {
            const h = parseFloat(data.height)/100, w = parseFloat(data.weight);
            if (!h||!w) return null;
            const bmi = (w/(h*h)).toFixed(1);
            const [cat,cc] = bmi<18.5?["Underweight","#0ea5e9"]:bmi<25?["Healthy","#00f5d4"]:bmi<30?["Overweight","#f59e0b"]:["Obese","#ef4444"];
            const tdee = Math.round(w*24*1.55);
            return (
              <div style={{ display:"flex", gap:10 }}>
                {[["BMI",bmi,cc],["Category",cat,cc],["Est. TDEE",`${tdee} kcal`,"#7c3aed"]].map(([l,v,c]) => (
                  <div key={l} style={S.stat}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:"rgba(0,245,212,0.5)", letterSpacing:2, marginBottom:6 }}>{l}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:c, textShadow:`0 0 10px ${c}55` }}>{v}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* GOAL */}
      {step.id === "goal" && (
        <div>
          <label style={S.label}>Select one</label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => onChange("goal", g.id)} style={{
                padding:"15px 16px", borderRadius:14, cursor:"pointer", textAlign:"left",
                border: data.goal===g.id?"1.5px solid rgba(0,245,212,0.6)":"1px solid rgba(255,255,255,0.07)",
                background: data.goal===g.id?"rgba(0,245,212,0.07)":"rgba(255,255,255,0.02)",
                boxShadow: data.goal===g.id?"0 0 24px rgba(0,245,212,0.12)":"none",
                transition:"all 0.22s", display:"flex", alignItems:"center", gap:12,
              }}>
                <span style={{ fontSize:22, filter:data.goal===g.id?"drop-shadow(0 0 6px rgba(0,245,212,0.5))":"grayscale(1) opacity(0.35)", transition:"filter 0.22s" }}>{g.icon}</span>
                <span>
                  <span style={{ display:"block", fontSize:13, fontWeight:600, color:data.goal===g.id?"#e2e8f0":"rgba(255,255,255,0.35)", marginBottom:2 }}>{g.label}</span>
                  <span style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:data.goal===g.id?"rgba(0,245,212,0.6)":"rgba(255,255,255,0.18)" }}>{g.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SUCCESS SCREEN ────────────────────────────────────────────────────────────
function SuccessScreen({ data }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  const goalLabel = { fat:"Fat Loss",muscle:"Muscle Gain",endurance:"Endurance",flex:"Flexibility",health:"General Health",sport:"Sport-Specific" }[data.goal] || "—";

  return (
    <div style={{ minHeight:"100vh", background:"#00000a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", color:"#e2e8f0", position:"relative", overflow:"hidden" }}>
      <Particles />
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,245,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.03) 1px,transparent 1px)",backgroundSize:"48px 48px" }} />

      <div style={{ position:"relative",zIndex:5,textAlign:"center",maxWidth:480,padding:"0 24px",opacity:visible?1:0,transform:visible?"none":"translateY(30px)",transition:"all 0.8s cubic-bezier(.22,1,.36,1)" }}>
        <div style={{ position:"relative",width:112,height:112,margin:"0 auto 28px" }}>
          <svg width={112} height={112} style={{ animation:"spinSlow 10s linear infinite" }}>
            <circle cx={56} cy={56} r={50} fill="none" stroke="rgba(0,245,212,0.15)" strokeWidth={1} strokeDasharray="4 8" />
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:76,height:76,borderRadius:"50%",background:"rgba(0,245,212,0.07)",border:"1.5px solid rgba(0,245,212,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,boxShadow:"0 0 40px rgba(0,245,212,0.25)" }}>⚡</div>
          </div>
        </div>

        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(0,245,212,0.5)",letterSpacing:3,marginBottom:12 }}>NEURAL SYNC COMPLETE</div>
        <h1 style={{ fontSize:30,fontWeight:800,letterSpacing:-1,marginBottom:8 }}>
          Welcome, <span style={{ background:"linear-gradient(90deg,#00f5d4,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>{data.name}</span>
        </h1>
        <p style={{ fontSize:13,color:"rgba(255,255,255,0.38)",lineHeight:1.9,marginBottom:28 }}>
          Your HUD is calibrated. AI is now tracking:<br />
          <strong style={{ color:"#00f5d4" }}>{goalLabel}</strong>
        </p>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:28 }}>
          {[
            ["Location", data.location?.city || "—"],
            ["Coords", data.location?.lat ? `${data.location.lat.toFixed(2)}, ${data.location.lon.toFixed(2)}` : "—"],
            ["Goal", goalLabel],
            ["DOB", data.dob ? new Date(data.dob).getFullYear() : "—"],
            ["Sex", data.sex ? data.sex[0].toUpperCase()+data.sex.slice(1) : "—"],
            ["Body", data.height && data.weight ? `${data.height}cm·${data.weight}kg` : "—"],
          ].map(([l,v]) => (
            <div key={l} style={{ padding:"11px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(0,245,212,0.1)",borderRadius:10 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(0,245,212,0.4)",letterSpacing:2,marginBottom:5 }}>{l}</div>
              <div style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)" }}>{v}</div>
            </div>
          ))}
        </div>

        <button onClick={()=>{
          window.location.href = "/"
        }} style={{ width:"100%",padding:"15px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00f5d4,#7c3aed)",color:"#000",fontSize:15,fontWeight:700,boxShadow:"0 4px 32px rgba(0,245,212,0.4)",position:"relative",overflow:"hidden" }}>
          <span style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.18),transparent)" }} />
          <span style={{ position:"relative" }}>Open Your HUD →</span>
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function Onboarding() {
  const [step, setStep]     = useState(0);
  const [data, setData]     = useState({});
  const [done, setDone]     = useState(false);
  const [submitting, setSub] = useState(false);
  const [apiError, setApiError] = useState("");

  const onChange = (key, val) => setData(d => ({ ...d, [key]: val }));

  const canAdvance = () => {
    const id = STEPS[step].id;
    if (id==="name")     return (data.name||"").trim().length > 1;
    if (id==="dob")      return !!data.dob;
    if (id==="sex")      return !!data.sex;
    if (id==="body")     return !!(data.height && data.weight);
    if (id==="location") return !!(data.location?.lat);  // must pick from dropdown / GPS
    if (id==="goal")     return !!data.goal;
    return false;
  };

 const submitToBackend = async () => {

  setSub(true);
  setApiError("");

  const payload = {

    displayName: data.name.trim(),

    dateOfBirth: data.dob,

    biologicalSex: data.sex,

    height: parseFloat(data.height),

    weight: parseFloat(data.weight),

    location: {
      displayName: data.location.displayName,
      city: data.location.city,
      country: data.location.country,
      lat: data.location.lat,
      lon: data.location.lon,
    },

    primaryGoal: data.goal,
  };

  try {

    const res = await api.post(
      "/auth/onboarding",
      payload
    );

    console.log(res.data);

    setDone(true);

  } catch (err) {

    setApiError(
      err.response?.data?.message ||
      err.message ||
      "Network error"
    );

  } finally {

    setSub(false);

  }
};

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submitToBackend();          // last step → POST
  };

  const progress = ((step + (canAdvance() ? 1 : 0)) / STEPS.length) * 100;

  if (done) return <SuccessScreen data={data} />;

  return (
    <div style={{ minHeight:"100vh", background:"#00000a", color:"#e2e8f0", fontFamily:"'Sora',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes slideIn{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes spinSlowR{to{transform:rotate(-360deg)}}
        @keyframes scanMove{0%{top:-2px}100%{top:100%}}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
        input:focus{border-color:rgba(0,245,212,0.4)!important;box-shadow:0 0 0 3px rgba(0,245,212,0.06)!important;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5) sepia(1) hue-rotate(120deg);}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(0,245,212,0.2);border-radius:99px;}
      `}</style>

      <Particles />

      {/* Grid overlay */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:"linear-gradient(rgba(0,245,212,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.03) 1px,transparent 1px)",backgroundSize:"48px 48px" }} />

      {/* Scan line */}
      <div style={{ position:"fixed",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.05),transparent)",pointerEvents:"none",zIndex:1,animation:"scanMove 6s linear infinite" }} />

      {/* HUD corner brackets */}
      {[[0,0,"top","left"],[0,1,"top","right"],[1,0,"bottom","left"],[1,1,"bottom","right"]].map(([tr,lr,ts,ls],i)=>(
        <div key={i} style={{ position:"fixed",[ts]:20,[ls]:20,width:28,height:28,
          borderTop:tr===0?"1.5px solid rgba(0,245,212,0.3)":"none",
          borderBottom:tr===1?"1.5px solid rgba(0,245,212,0.3)":"none",
          borderLeft:lr===0?"1.5px solid rgba(0,245,212,0.3)":"none",
          borderRight:lr===1?"1.5px solid rgba(0,245,212,0.3)":"none",
          pointerEvents:"none",zIndex:2 }} />
      ))}

      {/* Logo bar */}
      <div style={{ position:"fixed",top:0,left:0,right:0,height:56,background:"rgba(0,0,15,0.7)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,245,212,0.08)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#00f5d4,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,boxShadow:"0 0 14px rgba(0,245,212,0.35)" }}>⚡</div>
          <span style={{ fontWeight:800,fontSize:15,letterSpacing:-0.5 }}>
            Forge<em style={{ fontStyle:"normal",background:"linear-gradient(90deg,#00f5d4,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Fit</em>
          </span>
        </div>
      </div>

      {/* Card */}
      <div style={{
        position:"relative",zIndex:5,width:"100%",maxWidth:540,
        margin:"68px 16px 16px",padding:"32px 36px 28px",
        background:"rgba(255,255,255,0.022)",
        border:"1px solid rgba(0,245,212,0.12)",
        borderRadius:24,backdropFilter:"blur(24px)",
        boxShadow:"0 40px 120px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        {/* Top shimmer */}
        <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:1,background:"linear-gradient(90deg,transparent,rgba(0,245,212,0.5),transparent)" }} />

        {/* Progress segments */}
        <div style={{ display:"flex",gap:6,marginBottom:26 }}>
          {STEPS.map((s,i) => (
            <button key={s.id} onClick={() => i < step && setStep(i)} style={{
              flex:1,height:3,borderRadius:99,border:"none",
              cursor:i<step?"pointer":"default",
              background:i<step?"#00f5d4":i===step?"rgba(0,245,212,0.4)":"rgba(255,255,255,0.06)",
              boxShadow:i<=step?"0 0 8px rgba(0,245,212,0.4)":"none",
              transition:"all 0.4s ease",
            }} />
          ))}
        </div>

        {/* Step badge */}
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
          <div style={{ width:30,height:30,borderRadius:8,background:"rgba(0,245,212,0.08)",border:"1px solid rgba(0,245,212,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#00f5d4",textShadow:"0 0 10px rgba(0,245,212,0.6)" }}>
            {STEPS[step].icon}
          </div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(0,245,212,0.4)",letterSpacing:3 }}>
            STEP {step+1}/{STEPS.length} — {STEPS[step].label.toUpperCase()}
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize:24,fontWeight:800,color:"#fff",letterSpacing:-0.7,lineHeight:1.2,animation:"slideIn 0.38s ease" }}>
          {STEPS[step].title}
        </h1>

        {/* Content */}
        <div key={step} style={{ marginTop:18 }}>
          <StepContent step={STEPS[step]} data={data} onChange={onChange} />
        </div>

        {/* API error */}
        {apiError && (
          <div style={{ marginTop:14,padding:"11px 16px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#f87171" }}>⚠ {apiError}</span>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display:"flex",gap:10,marginTop:24 }}>
          {step > 0 && (
            <button onClick={() => { setStep(s=>s-1); setApiError(""); }} disabled={submitting} style={{ padding:"13px 20px",borderRadius:12,cursor:"pointer",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.3)",fontSize:13,fontFamily:"'Sora',sans-serif",flexShrink:0 }}>
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || submitting}
            style={{
              flex:1,padding:"14px",borderRadius:12,border:"none",
              cursor:canAdvance()&&!submitting?"pointer":"not-allowed",
              background:canAdvance()&&!submitting?"linear-gradient(135deg,#00f5d4,#7c3aed)":"rgba(255,255,255,0.04)",
              color:canAdvance()&&!submitting?"#000":"rgba(255,255,255,0.15)",
              fontSize:15,fontWeight:700,fontFamily:"'Sora',sans-serif",
              boxShadow:canAdvance()&&!submitting?"0 4px 28px rgba(0,245,212,0.35)":"none",
              transition:"all 0.3s ease",position:"relative",overflow:"hidden",
            }}
          >
            {(canAdvance()&&!submitting) && <span style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.18),transparent)" }} />}
            <span style={{ position:"relative" }}>
              {submitting ? "Syncing…" : step === STEPS.length-1 ? "Launch HUD →" : "Continue →"}
            </span>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop:18,height:2,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#00f5d4,#7c3aed)",borderRadius:99,boxShadow:"0 0 8px rgba(0,245,212,0.5)",transition:"width 0.5s cubic-bezier(.22,1,.36,1)" }} />
        </div>
        <p style={{ textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.14)",marginTop:6,letterSpacing:1 }}>{Math.round(progress)}% COMPLETE</p>
      </div>

      {/* Ambient orbital ring */}
      <div style={{ position:"fixed",right:-200,bottom:-200,width:520,height:520,borderRadius:"50%",border:"1px solid rgba(0,245,212,0.05)",pointerEvents:"none",zIndex:0,animation:"spinSlow 35s linear infinite" }}>
        <div style={{ position:"absolute",inset:70,borderRadius:"50%",border:"1px solid rgba(124,58,237,0.06)",animation:"spinSlowR 22s linear infinite" }} />
      </div>
    </div>
  );
}