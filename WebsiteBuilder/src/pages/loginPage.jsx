import { useState, useEffect } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [focused, setFocused]     = useState("");
  const [scrolled, setScrolled]   = useState(false);
  const [loginError, setLoginError] = useState("");
  const [menuOpen, setMenuOpen]   = useState(false);
  const {setUser} = useAuth();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const update = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setLoginError("");
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
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
    setLoginError("");

    try {

      const res = await api.post("/auth/logIn", {
        email: form.email,
        password: form.password
      });
      setUser(res.data.user);
      setTimeout(() => {

        setLoading(false);
        window.location.href = "/";

      }, 1800);

    } catch (err) {

      setLoading(false);

      setLoginError(
        err.response?.data?.message || "Something went wrong"
      );

    }

};

  const emailValid = form.email && /\S+@\S+\.\S+/.test(form.email);

  return (
    <div style={{ background: "#000008", height: "100vh", fontFamily: "'Sora',sans-serif", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body { height:100%; overflow:hidden; }
        ::selection { background:rgba(139,92,246,.35); color:#fff; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#000008; }
        ::-webkit-scrollbar-thumb { background:#1e1b4b; border-radius:3px; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerBg { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes orb1      { 0%,100%{transform:translate(-50%,0) scale(1)} 50%{transform:translate(-50%,-28px) scale(1.07)} }
        @keyframes orb2      { 0%,100%{transform:translate(0,0)} 55%{transform:translate(50px,-44px)} }
        @keyframes orb3      { 0%,100%{transform:translate(0,0)} 55%{transform:translate(-36px,44px)} }
        @keyframes gridPan   { from{transform:translateY(0)} to{transform:translateY(64px)} }
        @keyframes pulseDot  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes borderGlow{ 0%,100%{border-color:rgba(99,102,241,.3)} 50%{border-color:rgba(168,85,247,.65)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes checkPop  { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .05s}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .15s}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .25s}
        .a4{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .35s}
        .a5{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both .45s}

        /* Gradient text */
        .grad-text {
          background:linear-gradient(90deg,#60a5fa 0%,#818cf8 45%,#c084fc 80%,#60a5fa 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmerBg 4s linear infinite;
        }

        /* Dot grid background */
        .hero-grid {
          position:absolute; inset:0; z-index:0;
          background-image:linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px);
          background-size:64px 64px;
          animation:gridPan 14s linear infinite;
          mask-image:radial-gradient(ellipse 100% 100% at 50% 50%,black 20%,transparent 100%);
          -webkit-mask-image:radial-gradient(ellipse 100% 100% at 50% 50%,black 20%,transparent 100%);
        }

        /* Orbs */
        .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
        .o1 { width:700px;height:700px;top:-250px;left:50%;background:radial-gradient(circle,rgba(99,102,241,.17) 0%,transparent 70%);animation:orb1 14s ease-in-out infinite; }
        .o2 { width:420px;height:420px;bottom:-60px;right:-80px;background:radial-gradient(circle,rgba(168,85,247,.12) 0%,transparent 70%);animation:orb2 18s ease-in-out infinite; }
        .o3 { width:320px;height:320px;top:30%;left:-80px;background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%);animation:orb3 16s ease-in-out infinite; }

        /* ── NAVBAR ── */
        .navbar { position:fixed;top:0;left:0;right:0;z-index:200;transition:all .4s; }
        .navbar.scrolled { background:rgba(0,0,8,.92);backdrop-filter:blur(28px);border-bottom:1px solid rgba(255,255,255,.06); }
        .nav-inner { max-width:100%;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px; }
        .nav-links-desktop { display:flex;align-items:center;gap:28px; }
        .nav-link { font-size:14px;font-weight:500;color:#555;text-decoration:none;transition:color .2s;cursor:pointer; }
        .nav-link:hover { color:#e2e2f0; }

        /* Hamburger button */
        .burger { display:none;flex-direction:column;gap:5px;background:none;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px;cursor:pointer;transition:border-color .2s; }
        .burger:hover { border-color:rgba(99,102,241,.4); }
        .burger span { display:block;width:20px;height:1.5px;background:#888;border-radius:2px;transition:all .3s cubic-bezier(.22,1,.36,1); }
        .burger.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg);background:#818cf8; }
        .burger.open span:nth-child(2) { opacity:0;transform:scaleX(0); }
        .burger.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg);background:#818cf8; }

        /* Mobile dropdown menu */
        .mob-menu { display:none;position:fixed;top:64px;left:0;right:0;z-index:199;background:rgba(0,0,8,.97);backdrop-filter:blur(32px);border-bottom:1px solid rgba(255,255,255,.06);flex-direction:column;padding:16px 24px 28px;animation:slideDown .25s ease both; }
        .mob-menu.open { display:flex; }
        .mob-link { font-size:15px;font-weight:500;color:#555;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:color .2s;text-decoration:none; }
        .mob-link:hover { color:#e2e2f0; }
        .mob-link:last-of-type { border-bottom:none; }
        .mob-actions { display:flex;flex-direction:column;gap:10px;padding-top:16px; }

        /* ── LAYOUT ── */
        .page-grid { display:grid;grid-template-columns:1fr 1fr;flex:1;width:100%;height:100%;overflow:hidden; }

        /* ── RIGHT INFO PANEL ── */
        .info-panel { display:flex;flex-direction:column;justify-content:center;padding:72px 80px;border-left:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.18);overflow-y:auto; }

        /* ── FORM PANEL ── */
        .form-panel { display:flex;align-items:center;justify-content:center;padding:72px 80px;overflow-y:auto; }

        /* ── INPUT ── */
        .field-box { display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:0 16px;height:54px;transition:all .25s ease; }
        .field-box.foc  { border-color:rgba(99,102,241,.55);background:rgba(99,102,241,.04);box-shadow:0 0 0 3px rgba(99,102,241,.1); }
        .field-box.err  { border-color:rgba(248,113,113,.45); box-shadow:0 0 0 3px rgba(248,113,113,.08); }
        .field-box.ok   { border-color:rgba(74,222,128,.35); }
        .field-icon { font-size:16px;color:#252548;flex-shrink:0;transition:color .25s; }
        .field-box.foc .field-icon { color:#818cf8; }
        .field-input { flex:1;background:transparent;border:none;outline:none;font-size:15px;font-family:'Sora',sans-serif;color:#e2e2f0;caret-color:#818cf8; }
        .field-input::placeholder { color:#1e1e42; }
        .eye-btn { background:none;border:none;cursor:pointer;color:#252548;font-size:15px;padding:4px;transition:color .2s;line-height:1;flex-shrink:0; }
        .eye-btn:hover { color:#818cf8; }

        /* ── SOCIAL BUTTONS ── */
        .social-btn { flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:13px 12px;border-radius:13px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);color:#7070a0;font-size:14px;font-weight:600;font-family:'Sora',sans-serif;cursor:pointer;transition:all .2s; }
        .social-btn:hover { border-color:rgba(99,102,241,.35);background:rgba(99,102,241,.07);color:#e2e2f0;transform:translateY(-1px); }

        /* ── SUBMIT BUTTON ── */
        .submit-btn { width:100%;height:54px;border-radius:14px;border:none;color:#fff;font-size:16px;font-weight:700;font-family:'Sora',sans-serif;cursor:pointer;position:relative;overflow:hidden;transition:all .25s;letter-spacing:.2px;background:linear-gradient(135deg,#3b82f6,#6366f1,#a855f7);box-shadow:0 4px 32px rgba(99,102,241,.4); }
        .submit-btn::before { content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.18),transparent);pointer-events:none; }
        .submit-btn:not(:disabled):hover { transform:translateY(-2px);box-shadow:0 12px 48px rgba(99,102,241,.55); }
        .submit-btn:disabled { opacity:.65;cursor:not-allowed; }

        /* ── CHECKBOX ── */
        .chk { width:18px;height:18px;border-radius:5px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s; }
        .chk.on { background:linear-gradient(135deg,#6366f1,#a855f7);border-color:transparent; }
        .chk-mark { animation:checkPop .22s cubic-bezier(.22,1,.36,1) both;font-size:11px;color:#fff;line-height:1; }

        /* ── ERROR ALERT ── */
        .login-error { display:flex;align-items:center;gap:10px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:12px;padding:12px 16px;animation:slideIn .3s ease both;margin-bottom:20px; }
        .shake { animation:shake .4s cubic-bezier(.36,.07,.19,.97) both; }

        /* ── STAT CHIP ── */
        .stat-chip { display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:16px 20px;transition:all .3s; }
        .stat-chip:hover { border-color:rgba(99,102,241,.25);background:rgba(99,102,241,.05); }
        .stat-icon { width:42px;height:42px;border-radius:11px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0; }

        /* ── BADGE ── */
        .badge-anim { animation:borderGlow 3s ease-in-out infinite; }
        .dot-pulse  { animation:pulseDot 2s ease-in-out infinite;box-shadow:0 0 10px #6366f1; }
        .spinner    { width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block; }
        .div-line   { flex:1;height:1px;background:rgba(255,255,255,.06); }
        .forgot-link { font-size:13px;font-weight:600;color:#6366f1;text-decoration:none;transition:color .2s; }
        .forgot-link:hover { color:#a5b4fc; }

        /* ── LABEL ── */
        .field-label { display:block;font-size:11px;font-weight:600;color:#3a3a7a;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px;font-family:'JetBrains Mono',monospace; }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 860px) {
          .page-grid         { grid-template-columns:1fr; }
          .info-panel        { display:none !important; }
          .nav-links-desktop { display:none !important; }
          .burger            { display:flex !important; }
          .form-panel        { padding:40px 24px;align-items:flex-start;overflow-y:auto; }
        }

        @media (max-width: 480px) {
          .social-row        { flex-direction:column; }
          .social-btn        { width:100%; }
          .form-panel        { padding:24px 16px; }
        }
      `}</style>

      {/* ── BG Layers ── */}
      <div className="hero-grid" />
      <div className="orb o1" />
      <div className="orb o2" />
      <div className="orb o3" />

      {/* ════════════════════════════
           NAVBAR
      ════════════════════════════ */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-inner">

          {/* Logo */}
          <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#3b82f6,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:"#fff", boxShadow:"0 0 18px rgba(99,102,241,.5)" }}>W</div>
            <span style={{ fontSize:17, fontWeight:700, color:"#fff", letterSpacing:"-.3px" }}>
              Forge<span className="grad-text">AI</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="nav-links-desktop">
            {["Home","Features","Pricing","Showcase"].map(l => (
              <a key={l} href="#" className="nav-link">{l}</a>
            ))}
            <a href="/signup" style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:600, color:"#fff", textDecoration:"none", background:"linear-gradient(135deg,#3b82f6,#6366f1,#a855f7)", padding:"8px 20px", borderRadius:10, boxShadow:"0 4px 20px rgba(99,102,241,.35)", whiteSpace:"nowrap" }}>
              Sign up free
            </a>
          </div>

          {/* Hamburger */}
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            style={{ display:"none" }}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mob-menu open">
          {["Home","Features","Pricing","Showcase"].map(l => (
            <a key={l} href="#" className="mob-link" onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <div className="mob-actions">
            <a href="/signin" style={{ width:"100%", textAlign:"center", padding:"13px", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", color:"#888", fontSize:15, fontWeight:500, textDecoration:"none", display:"block" }}>Sign in</a>
            <a href="/signup" style={{ width:"100%", textAlign:"center", padding:"13px", borderRadius:12, background:"linear-gradient(135deg,#3b82f6,#6366f1,#a855f7)", color:"#fff", fontSize:15, fontWeight:700, textDecoration:"none", display:"block", boxShadow:"0 4px 20px rgba(99,102,241,.35)" }}>Sign up free</a>
          </div>
        </div>
      )}

      {/* ════════════════════════════
           PAGE BODY
      ════════════════════════════ */}
      <div className="page-grid" style={{ flex:1, paddingTop:64, position:"relative", zIndex:1, width:"100%" }}>

        {/* ════ LEFT — LOGIN FORM ════ */}
        <div className="form-panel">
          <div style={{ width:"100%", maxWidth:520 }}>

            {/* ── Header ── */}
            <div className="a1" style={{ marginBottom:32 }}>
              <div className="badge-anim" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(99,102,241,.1)", border:"1px solid rgba(99,102,241,.25)", borderRadius:100, padding:"5px 16px 5px 10px", marginBottom:24 }}>
                <span className="dot-pulse" style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", display:"inline-block", flexShrink:0 }} />
                <span style={{ fontSize:12, fontWeight:600, color:"#a5b4fc", fontFamily:"'JetBrains Mono',monospace", letterSpacing:".5px" }}>Welcome back</span>
              </div>
              <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:800, color:"#fff", letterSpacing:-1.8, lineHeight:1.1, marginBottom:10 }}>
                Sign in to<br /><span className="grad-text">ForgeAI.</span>
              </h1>
              <p style={{ fontSize:15, color:"#2e2e5a", lineHeight:1.65 }}>
                Continue building stunning websites from a prompt.
              </p>
            </div>

            {/* ── Social Buttons ── */}
            <div className="a2 social-row" style={{ display:"flex", gap:12, marginBottom:24 }}>
              <button className="social-btn" onClick={()=>{
                window.location.href = "http://localhost:5000/api/auth/google";
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
            </div>

            {/* ── Divider ── */}
            <div className="a2" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
              <div className="div-line" />
              <span style={{ fontSize:11, color:"#1e1e40", fontFamily:"'JetBrains Mono',monospace", whiteSpace:"nowrap", letterSpacing:".5px" }}>or continue with email</span>
              <div className="div-line" />
            </div>

            {/* ── Login Error Alert ── */}
            {loginError && (
              <div className={`login-error ${loginError ? "shake" : ""}`}>
                <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"#fca5a5", marginBottom:2 }}>Sign in failed</p>
                  <p style={{ fontSize:12, color:"#7a3030" }}>{loginError}</p>
                </div>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="a3" style={{ marginBottom:16 }}>
                <label className="field-label">Email Address</label>
                <div className={`field-box ${focused==="email" ? "foc" : ""} ${errors.email ? "err" : ""} ${!errors.email && emailValid ? "ok" : ""}`}>
                  <span className="field-icon">✉</span>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    autoComplete="email"
                  />
                  {!errors.email && emailValid && (
                    <span style={{ color:"#4ade80", fontSize:15, flexShrink:0 }}>✓</span>
                  )}
                </div>
                {errors.email && <p style={{ fontSize:12, color:"#f87171", marginTop:6 }}>⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div className="a3" style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <label className="field-label" style={{ marginBottom:0 }}>Password</label>
                  <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                </div>
                <div className={`field-box ${focused==="password" ? "foc" : ""} ${errors.password ? "err" : ""}`}>
                  <span className="field-icon">🔒</span>
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Your password"
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize:12, color:"#f87171", marginTop:6 }}>⚠ {errors.password}</p>}
              </div>

              {/* Submit */}
              <div className="a4">
                <button type="submit" className="submit-btn" disabled={loading}>
                  <span style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
                    {loading
                      ? <><span className="spinner" /> Signing in...</>
                      : <>Sign In <span style={{ fontSize:18 }}>→</span></>
                    }
                  </span>
                </button>
              </div>

              {/* Sign up link */}
              <p className="a5" style={{ textAlign:"center", marginTop:22, fontSize:14, color:"#252550" }}>
                Don't have an account?{" "}
                <a href="/signup" style={{ color:"#818cf8", fontWeight:700, textDecoration:"none" }}>Create one free →</a>
              </p>
            </form>

            {/* Demo hint */}
            <div className="a5" style={{ marginTop:28, background:"rgba(99,102,241,.06)", border:"1px solid rgba(99,102,241,.14)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
              <p style={{ fontSize:12, color:"#3a3a6a", fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6 }}>
                Demo: use <span style={{ color:"#818cf8", fontWeight:600 }}>demo@forgeai.com</span> with any password
              </p>
            </div>
          </div>
        </div>

        {/* ════ RIGHT — INFO PANEL (desktop only) ════ */}
        <div className="info-panel">

          <div className="a1" style={{ marginBottom:40 }}>
            <h2 style={{ fontSize:"clamp(24px,2.5vw,36px)", fontWeight:800, color:"#fff", letterSpacing:-1.5, lineHeight:1.15, marginBottom:14 }}>
              Everything you need<br />
              <span className="grad-text">to ship faster.</span>
            </h2>
            <p style={{ fontSize:15, color:"#2a2a52", lineHeight:1.75 }}>
              Your account gives you instant access to AI website generation, visual editing, and one-click deploy.
            </p>
          </div>

          {/* Stats */}
          <div className="a2" style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:40 }}>
            {[
              { icon:"⚡", stat:"12s",    label:"Average generation time" },
              { icon:"🌍", stat:"50K+",   label:"Sites shipped this month" },
              { icon:"★",  stat:"4.9/5",  label:"Average user rating" },
            ].map(item => (
              <div key={item.stat} className="stat-chip">
                <div className="stat-icon">{item.icon}</div>
                <div>
                  <div className="grad-text" style={{ fontSize:20, fontWeight:800, letterSpacing:-1, lineHeight:1 }}>{item.stat}</div>
                  <div style={{ fontSize:12, color:"#2a2a52", marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="a3" style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:18, padding:24, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:10, right:18, fontSize:60, color:"rgba(99,102,241,.1)", fontFamily:"Georgia,serif", lineHeight:1 }}>"</div>
            <div style={{ display:"flex", gap:2, marginBottom:12 }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ color:"#fbbf24", fontSize:13 }}>★</span>)}
            </div>
            <p style={{ fontSize:14, color:"#4a4a82", lineHeight:1.75, marginBottom:16, fontStyle:"italic", position:"relative" }}>
              "ForgeAI replaced my entire design workflow. Generated, tweaked, and deployed a client site in one afternoon."
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>SR</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#e2e2f0" }}>Sara Rizvi</div>
                <div style={{ fontSize:11, color:"#2a2a52", fontFamily:"'JetBrains Mono',monospace" }}>Freelance Designer</div>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="a4" style={{ marginTop:24, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:14, color:"#4ade80" }}>🔒</span>
            <span style={{ fontSize:12, color:"#1e1e3a", fontFamily:"'JetBrains Mono',monospace" }}>
              256-bit SSL · SOC 2 compliant · GDPR ready
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}