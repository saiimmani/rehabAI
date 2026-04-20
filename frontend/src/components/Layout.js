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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = user.role === 'patient'
    ? [
        { to: '/dashboard',          label: 'Dashboard',    icon: '🏠' },
        { to: '/sessions',           label: 'Sessions',     icon: '📅' },
        { to: '/exercise-tracking',  label: 'Tracking',     icon: '📐' },
        { to: '/ai-rehab-plan',      label: 'AI Plan',      icon: '🤖' },
        { to: '/doctor-patient-chat',label: 'Doctor Chat',  icon: '💬' },
        { to: '/chat',               label: 'AI Assistant', icon: '🧠' },
      ]
    : [
        { to: '/dashboard',          label: 'Dashboard',    icon: '🏠' },
        { to: '/doctor-patient-chat',label: 'Patient Chat', icon: '💬' },
      ];

  return (
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

      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-xl font-black tracking-tight flex items-center gap-2.5 flex-shrink-0"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            }}
          >
            ❖
          </div>
          <span className="gradient-text">Rehab</span>
          <span className="text-white">AI</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? 'nav-item-active' : 'nav-item'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">{user.firstName}</p>
              <p className="text-[10px] text-slate-500 capitalize tracking-wide">{user.role}</p>
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
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <span>🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
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
    <Link to="/" className="text-xl font-black flex items-center gap-2 mb-6 px-2">
      <span className="text-2xl">❖</span>
      <span className="gradient-text">RehabAI</span>
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
  <div className="mb-8 animate-fade-in-up">
    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 leading-tight">
      {title}
    </h1>
    {subtitle && (
      <p className="text-slate-400 text-base font-medium">{subtitle}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export const TabBar = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 mb-8 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
          activeTab === tab.id
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        style={
          activeTab === tab.id
            ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)',
                border: '1px solid rgba(99,102,241,0.4)',
                boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
              }
            : {}
        }
      >
        {tab.label}
      </button>
    ))}
  </div>
);
