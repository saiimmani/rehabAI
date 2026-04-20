import React from 'react';

// ─── Button Component ─────────────────────────────────────────────────────────
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none';

  const variantMap = {
    primary:  'btn-primary',
    secondary:'btn-secondary',
    danger:   'btn-danger',
    success:  'btn-success',
    outline:  'btn-outline',
    ghost:    'btn-ghost',
  };

  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantMap[variant] || 'btn-primary'} ${sizeMap[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// ─── Card Component ───────────────────────────────────────────────────────────
export const Card = ({ children, className = '', ...props }) => (
  <div className={`glass-card p-6 ${className}`} {...props}>
    {children}
  </div>
);

// ─── Badge Component ──────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'blue', className = '' }) => {
  const variants = {
    blue:    'badge-info',
    green:   'badge-success',
    success: 'badge-success',
    red:     'badge-danger',
    danger:  'badge-danger',
    yellow:  'badge-warning',
    warning: 'badge-warning',
    gray:    'bg-white/5 border border-white/10 text-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        variants[variant] || variants.gray
      } ${className}`}
    >
      {children}
    </span>
  );
};

// ─── Input Component ──────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </label>
    )}
    <input
      className={`premium-input ${error ? 'border-red-500/60 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">⚠ {error}</p>}
  </div>
);

// ─── Modal Component ──────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`glass-modal w-full ${sizes[size]} animate-scale-in p-7`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xl"
            >
              ×
            </button>
          )}
        </div>
        <hr className="accent-line mb-6" />
        {children}
      </div>
    </div>
  );
};

// ─── Stats Grid ───────────────────────────────────────────────────────────────
export const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {stats.map((stat, idx) => (
      <div
        key={idx}
        className="glass-card p-5 text-center stat-card group hover:scale-105 transition-transform duration-300"
      >
        {stat.icon && (
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
            {stat.icon}
          </div>
        )}
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
          {stat.label}
        </p>
        <p className="text-3xl font-black gradient-text">{stat.value}</p>
        {stat.sub && (
          <p className="text-slate-500 text-xs mt-1">{stat.sub}</p>
        )}
      </div>
    ))}
  </div>
);

// ─── Avatar Component ─────────────────────────────────────────────────────────
export const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    xs:  'h-6 w-6 text-[10px]',
    sm:  'h-8 w-8 text-xs',
    md:  'h-11 w-11 text-sm',
    lg:  'h-16 w-16 text-lg',
    xl:  'h-20 w-20 text-xl',
  };

  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-teal-500 to-cyan-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
  ];
  const gradIdx = initials.charCodeAt(0) % gradients.length;

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br ${gradients[gradIdx]} rounded-full flex items-center justify-center text-white font-black ring-2 ring-white/10 shadow-lg ${className}`}
    >
      {initials}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="glass-card p-12 text-center border-dashed" style={{ borderStyle: 'dashed', borderColor: 'rgba(99,102,241,0.2)' }}>
    <div className="text-6xl mb-5 opacity-70 animate-float inline-block">{icon}</div>
    <h3 className="text-xl font-bold text-slate-200 mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
    {action}
  </div>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export const Skeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-white/8 rounded-lg w-3/4 mb-3" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2 mb-2" />
        <div className="h-3 bg-white/5 rounded-lg w-2/3" />
      </div>
    ))}
  </div>
);

// ─── Alert ───────────────────────────────────────────────────────────────────
export const Alert = ({ title, message, variant = 'info', onClose }) => {
  const variants = {
    info:    { cls: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',    icon: 'ℹ️' },
    success: { cls: 'border-teal-500/40 bg-teal-500/10 text-teal-200',           icon: '✅' },
    warning: { cls: 'border-amber-500/40 bg-amber-500/10 text-amber-200',        icon: '⚠️' },
    danger:  { cls: 'border-red-500/40 bg-red-500/10 text-red-200',              icon: '❌' },
  };
  const v = variants[variant] || variants.info;

  return (
    <div className={`border rounded-2xl p-4 flex justify-between items-start gap-3 backdrop-blur-sm ${v.cls}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{v.icon}</span>
        <div>
          {title && <h4 className="font-bold mb-0.5">{title}</h4>}
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 text-xl font-bold leading-none flex-shrink-0">
          ×
        </button>
      )}
    </div>
  );
};

// ─── Progress Ring ────────────────────────────────────────────────────────────
export const ProgressRing = ({ radius = 60, stroke = 8, progress = 0, color = '#6366f1' }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-lg">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>
          {progress}%
        </span>
      </div>
    </div>
  );
};

// ─── Request Card ─────────────────────────────────────────────────────────────
export const RequestCard = ({
  userName,
  userEmail,
  userPhone,
  specialization,
  message,
  onAccept,
  onReject,
  loading = false,
  variant = 'incoming',
}) => (
  <Card className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white mb-1">{userName}</h3>
      <p className="text-slate-400 text-sm mb-2">
        {userEmail}
        {userPhone && ` • ${userPhone}`}
      </p>
      {specialization && <Badge variant="blue">{specialization}</Badge>}
      {message && <p className="text-slate-300 mt-3 text-sm leading-relaxed">{message}</p>}
    </div>
    {variant === 'incoming' && (
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="danger" size="sm" onClick={onReject} disabled={loading}>
          Decline
        </Button>
        <Button variant="primary" size="sm" onClick={onAccept} loading={loading}>
          Accept
        </Button>
      </div>
    )}
    {variant === 'outgoing' && <Badge variant="warning">⏳ Pending</Badge>}
  </Card>
);
