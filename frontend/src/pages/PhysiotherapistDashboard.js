import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { physiotherapistsAPI, exercisesAPI } from '../services/api';
import { Navbar, PageHeader } from '../components/Layout';
import { Modal, Button } from '../components/UIComponents';

export default function PhysiotherapistDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, exercisesRes] = await Promise.all([
          physiotherapistsAPI.getPatients(),
          exercisesAPI.getAllExercises()
        ]);
        setPatients(patientsRes.data.patients || []);
        setExercises(exercisesRes.data.exercises || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignExercise = async () => {
    if (!selectedPatient || !selectedExerciseId) {
      alert('Please select both patient and exercise');
      return;
    }

    setSending(true);
    try {
      await physiotherapistsAPI.assignExercise({
        patientId: selectedPatient.patientId?._id,
        exerciseId: selectedExerciseId
      });
      alert('Exercise assigned successfully!');
      setShowExerciseModal(false);
      setSelectedExerciseId('');
      setSelectedPatient(null);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <PageHeader 
            title={`👋 Welcome back, Dr. ${user?.firstName}!`}
            subtitle="Manage your patients, track their progress, and assign new recovery exercises."
          />
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-black uppercase tracking-widest">
              Physiotherapist Mode
            </span>
          </div>
        </div>

        {error && (
          <div className="glass-card border-red-500/30 bg-red-500/10 p-4 mb-8 animate-fade-in-up">
            <p className="text-red-400 font-bold text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Quick Stats & Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-fade-in-up">
          <button
            onClick={() => navigate('/exercises')}
            className="glass-card border-indigo-500/30 bg-indigo-500/10 p-6 group hover:bg-indigo-500/20 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform">➕</div>
            <span className="text-3xl block mb-4">🏋️‍♂️</span>
            <p className="font-black text-slate-100 text-lg">Create Exercise</p>
            <p className="text-indigo-400 text-xs mt-1 font-bold">Add to the library</p>
          </button>
          
          <button
            onClick={() => navigate('/messaging')}
            className="glass-card border-purple-500/30 bg-purple-500/10 p-6 group hover:bg-purple-500/20 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform">💬</div>
            <span className="text-3xl block mb-4">✉️</span>
            <p className="font-black text-slate-100 text-lg">Messages</p>
            <p className="text-purple-400 text-xs mt-1 font-bold">Contact patients</p>
          </button>

          <div className="glass-panel border-emerald-500/30 bg-emerald-500/10 p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-7xl opacity-10">👥</div>
            <span className="text-3xl block mb-4">🏥</span>
            <p className="font-black text-slate-100 text-lg">Active Patients</p>
            <p className="text-emerald-400 text-2xl font-black mt-1 ml-1">{patients.length}</p>
          </div>
        </div>

        {/* Patients Table Section */}
        <div className="glass-panel border-slate-700/50 overflow-hidden animate-fade-in-up [animation-delay:200ms]">
          <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="text-indigo-400">📋</span> Assigned Patients
            </h3>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Find a patient..." 
                className="premium-input pl-9 py-1.5 text-xs w-48 focus:w-64 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {patients.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient Name</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Condition</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Rehab Plan</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs">
                            {patient.patientId?.firstName?.[0] || '?'}{patient.patientId?.lastName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 text-sm">
                              {patient.patientId?.firstName || 'Unknown'} {patient.patientId?.lastName || 'Patient'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">{patient.patientId?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700/50">
                          {patient.injuryType || 'No diagnosis'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-slate-400 font-medium max-w-[200px] truncate italic">
                          "{patient.rehabilitationPlan || 'AI assisted plan pending'}"
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowExerciseModal(true);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-1 group/btn"
                        >
                          <span className="text-sm">+</span> Assign
                        </button>
                        <button
                          onClick={() => navigate(`/mentor/patient/${patient.patientId?._id}/progress`)}
                          className="text-indigo-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2 group/btn"
                        >
                          View Progress 
                          <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="text-5xl mb-4 opacity-20">📭</div>
                <p className="text-slate-500 font-bold">No patients assigned to your roster yet.</p>
                <p className="text-slate-600 text-xs mt-1">New assignments will appear here automatically.</p>
              </div>
            )}
          </div>
          
          <div className="px-8 py-4 bg-slate-900/30 border-t border-slate-700/50 flex justify-between items-center">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
              RehabAI Clinical Interface v2.0
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-[10px] font-black border border-slate-700/50">Prev</button>
              <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded-md text-[10px] font-black border border-slate-700/50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Exercise Modal */}
      <Modal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setSelectedExerciseId('');
          setSelectedPatient(null);
        }}
        title={`Assign Exercise to ${selectedPatient?.patientId?.firstName || 'Patient'}`}
        size="md"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAssignExercise(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Select Exercise</label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="premium-input px-3 py-2 bg-slate-800"
              required
            >
              <option value="">-- Select exercise --</option>
              {exercises.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({ex.difficulty}) - {ex.category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => {
                setShowExerciseModal(false);
                setSelectedExerciseId('');
                setSelectedPatient(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              loading={sending}
            >
              Assign Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

}
