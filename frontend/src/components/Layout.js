import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Avatar } from './UIComponents';

// ─── Ambient Background ────────────────────────────────────────────────────────
export const AmbientBackground = () => (
  <>
    <div className="bg-orb bg-orb-1" />
    <div className="bg-orb bg-orb-2" />
    <div className="bg-orb bg-orb-3" />
  </>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = user.role === 'patient'
    ? [
        { to: '/dashboard',           label: 'Dashboard',    icon: '🏠' },
        { to: '/sessions',            label: 'Sessions',     icon: '📅' },
        { to: '/exercise-tracking',   label: 'Tracking',     icon: '📐' },
        { to: '/ai-rehab-plan',       label: 'AI Plan',      icon: '🤖' },
        { to: '/doctor-patient-chat', label: 'Doctor Chat',  icon: '💬' },
        { to: '/chat',                label: 'AI Assistant', icon: '🧠' },
      ]
    : [
        { to: '/dashboard',           label: 'Dashboard',    icon: '🏠' },
        { to: '/doctor-patient-chat', label: 'Patient Chat', icon: '💬' },
      ];

  return (
    <>
      <nav
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled
            ? 'linear-gradient(135deg, rgba(5,5,20,0.95) 0%, rgba(10,10,30,0.92) 100%)'
            : 'linear-gradient(135deg, rgba(5,5,20,0.80) 0%, rgba(10,10,30,0.75) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top accent line */}
        <div
          className="h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.8) 30%, rgba(168,85,247,0.8) 70%, transparent 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img
              src={`${process.env.PUBLIC_URL}/logo192.png`}
              alt="Rehab AI"
              className="w-9 h-9 rounded-xl object-cover"
              style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}
            />
            <span
              className="text-[20px] font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Rehab
            </span>
            <span className="text-[20px] font-black text-white -ml-1">AI</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive ? 'nav-item-active' : 'nav-item'
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: User Menu + Hamburger */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* User Menu (desktop) */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-white leading-tight">{user.firstName}</p>
                  <p className="text-[11px] text-slate-400 capitalize tracking-wide">{user.role}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 animate-scale-in overflow-hidden"
                  style={{
                    background: 'rgba(14, 16, 32, 0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* User info header */}
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                      <div>
                        <p className="font-bold text-white text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs capitalize font-medium" style={{ color: '#818cf8' }}>{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    {[
                      { to: '/profile',         icon: '👤', label: 'My Profile' },
                      { to: '/progress-report', icon: '📊', label: 'Progress Report' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 px-5 py-2.5 text-[13.5px] font-medium text-slate-200 hover:text-white hover:bg-white/[0.07] transition-all"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-[13.5px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <span className="text-base">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl gap-1.5 transition-all hover:bg-white/10 border border-transparent hover:border-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open menu"
            >
              <span
                className="w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300"
                style={{ transform: isMobileMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}
              />
              <span
                className="w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300"
                style={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              />
              <span
                className="w-5 h-0.5 bg-slate-300 rounded-full transition-all duration-300"
                style={{ transform: isMobileMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Side Drawer ─────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
            style={{
              background: 'rgba(10, 11, 25, 0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
              animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* Drawer Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <img
                  src={`${process.env.PUBLIC_URL}/logo192.png`}
                  alt="Rehab AI"
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <span className="font-black text-lg text-white">RehabAI</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                <div>
                  <p className="font-bold text-white text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs capitalize text-indigo-400 font-medium">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                      isActive ? 'nav-item-active' : 'nav-item'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold nav-item transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">👤</span>
                  My Profile
                </Link>
                <Link
                  to="/progress-report"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold nav-item transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">📊</span>
                  Progress Report
                </Link>
              </div>
            </nav>

            {/* Logout Button */}
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Mobile Bottom Tab Bar ──────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-1 pb-safe"
        style={{
          background: 'rgba(8, 9, 22, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
          paddingTop: '8px',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {navLinks.slice(0, 5).map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center gap-1 flex-1 py-1 rounded-xl transition-all duration-200"
              style={{
                color: isActive ? '#a5b4fc' : 'rgba(148,163,184,0.6)',
                minWidth: 0,
              }}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span className="text-[9px] font-bold tracking-wide truncate w-full text-center"
                style={{ color: 'inherit' }}>
                {link.label}
              </span>
              {isActive && (
                <span
                  className="w-4 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const Sidebar = ({ items, activeItem }) => (
  <aside
    className="w-64 min-h-screen p-5 hidden md:flex flex-col gap-2"
    style={{
      background: 'linear-gradient(180deg, rgba(10,10,30,0.9) 0%, rgba(5,5,20,0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <Link to="/" className="flex items-center gap-2 mb-6 px-2">
      <img
        src={`${process.env.PUBLIC_URL}/logo192.png`}
        alt="Rehab AI"
        className="w-9 h-9 rounded-xl object-cover"
      />
      <span className="text-xl font-black gradient-text">RehabAI</span>
    </Link>
    <nav className="space-y-1">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeItem === item.id ? 'nav-item-active' : 'nav-item'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-6 animate-fade-in-up">
    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="text-slate-300 text-[14px] md:text-[15px] font-medium leading-relaxed">{subtitle}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, activeTab, onChange }) => (
  <div
    className="flex gap-1 mb-6 p-1 rounded-2xl overflow-x-auto scrollbar-thin"
    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-shrink-0 px-4 py-2.5 text-[13px] font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
          activeTab === tab.id
            ? 'text-white'
            : 'text-slate-300 hover:text-white'
        }`}
        style={
          activeTab === tab.id
            ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.32) 0%, rgba(139,92,246,0.32) 100%)',
                border: '1px solid rgba(99,102,241,0.45)',
                boxShadow: '0 4px 14px rgba(99,102,241,0.22)',
              }
            : {}
        }
      >
        {tab.label}
      </button>
    ))}
  </div>
);
