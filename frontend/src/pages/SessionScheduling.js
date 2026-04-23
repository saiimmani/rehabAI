import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navbar, PageHeader } from '../components/Layout';
import { Card, Button } from '../components/UIComponents';
import apiClient from '../services/apiClient';

const SessionScheduling = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    type: 'Video Call',
    professionalId: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sessionsRes, profRes] = await Promise.all([
        apiClient.get('/sessions'),
        // Load all users who are doctors or physiotherapists
        apiClient.get('/auth/professionals').catch(() => ({ data: [] }))
      ]);
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      setProfessionals(Array.isArray(profRes.data) ? profRes.data : []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await apiClient.get('/sessions');
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!bookingForm.professionalId) {
      alert('Please select a doctor or physiotherapist.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        patientId: user.userId || user.id,
        professionalId: bookingForm.professionalId,
        date: bookingForm.date,
        time: bookingForm.time,
        type: bookingForm.type,
        notes: bookingForm.notes
      };

      await apiClient.post('/sessions', payload);
      await fetchSessions();
      setShowBooking(false);
      setBookingForm({ date: '', time: '', type: 'Video Call', professionalId: '', notes: '' });
    } catch (error) {
      alert('Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      await apiClient.put(`/sessions/${id}/status`, { status: 'cancelled' });
      fetchSessions();
    } catch (error) {
      alert('Failed to cancel session.');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  label: 'Pending Approval' },
      approved:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20',  label: 'Approved' },
      upcoming:  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Upcoming' },
      completed: { bg: 'bg-teal-500/10',   text: 'text-teal-400',   border: 'border-teal-500/20',   label: 'Completed' },
      cancelled: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Cancelled' },
      declined:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Declined' },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`px-2 py-1 ${s.bg} ${s.text} border ${s.border} rounded-md text-[9px] font-black uppercase tracking-widest`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <PageHeader 
            title="📅 Session Scheduling"
            subtitle="Book appointments with your assigned doctor or physiotherapist"
          />
          {user?.role === 'patient' && (
            <Button 
              variant="primary" 
              onClick={() => setShowBooking(true)}
              className="h-12 px-8 font-black shadow-indigo-500/20 shadow-lg"
            >
              + New Appointment
            </Button>
          )}
        </div>

        {showBooking && (
          <div className="animate-fade-in-up mb-10">
            <Card className="glass-panel border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowBooking(false)} className="text-slate-500 hover:text-white transition-colors text-xl">✕</button>
              </div>
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <span className="text-indigo-400">📝</span> Schedule Appointment
              </h2>
              <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                {/* Professional Selector */}
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Doctor / Physiotherapist *
                  </label>
                  <select
                    required
                    className="premium-input px-4 h-12 bg-slate-900 appearance-none w-full"
                    value={bookingForm.professionalId}
                    onChange={(e) => setBookingForm({ ...bookingForm, professionalId: e.target.value })}
                  >
                    <option value="">-- Select a professional --</option>
                    {professionals.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName} ({p.role})
                      </option>
                    ))}
                    {professionals.length === 0 && (
                      <option disabled>No professionals found</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preferred Date</label>
                  <input 
                    type="date" 
                    required
                    className="premium-input px-4 h-12"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Time</label>
                  <input 
                    type="time" 
                    required
                    className="premium-input px-4 h-12"
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Session Type</label>
                  <select 
                    className="premium-input px-4 h-12 bg-slate-900 appearance-none"
                    value={bookingForm.type}
                    onChange={(e) => setBookingForm({...bookingForm, type: e.target.value})}
                  >
                    <option>Video Call</option>
                    <option>In-person Clinic</option>
                    <option>Home Visit</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes (optional)</label>
                  <input
                    type="text"
                    className="premium-input px-4 h-12 w-full"
                    placeholder="Reason for visit, symptoms, etc."
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 h-12 font-black shadow-indigo-500/10 shadow-lg"
                  >
                    {submitting ? 'BOOKING...' : 'CONFIRM'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        <div className="glass-panel border-slate-700/50 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading Schedule...</p>
              </div>
            ) : sessions.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Appointment</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {user?.role === 'patient' ? 'Specialist' : 'Patient'}
                    </th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Modality</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sessions.map((session) => (
                    <tr key={session._id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-black text-slate-100 text-sm">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 uppercase">{session.time}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs font-black text-indigo-400">
                            {user?.role === 'patient' 
                              ? (session.professional?.firstName?.[0] || 'D')
                              : (session.patient?.firstName?.[0] || 'P')}
                          </div>
                          <div className="font-bold text-slate-200 text-sm">
                            {user?.role === 'patient' 
                              ? `Dr. ${session.professional?.firstName || 'Assigned'} ${session.professional?.lastName || 'Expert'}`
                              : `${session.patient?.firstName || ''} ${session.patient?.lastName || ''}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <span className="text-base">{session.type === 'Video Call' ? '🎥' : session.type === 'Home Visit' ? '🏠' : '🏥'}</span>
                          {session.type}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex">
                          {getStatusBadge(session.status)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {(session.status === 'upcoming' || session.status === 'pending' || session.status === 'approved') && user?.role === 'patient' && (
                          <div className="flex gap-3 justify-end items-center">
                            <button 
                              onClick={() => cancelSession(session._id)}
                              className="text-red-400 hover:text-red-300 font-black text-[9px] uppercase tracking-widest transition-colors underline decoration-red-900/50 underline-offset-4"
                            >
                              Cancel
                            </button>
                            {session.type === 'Video Call' && session.status === 'approved' && (
                              <button className="h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
                                Join Call
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-800/40 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border border-slate-700/30">
                  📅
                </div>
                <h3 className="text-xl font-bold text-slate-200">No sessions scheduled</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Book your first recovery session with a professional to get started on your plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionScheduling;
