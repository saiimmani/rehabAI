import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navbar, TabBar, PageHeader } from '../components/Layout';
import { Card, Button, Badge, Skeleton, StatsGrid } from '../components/UIComponents';
import apiClient from '../services/apiClient';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  });

  useEffect(() => {
    fetchProfileData();
    fetchAchievements();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/patient/profile');
      const data = response.data;
      setProfileData(data);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',  // backend returns phoneNumber
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback: use auth context user data
      if (user) {
        const fallbackData = {
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email || '',
          phoneNumber: user.phone || user.phoneNumber || '',
          dateOfBirth: '',
          address: '',
          patientId: user.uniqueId || '',
          medical: {},
          stats: { totalExercises: 0, daysActive: 0, recoveryProgress: 0, streak: 0 }
        };
        setProfileData(fallbackData);
        setFormData({
          fullName: fallbackData.fullName,
          email: fallbackData.email,
          phoneNumber: fallbackData.phoneNumber,
          dateOfBirth: '',
          address: ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await apiClient.get('/achievements/user');
      if (response.data.success) {
        setAchievements(response.data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiClient.put('/patient/profile', formData);
      setProfileData(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrorMsg('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton count={3} />
        </div>
      </div>
    );
  }

  const displayName = profileData?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const displayPhone = profileData?.phoneNumber || user?.phone || user?.phoneNumber || '';

  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const stats = [
    { label: 'Total Exercises', value: profileData?.stats?.totalExercises || 0 },
    { label: 'Days Active', value: profileData?.stats?.daysActive || 0 },
    { label: 'Recovery Progress', value: `${profileData?.stats?.recoveryProgress || 0}%` },
    { label: 'Current Streak', value: `${profileData?.stats?.streak || 0}d` }
  ];

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'medical', label: 'Medical Info' },
    { id: 'achievements', label: 'Achievements' }
  ];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <PageHeader
          title="My Profile"
          subtitle="Manage your personal information and track your recovery journey"
        />

        {/* Profile Header Card */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-900/40">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>

            {/* Name + Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-100 mb-1">{displayName}</h2>
              <p className="text-slate-400 text-sm mb-1">{profileData?.email || user?.email}</p>
              {profileData?.patientId && (
                <p className="text-xs text-slate-500 mb-3">ID: {profileData.patientId}</p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                  ✓ Active Recovery Plan
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Patient
                </span>
              </div>
            </div>

            {/* Edit button */}
            {!isEditing && (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="flex-shrink-0"
              >
                ✏️ Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold animate-fade-in"
            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0' }}>
            ✅ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold animate-fade-in"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <Card className="animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="field-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="premium-input"
                    placeholder="Your full name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="premium-input"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="field-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                      className="premium-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleFormChange}
                      className="premium-input"
                    />
                  </div>
                  <div>
                    <label className="field-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="premium-input"
                      placeholder="Your address"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                  <Button variant="primary" onClick={handleSaveProfile} loading={saving}>
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setIsEditing(false); setErrorMsg(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: displayName },
                  { label: 'Email Address', value: profileData?.email || user?.email || 'Not provided' },
                  { label: 'Phone Number', value: displayPhone || 'Not provided' },
                  {
                    label: 'Date of Birth',
                    value: profileData?.dateOfBirth && profileData.dateOfBirth !== 'Not provided'
                      ? profileData.dateOfBirth
                      : (user?.age ? `${user.age} years old` : 'Not provided')
                  },
                  { label: 'Address', value: profileData?.address || 'Not provided', span: true }
                ].map(({ label, value, span }) => (
                  <div key={label} className={`p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 ${span ? 'md:col-span-2' : ''}`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                    <p className="text-slate-200 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Medical Information Tab */}
        {activeTab === 'medical' && (
          <Card className="animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span>🏥</span> Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Condition', value: profileData?.medical?.condition || 'Not provided' },
                { label: 'Start Date', value: profileData?.medical?.startDate || 'Not provided' },
                { label: 'Primary Therapist', value: profileData?.medical?.primaryTherapist || 'Not assigned' },
                { label: 'Expected Completion', value: profileData?.medical?.expectedCompletion || 'Not determined' }
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                  <p className="text-slate-200 font-semibold">{value}</p>
                </div>
              ))}

              <div className="md:col-span-2 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Medical Notes</p>
                <p className="text-slate-300 leading-relaxed">{profileData?.medical?.notes || 'No medical notes available yet.'}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <Card className="animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <span>🏆</span> Achievements & Badges
            </h3>

            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id || achievement._id}
                    className={`rounded-xl p-5 text-center transition-all border ${
                      achievement.earned
                        ? 'border-amber-500/40 bg-amber-500/10 shadow-lg shadow-amber-900/20'
                        : 'border-slate-700/50 bg-slate-800/40 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h4 className="font-bold text-slate-100 mb-1 text-sm">{achievement.name}</h4>
                    <p className="text-xs text-slate-400">{achievement.description}</p>
                    {achievement.earned && (
                      <span className="mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ✓ Earned
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">🏆</span>
                <h4 className="text-xl font-bold text-slate-300 mb-2">No achievements yet</h4>
                <p className="text-slate-500">Complete exercises and stay consistent to earn badges!</p>
              </div>
            )}
          </Card>
        )}

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <Button variant="danger" onClick={handleLogout}>
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
