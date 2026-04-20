import React, { useState, useEffect } from 'react';
import { Navbar, PageHeader, TabBar } from '../components/Layout';
import { Card, Button, Badge } from '../components/UIComponents';
import apiClient from '../services/apiClient';

const Support = () => {
  const [activeTab, setActiveTab] = useState('professionals');
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    { id: 'all', label: 'All Professionals' },
    { id: 'physiotherapist', label: 'Physiotherapist' },
    { id: 'sports-medicine', label: 'Sports Medicine' },
    { id: 'orthopedic', label: 'Orthopedic' },
    { id: 'post-surgery', label: 'Post-Surgery Recovery' }
  ];

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    let filtered = professionals;
    if (searchQuery) {
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(prof =>
        prof.specialization.toLowerCase().includes(selectedSpecialty)
      );
    }
    setFilteredProfessionals(filtered);
  }, [professionals, searchQuery, selectedSpecialty]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/professionals');
      setProfessionals(response.data.professionals || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatNow = (professional) => {
    alert(`Opening chat with ${professional.name}...`);
  };

  const handleBookAppointment = (professionalId) => {
    const prof = professionals.find(p => p._id === professionalId);
    alert(`Booking appointment with ${prof?.name}`);
  };

  const handleCall = (professional) => {
    alert(`Initiating call with ${professional.name}...`);
  };

  const handleVideo = (professional) => {
    alert(`Starting video call with ${professional.name}...`);
  };

  const tabs = [
    { id: 'professionals', label: 'Find Professionals' },
    { id: 'active', label: 'Active Chats' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <PageHeader
          title="🤝 Support & Healthcare Experts"
          subtitle="Connect with top-tier rehabilitation professionals for specialized guidance"
        />

        <div className="mb-10">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {activeTab === 'professionals' && (
          <div className="animate-fade-in-up">
            <div className="mb-10 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name, expertise, or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="premium-input pl-12 h-14"
                  />
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {specialties.map(specialty => (
                  <button
                    key={specialty.id}
                    onClick={() => setSelectedSpecialty(specialty.id)}
                    className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border shadow-sm ${
                      selectedSpecialty === specialty.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20'
                        : 'glass-card bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {specialty.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProfessionals.map(professional => (
                  <Card key={professional._id} className="group hover:-translate-y-1 transition-all duration-300 border-slate-700/50 flex flex-col h-full bg-slate-900/40">
                    <div className="relative mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20">
                          {professional.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                            {professional.name}
                          </h3>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">
                            {professional.specialization}
                          </p>
                        </div>
                        {professional.online && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between py-2 border-y border-slate-800/50">
                        <span className="text-yellow-500 font-bold flex items-center gap-1 text-sm">
                          ⭐ {professional.rating} <span className="text-slate-500 font-medium text-[10px] ml-1">({professional.reviews} reviews)</span>
                        </span>
                        <div className="flex gap-1">
                          {professional.services?.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="primary" className="text-[9px] h-5">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Next Available</p>
                        <p className="text-sm font-bold text-indigo-300">📅 {professional.nextAvailable}</p>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleCall(professional)}
                          className="py-2.5 glass-card bg-slate-800/60 border-slate-700/50 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => handleVideo(professional)}
                          className="py-2.5 glass-card bg-slate-800/60 border-slate-700/50 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700/80 transition-all flex items-center justify-center gap-2"
                        >
                          📹 Video
                        </button>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full h-11 font-black shadow-indigo-500/10 shadow-lg"
                        onClick={() => handleChatNow(professional)}
                      >
                        💬 Start Chat
                      </Button>
                      <button
                        onClick={() => handleBookAppointment(professional._id)}
                        className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
                      >
                        Book Full Appointment
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-panel border-dashed border-2 border-slate-700/50 rounded-3xl">
                <div className="text-6xl mb-6 opacity-30">🔍</div>
                <h3 className="text-2xl font-bold text-slate-400">No experts found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="animate-fade-in-up">
            <div className="text-center py-20 glass-panel border-dashed border-2 border-slate-700/50 rounded-3xl">
              <div className="text-6xl mb-6 opacity-30">💬</div>
              <h3 className="text-2xl font-bold text-slate-400">No active conversations</h3>
              <p className="text-slate-500 mt-2">Select a professional from the grid to start a session.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
