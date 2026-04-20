import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/UIComponents';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', role: 'patient', age: '', phone: '', specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName) { setError('First and Last names are required'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email) { setError('Email is required'); return false; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (step === 1) { if (!validateStep1()) return; setStep(2); return; }
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'patient',        label: 'Patient',          icon: '🧑‍🦽', desc: 'Seeking recovery' },
    { value: 'doctor',         label: 'Doctor',           icon: '👨‍⚕️', desc: 'Medical professional' },
    { value: 'physiotherapist',label: 'Physiotherapist',  icon: '🏥',   desc: 'Rehab specialist' },
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-10 px-4" style={{ background: '#050510' }}>
      {/* Ambient orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2.5 text-xl font-black">
            <span className="text-2xl">❖</span>
            <span className="gradient-text">Rehab</span>
            <span className="text-white">AI</span>
          </Link>
          <p className="text-slate-500 text-xs uppercase tracking-[0.25em] font-bold mt-2">
            Create Your Account
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
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.9), rgba(99,102,241,0.9), transparent)' }}
          />

          <div className="p-8">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step {step} of 2</span>
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#818cf8' }}>
                  {step === 1 ? 'Personal Info' : 'Account Setup'}
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(step / 2) * 100}%`,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)',
                    boxShadow: '0 0 12px rgba(99,102,241,0.6)',
                  }}
                />
              </div>
              {/* Step indicators */}
              <div className="flex justify-between mt-3">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300"
                      style={
                        step >= s
                          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }
                          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {step > s ? '✓' : s}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-bold" style={{ color: step >= s ? '#818cf8' : 'rgba(148,163,184,0.4)' }}>
                      {s === 1 ? 'Profile' : 'Security'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {step === 1 ? 'Tell Us About You' : 'Secure Your Account'}
            </h2>
            <p className="text-slate-500 text-sm mb-7">
              {step === 1 ? 'Set up your personal profile information' : 'Create your login credentials'}
            </p>

            {error && (
              <div
                className="mb-5 px-4 py-3.5 rounded-2xl flex items-center gap-3 animate-fade-in"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                <span className="text-red-400 flex-shrink-0">⚠️</span>
                <p className="text-red-300 font-semibold text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <div className="space-y-5 animate-fade-in-up">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'firstName', label: 'First Name', placeholder: 'John' },
                      { name: 'lastName',  label: 'Last Name',  placeholder: 'Doe' },
                    ].map(({ name, label, placeholder }) => (
                      <div key={name}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                        <input
                          type="text" name={name} placeholder={placeholder}
                          value={formData[name]} onChange={handleChange}
                          className="premium-input" style={{ height: '48px' }} required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Role selection */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">I am registering as</label>
                    <div className="grid grid-cols-3 gap-2">
                      {roleOptions.map(({ value, label, icon, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: value })}
                          className="p-3 rounded-2xl text-center transition-all duration-200 cursor-pointer"
                          style={
                            formData.role === value
                              ? {
                                  background: 'rgba(99,102,241,0.2)',
                                  border: '1px solid rgba(99,102,241,0.5)',
                                  boxShadow: '0 0 16px rgba(99,102,241,0.2)',
                                }
                              : {
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                }
                          }
                        >
                          <span className="block text-2xl mb-1">{icon}</span>
                          <span className="block text-xs font-bold text-white">{label}</span>
                          <span className="block text-[9px] text-slate-500 mt-0.5">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialization (non-patient) */}
                  {formData.role !== 'patient' && (
                    <div className="animate-fade-in-up">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</label>
                      <input
                        type="text" name="specialization"
                        placeholder="e.g., Orthopedics, Sports Medicine"
                        value={formData.specialization} onChange={handleChange}
                        className="premium-input" style={{ height: '48px' }} required
                      />
                    </div>
                  )}

                  {/* Age & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'age',   label: 'Age',   type: 'number', placeholder: '30' },
                      { name: 'phone', label: 'Phone', type: 'tel',    placeholder: '+1 555 000 0000' },
                    ].map(({ name, label, type, placeholder }) => (
                      <div key={name}>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                        <input
                          type={type} name={name} placeholder={placeholder}
                          value={formData[name]} onChange={handleChange}
                          className="premium-input" style={{ height: '48px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in-up">
                  {[
                    { name: 'email',           label: 'Email Address',     type: 'email',    placeholder: 'you@example.com',  icon: '✉️' },
                    { name: 'password',        label: 'Password',          type: 'password', placeholder: 'Min 6 characters',  icon: '🔑' },
                    { name: 'confirmPassword', label: 'Confirm Password',  type: 'password', placeholder: 'Re-enter password', icon: '✅' },
                  ].map(({ name, label, type, placeholder, icon }) => (
                    <div key={name}>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">{icon}</span>
                        <input
                          type={type} name={name} placeholder={placeholder}
                          value={formData[name]} onChange={handleChange}
                          className="premium-input pl-11" style={{ height: '52px' }}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button
                    type="button" onClick={() => setStep(1)}
                    className="flex-1 h-13 font-bold text-sm rounded-2xl text-slate-400 transition-all duration-200"
                    style={{ height: '52px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 font-black text-sm rounded-2xl text-white relative overflow-hidden group transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    height: '52px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Creating Account...
                    </span>
                  ) : step === 1 ? 'Continue →' : 'Create Account →'}
                </button>
              </div>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-4">
          <span>✔ ISO 27001</span>
          <span>•</span>
          <span>✔ End-to-End Encrypted</span>
          <span>•</span>
          <span>✔ HIPAA Compliant</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
