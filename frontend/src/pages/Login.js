import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);

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
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">

        {/* ── Brand ── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.28)' }}>
            <span className="text-xl">❖</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Rehab<span className="gradient-text">AI</span>
          </h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">
            Intelligent Recovery Suite
          </p>
        </div>

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
            <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <span className="text-base flex-shrink-0">⚠</span>
              {error}
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
