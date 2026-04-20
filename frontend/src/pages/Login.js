import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      patient:       { email: 'patient@test.com',       password: 'password123' },
      doctor:        { email: 'doctor@test.com',         password: 'password123' },
      physio:        { email: 'physio@test.com',         password: 'password123' },
    };
    if (creds[role]) {
      setFormData(creds[role]);
      setError('');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: '#050510' }}>

      {/* Ambient orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Grid noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4 py-12 animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-5 animate-glow-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))',
              border: '1px solid rgba(99,102,241,0.5)',
              boxShadow: '0 0 40px rgba(99,102,241,0.3)',
            }}
          >
            ❖
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-2">
            <span className="gradient-text">Rehab</span>
            <span className="text-white">AI</span>
          </h1>
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-[0.25em]">
            Intelligent Recovery Suite
          </p>
        </div>

        {/* Card */}
        <div
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '28px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {/* Top glow accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.9), rgba(168,85,247,0.9), transparent)' }}
          />

          <div className="p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to continue your recovery journey</p>
            </div>

            {error && (
              <div
                className="mb-5 px-4 py-3.5 rounded-2xl flex items-center gap-3 animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
                <p className="text-red-300 font-semibold text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">✉️</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="premium-input pl-11 h-13"
                    style={{ height: '52px' }}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">🔑</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="premium-input pl-11 pr-12"
                    style={{ height: '52px' }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-semibold"
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 font-black text-base rounded-2xl text-white relative overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 30px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In →'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>

            {/* Register link */}
            <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-slate-500 text-sm">
                New to RehabAI?{' '}
                <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-6">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center mb-3">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'patient', label: 'Patient', icon: '🧑‍🦽', color: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.3)', text: '#5eead4' },
                  { role: 'doctor',  label: 'Doctor',  icon: '👨‍⚕️', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
                  { role: 'physio',  label: 'Physio',  icon: '🏥',    color: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#d8b4fe' },
                ].map(({ role, label, icon, color, border, text }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(role)}
                    className="p-2.5 rounded-xl text-center cursor-pointer transition-all duration-200 hover:scale-105"
                    style={{ background: color, border: `1px solid ${border}` }}
                  >
                    <span className="block text-xl mb-0.5">{icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide" style={{ color }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-8 flex items-center justify-center gap-8 opacity-30 hover:opacity-60 transition-opacity">
          {[
            { icon: '🔒', label: 'HIPAA Secure' },
            { icon: '🛡️', label: 'SSL Encrypted' },
            { icon: '⚡', label: 'AI Powered' },
          ].map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>{icon}</span> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
