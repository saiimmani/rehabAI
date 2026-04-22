import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Navbar, PageHeader, TabBar } from '../components/Layout';
import { Card, Button, StatsGrid, EmptyState, Skeleton, Modal, Alert } from '../components/UIComponents';
import { physiotherapistsAPI, exercisesAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';

const PhysiotherapistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('patients');
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [sending, setSending] = useState(false);

  // Socket for emergency alerts
  const { socket } = useContext(SocketContext);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('emergency_alert', (data) => {
        setEmergencyAlerts(prev => [...prev, data]);
      });
      return () => socket.off('emergency_alert');
    }
  }, [socket]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, exercisesRes] = await Promise.all([
        physiotherapistsAPI.getPatients(),
        exercisesAPI.getAllExercises()
      ]);
      
      setAssignedPatients(patientsRes.data.patients || []);
      setExercises(exercisesRes.data.exercises || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

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
      fetchData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="p-6"><Skeleton count={3} /></div></div>;

  const tabs = [
    { id: 'patients', label: `My Patients (${assignedPatients.length})` }
  ];

  const stats = [
    { label: 'Assigned Patients', value: assignedPatients.length },
    { label: 'Available Exercises', value: exercises.length },
    { label: 'Dashboard Mode', value: 'Physiotherapist' }
  ];

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <Navbar />
      
      {/* Emergency Alerts Overlay */}
      {emergencyAlerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-4 space-y-2 z-50 relative">
          {emergencyAlerts.map((alert, idx) => (
            <Alert 
              key={idx}
              variant="danger"
              title={`⚠️ CRITICAL: Patient ${alert.patientName} (Pain Level: ${alert.painLevel}/10)`}
              message={alert.message}
              onClose={() => setEmergencyAlerts(prev => prev.filter((_, i) => i !== idx))}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <PageHeader 
          title={`Dr. ${user?.lastName || user?.firstName}'s Dashboard`}
          subtitle="Manage your assigned patients and their recovery plans"
        />

        <StatsGrid stats={stats} />
        <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* My Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>👥</span> My Assigned Patients
              </h2>
            </div>
            
            {assignedPatients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedPatients.map((patient) => (
                  <Card key={patient._id} className="border-t-4 border-emerald-500 hover:-translate-y-1 transition-transform group relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 pointer-events-none"></div>
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-100 drop-shadow-sm mb-1">
                        {patient.patientId?.firstName || 'Unknown'} {patient.patientId?.lastName || 'Patient'}
                      </h3>
                      <p className="text-sm text-slate-400">{patient.patientId?.email || 'No email'}</p>
                      {patient.patientId?.phone && (
                        <p className="text-sm text-slate-400 mt-1">{patient.patientId?.phone}</p>
                      )}
                      {patient.patientId?.age && (
                        <p className="text-sm text-slate-400 mt-1">Age: <span className="text-slate-300 font-medium">{patient.patientId?.age}</span></p>
                      )}
                    </div>

                    {patient.injuryType && (
                      <div className="mb-3 p-3 bg-red-900/20 rounded-xl border border-red-500/30">
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">Condition</p>
                        <p className="text-sm text-slate-200">{patient.injuryType}</p>
                      </div>
                    )}

                    {patient.rehabilitationPlan && (
                      <div className="mb-4 p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Rehabilitation Plan</p>
                        <p className="text-sm text-slate-200 line-clamp-2" title={patient.rehabilitationPlan}>{patient.rehabilitationPlan}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowExerciseModal(true);
                        }}
                        className="flex-1"
                      >
                        + Exercise
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/mentor/patient/${patient.patientId?._id}/progress`)}
                        className="flex-1"
                      >
                        Progress →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon="👥"
                title="No patients assigned yet"
                description="New patients will appear here automatically when assigned."
              />
            )}
          </div>
        )}
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
};

export default PhysiotherapistDashboard;
