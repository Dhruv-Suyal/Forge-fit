import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

gsap.registerPlugin(ScrollToPlugin);

// Initials avatar — no broken image ever
function UserAvatar({ user, size = "w-10 h-10", textSize = "text-sm" }) {
  const initials = user?.name
  ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  : "P";

  return (
    <div
      className={`${size} ${textSize} rounded-full flex items-center justify-center font-bold text-white select-none shrink-0`}
      style={{
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        border: "2px solid rgba(99,102,241,0.4)",
        boxShadow: "0 0 14px rgba(99,102,241,0.3)",
      }}
    >
      {initials}
    </div>
  );
}

export function Header({ pricingRef, howItWorksRef, featuresRef, showCaseRef }) {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [accountOpen, setAccountOpen]   = useState(false); // mobile accordion
  const [dropdownOpen, setDropdownOpen] = useState(false); // desktop dropdown
  const dropdownRef = useRef(null);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Features",     ref: featuresRef },
    { label: "How It Works", ref: howItWorksRef },
    { label: "Pricing",      ref: pricingRef },
    { label: "Showcase",     ref: showCaseRef },
  ];

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  function scrollTo(ref) {
    if (!ref?.current) return;
    setMenuOpen(false);
    setAccountOpen(false);
    gsap.to(window, { duration: 0.5, scrollTo: { y: ref.current, offsetY: 120 } });
  }

  function handleNav(path) {
    setDropdownOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
    navigate(path);
  }

  async function handleLogout() {
    setDropdownOpen(false);
    setMenuOpen(false);
    setAccountOpen(false);
    try {
      api.get("/auth/logout").then(()=>{
        setUser(null);
        navigate("/");
      })
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  useGSAP(() => {
    gsap.from("#LOGO, #NAVACCOUNT, .HAMBURGER", {
      y: -15, opacity: 0, delay: 0.8, duration: 1,
    });
    gsap.from(".NAVLINK", {
      y: -15, opacity: 0, delay: 0.8, duration: 1, stagger: 0.15,
    });
  });

  return (
    <>
      {/* ── NAV BAR ───────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#00000c]/88 backdrop-blur-2xl border-b border-white/6" : ""
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-7 h-[68px] flex items-center justify-between gap-5">

          {/* Logo */}
          <div id="LOGO" onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer shrink-0">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.5)" }}
            >
              W
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">
              Forge<em className="not-italic grad-text">AI</em>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map(({ label, ref }) => (
              <span key={label} className="NAVLINK text-sm font-medium text-slate-500
                hover:text-slate-100 cursor-pointer transition-colors duration-200"
                onClick={() => scrollTo(ref)}>
                {label}
              </span>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center">
            {user ? (
              /* Desktop avatar + dropdown */
              <div ref={dropdownRef} className="relative">
                <button onClick={() => setDropdownOpen((o) => !o)}
                  className="cursor-pointer focus:outline-none" aria-label="Profile menu">
                  <UserAvatar user={user} />
                </button>

                <div className={`absolute top-[calc(100%+12px)] right-0 w-52 rounded-2xl
                  border border-white/8 overflow-hidden transition-all duration-200
                  origin-top-right
                  ${dropdownOpen
                    ? "opacity-100 visible translate-y-0 scale-100"
                    : "opacity-0 invisible -translate-y-2 scale-95"}`}
                  style={{
                    background: "rgba(6,6,18,0.97)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(99,102,241,0.08)",
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-[13px] font-semibold text-slate-200 truncate">
                      {user.name || "My Account"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="p-1.5">
                    <button onClick={() => handleNav("/credits")}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                        text-[13px] font-medium text-slate-400 hover:text-slate-100
                        hover:bg-indigo-500/10 transition-all duration-150 cursor-pointer">
                      <span className="text-base">⚡</span>
                      <span>Credits</span>
                      <span className="ml-auto text-[11px] font-semibold text-indigo-400
                        bg-indigo-500/15 px-2 py-0.5 rounded-full">240</span>
                    </button>

                    <button onClick={() => handleNav("/history")}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                        text-[13px] font-medium text-slate-400 hover:text-slate-100
                        hover:bg-indigo-500/10 transition-all duration-150 cursor-pointer">
                      <span className="text-base">🕐</span>
                      <span>History</span>
                    </button>

                    <div className="my-1 h-px bg-white/6" />

                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                        text-[13px] font-medium text-red-400 hover:text-red-300
                        hover:bg-red-500/10 transition-all duration-150 cursor-pointer">
                      <span className="text-base">→</span>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop auth buttons */
              <div id="NAVACCOUNT" className="flex items-center gap-2.5">
                <button onClick={() => navigate("/logIn")}
                  className="text-sm font-medium text-slate-500 hover:text-slate-100
                    px-5 py-2.5 rounded-xl border border-white/10 hover:border-indigo-500/40
                    hover:bg-indigo-500/8 transition-all duration-200 bg-transparent cursor-pointer">
                  Sign in
                </button>
                <button onClick={() => navigate("/SignUp")}
                  className="grad-bg text-sm font-semibold text-white px-6 py-2.5 rounded-xl
                    border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5
                    relative overflow-hidden"
                  style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
                  <span className="absolute inset-0 bg-linear-to-br from-white/18 to-transparent" />
                  <span className="relative">Get Started Free</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => { setMenuOpen((o) => !o); setAccountOpen(false); }}
            className="HAMBURGER md:hidden flex flex-col gap-[5px] p-2 border border-white/8
              hover:border-indigo-500/40 rounded-lg transition-colors duration-200
              bg-transparent cursor-pointer"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1.5px] bg-slate-500 rounded transition-all duration-300
              ${menuOpen ? "translate-y-[6.5px] rotate-45 !bg-indigo-400" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-500 rounded transition-all duration-300
              ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-slate-500 rounded transition-all duration-300
              ${menuOpen ? "-translate-y-[6.5px] -rotate-45 !bg-indigo-400" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ───────────────────────────────────────────────── */}
      <div
        className={`fixed inset-x-0 top-[68px] z-40 md:hidden
          bg-[#00000c]/97 backdrop-blur-3xl border-b border-white/6
          transition-all duration-300 overflow-hidden
          ${menuOpen
            ? "max-h-screen opacity-100 pointer-events-auto"
            : "max-h-0 opacity-0 pointer-events-none"}`}
      >
        <div className="px-6 pb-8 pt-2">

          {/* ── MY ACCOUNT accordion row (only when logged in) ── */}
          {user && (
            <div className="border-b border-white/5">

              {/* Tappable row */}
              <button
                onClick={() => setAccountOpen((o) => !o)}
                className="w-full flex items-center justify-between py-4 bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="w-[38px] h-[38px]" textSize="text-[15px]" />
                  <div className="text-left">
                    <p className="text-[15px] font-semibold text-slate-200">My Account</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                {/* Animated chevron */}
                <span className={`text-slate-500 text-[11px] transition-transform duration-300
                  ${accountOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {/* Slide-down sub-panel */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                  ${accountOpen ? "max-h-60 mb-3" : "max-h-0"}`}
                style={{ background: "rgba(99,102,241,0.04)", borderRadius: "0 0 12px 12px" }}
              >
                <button onClick={() => handleNav("/credits")}
                  className="w-full flex items-center gap-3 px-4 py-3.5
                    text-[14px] font-medium text-slate-400 hover:text-slate-100
                    hover:bg-indigo-500/8 transition-all duration-150 cursor-pointer
                    border-b border-white/4">
                  <span className="text-base w-5 text-center">⚡</span>
                  <span>Credits</span>
                  <span className="ml-auto text-[11px] font-semibold text-indigo-400
                    bg-indigo-500/15 px-2.5 py-0.5 rounded-full">240</span>
                </button>

                <button onClick={() => handleNav("/history")}
                  className="w-full flex items-center gap-3 px-4 py-3.5
                    text-[14px] font-medium text-slate-400 hover:text-slate-100
                    hover:bg-indigo-500/8 transition-all duration-150 cursor-pointer
                    border-b border-white/4">
                  <span className="text-base w-5 text-center">🕐</span>
                  <span>History</span>
                </button>

                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5
                    text-[14px] font-medium text-red-400 hover:text-red-300
                    hover:bg-red-500/8 transition-all duration-150 cursor-pointer">
                  <span className="text-base w-5 text-center">→</span>
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Nav links (always visible) ── */}
          {navLinks.map(({ label, ref }) => (
            <span key={label} onClick={() => scrollTo(ref)}
              className="block text-[15px] font-medium text-slate-500 hover:text-slate-100
                py-4 border-b border-white/5 last:border-none
                cursor-pointer transition-colors duration-200">
              {label}
            </span>
          ))}

          {/* ── Auth buttons (only when logged out) ── */}
          {!user && (
            <div className="flex flex-col gap-3 pt-6">
              <button onClick={() => handleNav("/logIn")}
                className="w-full text-[15px] font-medium text-slate-400 py-3.5 rounded-xl
                  border border-white/10 bg-transparent cursor-pointer
                  hover:text-slate-200 hover:border-indigo-500/30 transition-all duration-200">
                Sign in
              </button>
              <button onClick={() => handleNav("/SignUp")}
                className="grad-bg w-full text-[15px] font-semibold text-white py-3.5
                  rounded-xl border-none cursor-pointer relative overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
                <span className="absolute inset-0 bg-linear-to-br from-white/18 to-transparent" />
                <span className="relative">Get Started Free</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}