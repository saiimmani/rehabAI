import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [backendStatus, setBackendStatus] = useState('idle'); // 'idle' | 'waking' | 'ready'
  const [, setWakeAttempts]   = useState(0);

  // Ping the backend on mount to detect/warm up cold starts
  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const pingBackend = async (attempt = 0) => {
      if (cancelled) return;
      try {
        await apiClient.get('/auth/health', { timeout: 8000 });
        if (!cancelled) setBackendStatus('ready');
      } catch {
        if (!cancelled) {
          if (attempt === 0) setBackendStatus('waking');
          setWakeAttempts(a => a + 1);
          // Retry up to 5 times with increasing delay (Render free tier can take ~30s)
          if (attempt < 5) {
            timer = setTimeout(() => pingBackend(attempt + 1), 6000);
          } else {
            // Backend may still work, just stop banner after many retries
            setBackendStatus('idle');
          }
        }
      }
    };

    pingBackend(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      // Render cold-start timeout message
      if (msg.toLowerCase().includes('reach the server') || msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('network')) {
        setError('The server is waking up — this can take 30–60 seconds on first load. Please wait a moment and try again.');
        setBackendStatus('waking');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <img
              src={`${process.env.PUBLIC_URL}/logo192.png`}
              alt="Rehab AI Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Rehab<span className="gradient-text">AI</span>
          </h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">
            Intelligent Recovery Suite
          </p>
        </div>

        {/* ── Backend warming notice ── */}
        {backendStatus === 'waking' && (
          <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-fade-in"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#fde68a' }}>
            <div className="flex-shrink-0 mt-0.5">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold mb-0.5">Server waking up…</p>
              <p className="text-xs opacity-80">
                Our free-tier backend takes 30–60 seconds to start after inactivity.
                You can try logging in — it will succeed once the server is ready.
              </p>
            </div>
          </div>
        )}

        {/* ── Card ── */}
        <div className="glass-card p-7">

          {/* Card header accent */}
          <div style={{ height: '2px', margin: '-28px -28px 24px',
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.5), transparent)',
            borderRadius: '14px 14px 0 0' }} />

          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-6">Sign in to continue your recovery journey</p>

          {/* ── Error ── */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl flex items-start gap-2.5 text-sm animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <span className="text-base flex-shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                className="premium-input" style={{ height: '44px' }}
                required autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} name="password"
                  placeholder="••••••••••"
                  value={formData.password} onChange={handleChange}
                  className="premium-input pr-14" style={{ height: '44px' }}
                  required autoComplete="current-password"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors px-1 py-0.5 rounded">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: '44px' }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* ── Register link ── */}
          <p className="text-center text-slate-500 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Create one
            </Link>
          </p>

        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-center gap-6 mt-6 opacity-35">
          {['🔒 HIPAA Secure', '🛡 SSL Encrypted', '⚡ AI Powered'].map(t => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{t}</span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Login;
