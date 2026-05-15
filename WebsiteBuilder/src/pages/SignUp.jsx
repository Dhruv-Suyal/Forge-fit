import { useState} from "react";
import api from "../utils/axios"
import {useNavigate} from "react-router-dom"
import { useAuth } from "../context/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const {user, setUser} = useAuth();
  
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [focused, setFocused] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const getStrength = (pwd) => {
    if (!pwd) return null;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const map = [
      null,
      { label: "Weak", color: "#f87171", w: "25%" },
      { label: "Fair", color: "#fb923c", w: "50%" },
      { label: "Good", color: "#a3e635", w: "75%" },
      { label: "Strong", color: "#4ade80", w: "100%" },
    ];
    return map[s];
  };

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.agreed = "You must agree to continue";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    try {
      const res = await api.post("/auth/signUp", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      setUser(res.data.user);
      if(user.onboardingCompleted){
        navigate("/");
      }
      else{
        navigate("/onboarding");
      }
      
    } catch (err) {
      setErrors({
        backend:
          err.response?.data?.message ||
          "Something went wrong"
      });
    } finally {
      setLoading(false);
    }

};

  const update = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  if (submitted) {
    return (
      <div style={{ background: "#000008", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
          @keyframes popIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
          .pop { animation: popIn .5s cubic-bezier(.22,1,.36,1) both; }
        `}</style>
        <div className="pop text-center px-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1,#a855f7)", boxShadow: "0 0 60px rgba(99,102,241,0.5)" }}>✓</div>
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">You're in!</h2>
          <p className="text-slate-500 mb-8">Check your email to verify your account.</p>
          <a href="/" className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1,#a855f7)" }}>Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#000008", minHeight: "100vh", fontFamily: "'Sora', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(139,92,246,0.35); color:#fff; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#000008; } ::-webkit-scrollbar-thumb { background:#1e1b4b; border-radius:3px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb1  { 0%,100%{transform:translate(-50%,0) scale(1)} 50%{transform:translate(-50%,-30px) scale(1.08)} }
        @keyframes orb2  { 0%,100%{transform:translate(0,0)} 55%{transform:translate(40px,-50px)} }
        @keyframes shimmerBg { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes gridPan { from{transform:translateY(0)} to{transform:translateY(64px)} }
        @keyframes pulseDot { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(99,102,241,.3)} 50%{border-color:rgba(168,85,247,.65)} }

        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .05s}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .15s}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .25s}
        .a4{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .35s}
        .a5{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .45s}
        .a6{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .55s}

        .grad-text {
          background: linear-gradient(90deg, #60a5fa 0%, #818cf8 45%, #c084fc 80%, #60a5fa 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmerBg 4s linear infinite;
        }
        .grad-bg { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 45%, #a855f7 100%); }

        .hero-grid {
          position:absolute; inset:0; z-index:0;
          background-image: linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px), linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px);
          background-size:64px 64px;
          animation:gridPan 14s linear infinite;
          mask-image:radial-gradient(ellipse 100% 100% at 50% 0%,black 30%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 100% 100% at 50% 0%,black 30%,transparent 100%);
        }
        .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; }
        .o1 { width:600px;height:600px;top:-200px;left:50%;background:radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%);animation:orb1 14s ease-in-out infinite; }
        .o2 { width:400px;height:400px;bottom:0;right:-100px;background:radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 70%);animation:orb2 18s ease-in-out infinite; }
        .o3 { width:300px;height:300px;bottom:20%;left:-80px;background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%); }

        /* Split layout */
        .page-grid { display:grid; grid-template-columns:1fr 1fr; min-height:100vh; }
        @media(max-width:900px){ .page-grid{grid-template-columns:1fr;} .left-panel{display:none!important;} }

        /* Left panel */
        .left-panel { position:relative; display:flex; flex-direction:column; justify-content:space-between; padding:48px; overflow:hidden; border-right:1px solid rgba(255,255,255,.06); }

        /* Form panel */
        .right-panel { position:relative; display:flex; align-items:center; justify-content:center; padding:48px 40px; z-index:1; }

        /* Input */
        .field-wrap { position:relative; }
        .field-input {
          width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
          border-radius:14px; padding:13px 44px 13px 44px; font-size:15px; font-family:'Sora',sans-serif;
          color:#e2e2f0; outline:none; transition:all .25s ease; caret-color:#818cf8;
        }
        .field-input::placeholder { color:#252548; }
        .field-input:focus { border-color:rgba(99,102,241,.55); background:rgba(99,102,241,.04); box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        .field-input.err { border-color:rgba(248,113,113,.5); }
        .field-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; color:#2d2d5a; pointer-events:none; transition:color .25s; }
        .field-input:focus ~ .field-icon-left, .field-wrap:focus-within .field-icon { color:#818cf8; }
        .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#2d2d5a; font-size:16px; padding:2px; }
        .eye-btn:hover { color:#818cf8; }

        /* Social btn */
        .social-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:9px; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.025); color:#9090c0; font-size:14px; font-weight:600; font-family:'Sora',sans-serif; cursor:pointer; transition:all .2s; text-decoration:none; }
        .social-btn:hover { border-color:rgba(99,102,241,.35); background:rgba(99,102,241,.07); color:#e2e2f0; transform:translateY(-1px); }

        /* Submit btn */
        .submit-btn { width:100%; padding:15px; border-radius:14px; border:none; color:#fff; font-size:16px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; position:relative; overflow:hidden; transition:all .25s; background:linear-gradient(135deg,#3b82f6,#6366f1,#a855f7); box-shadow:0 4px 32px rgba(99,102,241,.4); letter-spacing:.2px; }
        .submit-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.18),transparent); }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 48px rgba(99,102,241,.55); }
        .submit-btn:disabled { opacity:.65; cursor:not-allowed; }

        /* Checkbox */
        .checkbox-custom { width:20px; height:20px; border-radius:6px; border:1.5px solid rgba(255,255,255,.1); background:rgba(255,255,255,.03); cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .checkbox-custom.checked { background:linear-gradient(135deg,#6366f1,#a855f7); border-color:transparent; }

        /* Strength bar */
        .str-bar { height:3px; border-radius:2px; background:rgba(255,255,255,.06); overflow:hidden; flex:1; }
        .str-fill { height:100%; border-radius:2px; transition:width .4s ease, background .4s ease; }

        /* Feature card */
        .feat { display:flex; align-items:flex-start; gap:14px; padding:20px; border-radius:16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); transition:all .3s; }
        .feat:hover { border-color:rgba(99,102,241,.25); background:rgba(99,102,241,.05); }
        .feat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); font-size:18px; flex-shrink:0; }
        .nav-link { color:#555; font-size:14px; text-decoration:none; transition:color .2s; } .nav-link:hover{color:#e2e2f0;}

        .badge-anim { animation:borderGlow 3s ease-in-out infinite; }
        .dot-pulse { animation:pulseDot 2s ease-in-out infinite; }
        .spin { animation:spin .8s linear infinite; }

        .divider-line { flex:1; height:1px; background:rgba(255,255,255,.06); }

        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .check-pop { animation:checkPop .25s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Grid + Orbs */}
      <div className="hero-grid" />
      <div className="orb o1" />
      <div className="orb o2" />
      <div className="orb o3" />

      {/* ── Navbar ── */}
      <nav style={{ position: "fixed", top: 0, inset: "0 0 auto", zIndex: 100, borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(0,0,8,.85)", backdropFilter: "blur(24px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#3b82f6,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", boxShadow: "0 0 18px rgba(99,102,241,.5)" }}>W</div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-.3px" }}>Forge<span className="grad-text">AI</span></span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="/" className="nav-link">Home</a>
            <a href="#" className="nav-link">Features</a>
            <a href="#" className="nav-link">Pricing</a>
            <a href="/logIn" style={{ fontSize: 14, fontWeight: 600, color: "#818cf8", textDecoration: "none" }}>log In →</a>
          </div>
        </div>
      </nav>

      {/* ── Split Layout ── */}
      <div className="page-grid" style={{ paddingTop: 64 }}>

        {/* ════ LEFT PANEL — Brand / Features ════ */}
        <div className="left-panel" style={{ background: "rgba(0,0,0,.2)" }}>
          {/* Top */}
          <div>
            <div className="badge-anim a1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 100, padding: "6px 18px 6px 10px", marginBottom: 40 }}>
              <span className="dot-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 10px #6366f1", display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".5px" }}>50,000+ sites built this month</span>
            </div>

            <h1 className="a2" style={{ fontSize: "clamp(32px,3.5vw,52px)", fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.1, marginBottom: 18 }}>
              Build websites<br />
              <span className="grad-text">from a prompt.</span>
            </h1>
            <p className="a3" style={{ fontSize: 16, color: "#33335a", lineHeight: 1.75, maxWidth: 380, marginBottom: 48 }}>
              Describe your website in plain English. ForgeAI generates a fully functional, production-ready site in seconds.
            </p>

            {/* Feature list */}
            <div className="a4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: "⚡", title: "Generate in 12 seconds", desc: "Fastest AI website builder on the market" },
                { icon: "✦", title: "Export clean React + Tailwind", desc: "Production code you actually want to ship" },
                { icon: "🚀", title: "One-click deploy", desc: "Custom domain, SSL, global CDN — included" },
              ].map((f) => (
                <div key={f.title} className="feat">
                  <div className="feat-icon">{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e2f0", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "#33335a" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className="a5" style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: 24, marginTop: 40 }}>
            <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#fbbf24", fontSize: 14 }}>★</span>)}
            </div>
            <p style={{ fontSize: 14, color: "#6060a0", lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>
              "I built and shipped my entire SaaS landing page in under 20 minutes. ForgeAI is genuinely magic."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>AK</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e2f0" }}>Aryan Kumar</div>
                <div style={{ fontSize: 11, color: "#33335a", fontFamily: "'JetBrains Mono',monospace" }}>Founder @ LaunchFast</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL — Sign Up Form ════ */}
        <div className="right-panel">
          <div style={{ width: "100%", maxWidth: 460 }}>

            {/* Header */}
            <div className="a1" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: "clamp(26px,3vw,38px)", fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 10 }}>
                Create your account
              </h2>
              <p style={{ fontSize: 15, color: "#33335a", fontWeight: 400 }}>
                Free forever. No credit card required.
              </p>
            </div>

            {/* Social Buttons */}
            <div className="a2" style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button className="social-btn" onClick={()=>{
                window.location.href = "http://localhost:5000/api/auth/google";
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button>
              
            </div>

            {/* Divider */}
            <div className="a2" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <div className="divider-line" />
              <span style={{ fontSize: 12, color: "#252548", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" }}>or sign up with email</span>
              <div className="divider-line" />
            </div>

            {errors.backend && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 18, textAlign: "center" }}>⚠ {errors.backend}</p>}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Full Name */}
              <div className="a3" style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4040a0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>Full Name</label>
                <div className="field-wrap">
                  <span className="field-icon" style={{ left: 14, top: "50%", transform: "translateY(-50%)", position: "absolute", color: focused === "name" ? "#818cf8" : "#252548", transition: "color .25s" }}>👤</span>
                  <input
                    className={`field-input ${errors.name ? "err" : ""}`}
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused("")}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div className="a3" style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4040a0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>Email Address</label>
                <div className="field-wrap">
                  <span className="field-icon" style={{ left: 14, top: "50%", transform: "translateY(-50%)", position: "absolute", color: focused === "email" ? "#818cf8" : "#252548", transition: "color .25s" }}>✉</span>
                  <input
                    className={`field-input ${errors.email ? "err" : ""}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div className="a4" style={{ marginBottom: 8 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4040a0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>Password</label>
                <div className="field-wrap">
                  <span className="field-icon" style={{ left: 14, top: "50%", transform: "translateY(-50%)", position: "absolute", color: focused === "password" ? "#818cf8" : "#252548", transition: "color .25s" }}>🔒</span>
                  <input
                    className={`field-input ${errors.password ? "err" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>⚠ {errors.password}</p>}
              </div>

              {/* Password Strength */}
              {strength && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div className="str-bar">
                    <div className="str-fill" style={{ width: strength.w, background: strength.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: strength.color, fontFamily: "'JetBrains Mono',monospace", width: 46, textAlign: "right" }}>{strength.label}</span>
                </div>
              )}
              {!strength && <div style={{ marginBottom: 18 }} />}

              {/* Confirm Password */}
              <div className="a4" style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#4040a0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>Confirm Password</label>
                <div className="field-wrap">
                  <span className="field-icon" style={{ left: 14, top: "50%", transform: "translateY(-50%)", position: "absolute", color: focused === "confirm" ? "#818cf8" : "#252548", transition: "color .25s" }}>🛡</span>
                  <input
                    className={`field-input ${errors.confirm ? "err" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={e => update("confirm", e.target.value)}
                    onFocus={() => setFocused("confirm")}
                    onBlur={() => setFocused("")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.confirm && <p style={{ fontSize: 12, color: "#f87171", marginTop: 6 }}>⚠ {errors.confirm}</p>}
              </div>

              {/* Terms checkbox */}
              <div className="a5" style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setAgreed(v => !v)}>
                  <div className={`checkbox-custom ${agreed ? "checked" : ""}`}>
                    {agreed && <span className="check-pop" style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "#3a3a6a", lineHeight: 1.6, userSelect: "none" }}>
                    I agree to the{" "}
                    <a href="#" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>Terms of Service</a>
                    {" and "}
                    <a href="#" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</a>
                  </p>
                </div>
                {errors.agreed && <p style={{ fontSize: 12, color: "#f87171", marginTop: 8 }}>⚠ {errors.agreed}</p>}
              </div>

              {/* Submit */}
              <div className="a6">
                <button type="submit" className="submit-btn" disabled={loading}>
                  <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading
                      ? <><span className="spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} /> Creating account...</>
                      : <>Create Free Account <span style={{ fontSize: 18 }}>→</span></>
                    }
                  </span>
                </button>
              </div>

              {/* Sign in link */}
              <p className="a6" style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#2a2a52" }}>
                Already have an account?{" "}
                <a href="/logIn" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>Log In</a>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}