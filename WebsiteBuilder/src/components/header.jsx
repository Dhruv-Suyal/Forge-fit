import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProfileEditModal } from "./ProfileEditModal";
import api from "../utils/axios";

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Today's Diet",    path: "/diet",     icon: "◈" },
  { label: "Exercise Plan",   path: "/exercise",  icon: "⚡" },
  { label: "My Health",       path: "/health",    icon: "◎" },
];

// ─── USER AVATAR ──────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || "User"}
        style={{
          width: size, height: size, borderRadius: "50%",
          border: "1.5px solid rgba(0,245,212,0.35)",
          boxShadow: "0 0 12px rgba(0,245,212,0.25)",
          objectFit: "cover", display: "block",
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#00f5d4 0%,#7c3aed 100%)",
      border: "1.5px solid rgba(0,245,212,0.35)",
      boxShadow: "0 0 12px rgba(0,245,212,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: "#000",
      fontFamily: "'Sora',sans-serif", userSelect: "none", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
export function Header() {
  const { user, setUser } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [todayScore,    setTodayScore]    = useState(0);
  const profileRef = useRef(null);

  // ── fetch today's score ──
  useEffect(() => {
    if (user) {
      api.get("/auth/score/today")
        .then(res => setTodayScore(res.data.score || 0))
        .catch(() => setTodayScore(0));
    }
  }, [user]);

  // ── scroll detection ──
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── close desktop dropdown on outside click ──
  useEffect(() => {
    const fn = e => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── close mobile menu on route change ──
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  // ── close mobile menu on desktop resize ──
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  async function handleLogout() {
    setProfileOpen(false); 
    setMobileOpen(false);
    try { 
      await api.get("/auth/logout"); 
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  }

  const isActive = path => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .ffit-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 64px;
          display: flex; align-items: center;
          transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
          font-family: 'Sora', sans-serif;
        }
        .ffit-header.scrolled {
          background: rgba(0,0,14,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(0,245,212,0.1);
        }
        .ffit-header.top {
          background: linear-gradient(180deg, rgba(0,0,14,0.7) 0%, transparent 100%);
        }

        /* inner layout */
        .ffit-inner {
          width: 100%; max-width: 1280px; margin: 0 auto;
          padding: 0 20px;
          display: flex; align-items: center; gap: 12px;
        }

        /* LOGO */
        .ffit-logo {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; flex-shrink: 0; text-decoration: none;
        }
        .ffit-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg,#00f5d4,#7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; box-shadow: 0 0 14px rgba(0,245,212,0.4);
          flex-shrink: 0;
        }
        .ffit-logo-text {
          font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.4px;
          white-space: nowrap;
        }
        .ffit-logo-text em {
          font-style: normal;
          background: linear-gradient(90deg,#00f5d4,#7c3aed);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* DESKTOP NAV */
        .ffit-nav {
          display: flex; align-items: center; gap: 2px;
          flex: 1;
          margin-left: 28px;
        }
        @media (max-width: 767px) { .ffit-nav { display: none; } }

        .ffit-nav-link {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.38);
          cursor: pointer; border: none; background: transparent;
          transition: color 0.18s, background 0.18s;
          white-space: nowrap; position: relative; text-decoration: none;
          font-family: 'Sora', sans-serif;
        }
        .ffit-nav-link:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.05);
        }
        .ffit-nav-link.active {
          color: #00f5d4;
          background: rgba(0,245,212,0.07);
        }
        .ffit-nav-link.active::after {
          content: '';
          position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2px; border-radius: 99px;
          background: #00f5d4; box-shadow: 0 0 8px rgba(0,245,212,0.6);
        }
        .ffit-nav-icon {
          font-size: 13px; opacity: 0.6;
        }
        .ffit-nav-link.active .ffit-nav-icon { opacity: 1; }

        /* RIGHT SECTION */
        .ffit-right {
          display: flex; align-items: center; gap: 10px; margin-left: auto;
        }

        /* PROFILE BUTTON */
        .ffit-profile-btn {
          display: flex; align-items: center; gap: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px; padding: 4px 12px 4px 4px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
        }
        .ffit-profile-btn:hover {
          border-color: rgba(0,245,212,0.3);
          background: rgba(0,245,212,0.04);
        }
        .ffit-profile-name {
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.75);
          max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .ffit-chevron {
          font-size: 9px; color: rgba(0,245,212,0.5);
          transition: transform 0.2s;
          font-family: 'JetBrains Mono', monospace;
        }
        .ffit-chevron.open { transform: rotate(180deg); }

        /* DROPDOWN */
        .ffit-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          min-width: 220px;
          background: rgba(0,0,18,0.97);
          border: 1px solid rgba(0,245,212,0.15);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,245,212,0.05);
          backdrop-filter: blur(24px);
          transform-origin: top right;
          transition: opacity 0.18s, transform 0.18s, visibility 0.18s;
        }
        .ffit-dropdown.open  { opacity: 1; transform: scale(1) translateY(0); visibility: visible; }
        .ffit-dropdown.closed { opacity: 0; transform: scale(0.95) translateY(-6px); visibility: hidden; }

        .ffit-dd-header {
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 11px;
        }
        .ffit-dd-name  { font-size: 13px; font-weight: 700; color: #e2e8f0; }
        .ffit-dd-email { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

        .ffit-dd-body { padding: 6px; }

        .ffit-dd-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px; border: none;
          background: transparent; cursor: pointer; text-align: left;
          font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.5); transition: color 0.15s, background 0.15s;
        }
        .ffit-dd-item:hover { color: #e2e8f0; background: rgba(0,245,212,0.07); }
        .ffit-dd-item.danger { color: rgba(239,68,68,0.7); }
        .ffit-dd-item.danger:hover { color: #f87171; background: rgba(239,68,68,0.08); }
        .ffit-dd-sep { height: 1px; background: rgba(255,255,255,0.05); margin: 4px 6px; }
        .ffit-dd-icon { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; }

        /* AUTH BUTTONS */
        .ffit-btn-ghost {
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.08);
          background: transparent; cursor: pointer; font-family: 'Sora', sans-serif;
          transition: color 0.2s, border-color 0.2s;
        }
        .ffit-btn-ghost:hover { color: #e2e8f0; border-color: rgba(0,245,212,0.3); }

        .ffit-btn-primary {
          padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
          color: #000; border: none; cursor: pointer; font-family: 'Sora', sans-serif;
          background: linear-gradient(135deg,#00f5d4,#7c3aed);
          box-shadow: 0 4px 20px rgba(0,245,212,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ffit-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,245,212,0.4); }

        /* HAMBURGER */
        .ffit-hamburger {
          display: none;
          flex-direction: column; gap: 5px;
          padding: 8px; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; background: transparent; cursor: pointer;
          transition: border-color 0.2s;
        }
        .ffit-hamburger:hover { border-color: rgba(0,245,212,0.3); }
        @media (max-width: 767px) { .ffit-hamburger { display: flex; } }

        .ffit-bar {
          display: block; width: 20px; height: 1.5px;
          background: rgba(255,255,255,0.45); border-radius: 99px;
          transition: transform 0.28s, opacity 0.28s, background 0.28s;
        }
        .ffit-bar1.open { transform: translateY(6.5px) rotate(45deg); background: #00f5d4; }
        .ffit-bar2.open { opacity: 0; transform: scaleX(0); }
        .ffit-bar3.open { transform: translateY(-6.5px) rotate(-45deg); background: #00f5d4; }

        /* MOBILE MENU */
        .ffit-mobile {
          position: fixed; left: 0; right: 0; top: 64px; z-index: 99;
          background: rgba(0,0,14,0.97);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(0,245,212,0.1);
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(.22,1,.36,1), opacity 0.25s;
        }
        .ffit-mobile.open   { max-height: 600px; opacity: 1; pointer-events: auto; }
        .ffit-mobile.closed { max-height: 0;     opacity: 0; pointer-events: none; }

        .ffit-mobile-inner { padding: 12px 20px 24px; }

        /* mobile user row */
        .ffit-mob-user {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 8px;
        }
        .ffit-mob-user-info {}
        .ffit-mob-name  { font-size: 15px; font-weight: 700; color: #e2e8f0; }
        .ffit-mob-email { font-size: 11px; color: rgba(255,255,255,0.3); font-family:'JetBrains Mono',monospace; margin-top:2px; }

        /* mobile nav links */
        .ffit-mob-link {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.4);
          cursor: pointer; transition: color 0.18s; text-decoration: none;
          font-family: 'Sora', sans-serif;
        }
        .ffit-mob-link:last-child { border-bottom: none; }
        .ffit-mob-link:hover { color: rgba(255,255,255,0.85); }
        .ffit-mob-link.active { color: #00f5d4; }
        .ffit-mob-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0; transition: background 0.18s, border-color 0.18s;
        }
        .ffit-mob-link.active .ffit-mob-icon {
          background: rgba(0,245,212,0.1); border-color: rgba(0,245,212,0.25);
        }

        /* mobile account actions */
        .ffit-mob-actions { padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
        .ffit-mob-action {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          font-size: 14px; font-weight: 600; cursor: pointer; border: none;
          background: rgba(255,255,255,0.03); transition: background 0.18s, color 0.18s;
          font-family: 'Sora', sans-serif; color: rgba(255,255,255,0.45); text-align:left; width:100%;
        }
        .ffit-mob-action:hover { background: rgba(0,245,212,0.06); color: #e2e8f0; }
        .ffit-mob-action.danger { color: rgba(239,68,68,0.65); }
        .ffit-mob-action.danger:hover { background: rgba(239,68,68,0.08); color: #f87171; }

        /* mobile auth */
        .ffit-mob-auth { display: flex; flex-direction:column; gap:10px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06); margin-top:4px; }
        .ffit-mob-auth-ghost { width:100%; padding:13px; border-radius:12px; font-size:14px; font-weight:600; background:transparent; border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.45); cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.2s; }
        .ffit-mob-auth-ghost:hover { color:#e2e8f0; border-color:rgba(0,245,212,0.3); }
        .ffit-mob-auth-primary { width:100%; padding:13px; border-radius:12px; font-size:14px; font-weight:700; background:linear-gradient(135deg,#00f5d4,#7c3aed); color:#000; border:none; cursor:pointer; font-family:'Sora',sans-serif; box-shadow:0 4px 20px rgba(0,245,212,0.25); }

        /* score chip */
        .ffit-score-chip {
          display: flex; align-items: center; gap: 7px;
          background: rgba(0,245,212,0.06);
          border: 1px solid rgba(0,245,212,0.18);
          border-radius: 99px; padding: 5px 13px;
          flex-shrink: 0;
        }
        .ffit-score-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #00f5d4; box-shadow: 0 0 8px #00f5d4;
          animation: ffit-pulse 1.8s ease-in-out infinite;
        }
        .ffit-score-label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: rgba(0,245,212,0.5); letter-spacing: 1.5px;
        }
        .ffit-score-val {
          font-family: 'JetBrains Mono', monospace; font-size: 16px;
          font-weight: 700; color: #00f5d4;
          text-shadow: 0 0 12px rgba(0,245,212,0.5);
        }
        @media (max-width: 480px) { .ffit-score-chip { display: none; } }

        @keyframes ffit-pulse {
          0%,100%{ box-shadow: 0 0 6px rgba(0,245,212,0.6); }
          50%    { box-shadow: 0 0 14px rgba(0,245,212,1); }
        }

        /* top shimmer line */
        .ffit-header::after {
          content: '';
          position: absolute; bottom: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,245,212,0.25), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .ffit-header.scrolled::after { opacity: 1; }
      `}</style>

      {/* ── HEADER BAR ──────────────────────────────────────────────────── */}
      <header className={`ffit-header ${scrolled ? "scrolled" : "top"}`}>
        <div className="ffit-inner">

          {/* LOGO */}
          <div className="ffit-logo" onClick={() => navigate("/")}>
            <div className="ffit-logo-icon">⚡</div>
            <span className="ffit-logo-text">Forge<em>Fit</em></span>
          </div>

          {/* DESKTOP NAV LINKS */}
          <nav className="ffit-nav">
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                className={`ffit-nav-link ${isActive(link.path) ? "active" : ""}`}
                onClick={() => navigate(link.path)}
              >
                <span className="ffit-nav-icon">{link.icon}</span>
                {link.label}
              </button>
            ))}
          </nav>

          {/* RIGHT: score chip + profile/auth + hamburger */}
          <div className="ffit-right">

            {/* Today's Score chip — only when logged in */}
            {user && (
              <div className="ffit-score-chip">
                <div className="ffit-score-dot" />
                <span className="ffit-score-label">SCORE</span>
                <span className="ffit-score-val">{todayScore}</span>
              </div>
            )}

            {/* DESKTOP: profile dropdown OR auth buttons */}
            <div style={{ position: "relative" }} ref={profileRef} className="desktop-only" >
              <style>{`.desktop-only { display: none; } @media (min-width: 768px) { .desktop-only { display: block; } }`}</style>

              {user ? (
                <>
                  <button
                    className="ffit-profile-btn"
                    onClick={() => setProfileOpen(o => !o)}
                    aria-label="Profile menu"
                    aria-expanded={profileOpen}
                  >
                    <Avatar user={user} size={28} />
                    <span className="ffit-profile-name">{user.name?.split(" ")[0] || "Account"}</span>
                    <span className={`ffit-chevron ${profileOpen ? "open" : ""}`}>▾</span>
                  </button>

                  {/* Dropdown */}
                  <div className={`ffit-dropdown ${profileOpen ? "open" : "closed"}`}>
                    {/* User info */}
                    <div className="ffit-dd-header">
                      <Avatar user={user} size={38} />
                      <div>
                        <div className="ffit-dd-name">{user.name || "My Account"}</div>
                        <div className="ffit-dd-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="ffit-dd-body">
                      <button className="ffit-dd-item" onClick={() => { setProfileOpen(false); setProfileEditOpen(true); }}>
                        <span className="ffit-dd-icon">👤</span> Edit Profile
                      </button>
                      <div className="ffit-dd-sep" />
                      <button className="ffit-dd-item danger" onClick={handleLogout}>
                        <span className="ffit-dd-icon">→</span> Log out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="ffit-btn-ghost" onClick={() => navigate("/login")}>Sign in</button>
                  <button className="ffit-btn-primary" onClick={() => navigate("/signup")}>Get Started</button>
                </div>
              )}
            </div>

            {/* HAMBURGER — mobile only */}
            <button
              className="ffit-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`ffit-bar ffit-bar1 ${mobileOpen ? "open" : ""}`} />
              <span className={`ffit-bar ffit-bar2 ${mobileOpen ? "open" : ""}`} />
              <span className={`ffit-bar ffit-bar3 ${mobileOpen ? "open" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      <div className={`ffit-mobile ${mobileOpen ? "open" : "closed"}`} aria-hidden={!mobileOpen}>
        <div className="ffit-mobile-inner">

          {/* User info row */}
          {user && (
            <div className="ffit-mob-user">
              <Avatar user={user} size={44} />
              <div className="ffit-mob-user-info">
                <div className="ffit-mob-name">{user.name || "My Account"}</div>
                <div className="ffit-mob-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Nav links */}
          {NAV_LINKS.map(link => (
            <div
              key={link.path}
              className={`ffit-mob-link ${isActive(link.path) ? "active" : ""}`}
              onClick={() => navigate(link.path)}
            >
              <div className="ffit-mob-icon">{link.icon}</div>
              {link.label}
            </div>
          ))}

          {/* Account actions (logged in) */}
          {user && (
            <div className="ffit-mob-actions">
              <button className="ffit-mob-action" onClick={() => { setMobileOpen(false); setProfileEditOpen(true); }}>
                <span>👤</span> Edit Profile
              </button>
              <button className="ffit-mob-action danger" onClick={handleLogout}>
                <span>→</span> Log out
              </button>
            </div>
          )}

          {/* Auth buttons (logged out) */}
          {!user && (
            <div className="ffit-mob-auth">
              <button className="ffit-mob-auth-ghost" onClick={() => navigate("/login")}>Sign in</button>
              <button className="ffit-mob-auth-primary" onClick={() => navigate("/signup")}>Get Started Free</button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal isOpen={profileEditOpen} onClose={() => setProfileEditOpen(false)} />
    </>
  );
}
