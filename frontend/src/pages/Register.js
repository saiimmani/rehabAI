import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', role: 'patient', age: '', phone: '', specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First and last name are required'); return false;
    }
    
    if (formData.phone) {
      // Validate that it contains exactly 10 digits (ignoring spaces/dashes)
      const digitCount = formData.phone.replace(/\D/g, '').length;
      if (digitCount !== 10) {
        setError('Phone number must be exactly 10 digits'); return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.trim())          { setError('Email is required'); return false; }
    if (formData.password.length < 6)    { setError('Password must be at least 6 characters'); return false; }
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

  const roles = [
    { value: 'patient',         label: 'Patient',        icon: '🧑‍🦽' },
    { value: 'doctor',          label: 'Doctor',         icon: '👨‍⚕️' },
    { value: 'physiotherapist', label: 'Physiotherapist',icon: '🏥'   },
  ];

  const inputField = (name, label, type = 'text', placeholder = '', extraProps = {}) => (
    <div key={name}>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <input
        type={type} name={name} placeholder={placeholder}
        value={formData[name]} onChange={handleChange}
        className="premium-input" style={{ height: '42px' }}
        {...extraProps}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in-up">

        {/* ── Brand ── */}
        <div className="text-center mb-7">
          <Link to="/login" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <img
                src={`${process.env.PUBLIC_URL}/logo192.png`}
                alt="Rehab AI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-black text-white">
              Rehab<span className="gradient-text">AI</span>
            </span>
          </Link>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1.5">
            Create your account
          </p>
        </div>

        {/* ── Card ── */}
        <div className="glass-card p-7">

          {/* Top accent */}
          <div style={{ height: '2px', margin: '-28px -28px 22px',
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(99,102,241,0.6), transparent)',
            borderRadius: '14px 14px 0 0' }} />

          {/* ── Step indicator ── */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Step {step} of 2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                {step === 1 ? 'Personal Info' : 'Account Setup'}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${step * 50}%` }} />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            {step === 1 ? 'Tell us about you' : 'Secure your account'}
          </h2>
          <p className="text-slate-500 text-sm mb-5">
            {step === 1 ? 'Set up your personal profile' : 'Create your login credentials'}
          </p>

          {/* ── Error ── */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <span className="flex-shrink-0">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <div className="space-y-4 animate-fade-in-up">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  {inputField('firstName', 'First Name', 'text', 'John')}
                  {inputField('lastName',  'Last Name',  'text', 'Doe')}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    I am a…
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(({ value, label, icon }) => (
                      <button key={value} type="button"
                        onClick={() => setFormData({ ...formData, role: value })}
                        className="py-3 px-1 rounded-xl text-center transition-all cursor-pointer"
                        style={formData.role === value ? {
                          background: 'rgba(99,102,241,0.16)',
                          border: '1px solid rgba(99,102,241,0.4)',
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                        <span className="block text-xl mb-1">{icon}</span>
                        <span className="block text-[10px] font-bold text-white leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specialization (non-patient) */}
                {formData.role !== 'patient' && (
                  <div className="animate-fade-in-up">
                    {inputField('specialization', 'Specialization', 'text', 'e.g. Orthopedics')}
                  </div>
                )}

                {/* Age & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  {inputField('age',   'Age',   'number', '28', { min: 1, max: 120 })}
                  {inputField('phone', 'Phone', 'tel',    '10 digit number', { 
                    maxLength: 10,
                    pattern: '[0-9]{10}',
                    onInput: (e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in-up">
                {inputField('email',           'Email',            'email',    'you@example.com')}
                {inputField('password',        'Password',         'password', 'Min 6 characters')}
                {inputField('confirmPassword', 'Confirm Password', 'password', 'Re-enter password')}
              </div>
            )}

            {/* ── Buttons ── */}
            <div className="flex gap-3 pt-1">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 btn-secondary font-semibold text-sm rounded-xl transition-all"
                  style={{ height: '42px' }}>
                  ← Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 btn-primary font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: '42px' }}>
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating…
                  </>
                ) : step === 1 ? 'Continue →' : 'Create Account →'}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-700 text-[10px] font-bold uppercase tracking-widest mt-6">
          ✓ HIPAA Compliant &nbsp;·&nbsp; ✓ End-to-End Encrypted
        </p>
      </div>
    </div>
  );
};

export default Register;
