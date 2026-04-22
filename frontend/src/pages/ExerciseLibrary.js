import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { physiotherapistsAPI } from '../services/api';
import { Navbar, PageHeader } from '../components/Layout';
import { Card, Button, Badge, Input, Skeleton, EmptyState, Modal } from '../components/UIComponents';
import apiClient from '../services/apiClient';

const ExerciseLibrary = () => {
  const { user } = useContext(AuthContext);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    thisWeek: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    category: 'stretching',
    difficulty: 'moderate',
    durationValue: '',
    durationUnit: 'minutes',
    repetitions: '',
    videoUrl: '',
    imageUrl: '',
    instructions: ''
  });
  const [adding, setAdding] = useState(false);

  const categories = [
    { id: 'all', label: 'All Exercises', icon: '🏃' },
    { id: 'knee', label: 'Knee', icon: '🦵' },
    { id: 'shoulder', label: 'Shoulder', icon: '💪' },
    { id: 'back', label: 'Back', icon: '🔙' },
    { id: 'hip', label: 'Hip', icon: '🧘' }
  ];

  const difficultyLevels = {
    easy: 'Beginner',
    moderate: 'Intermediate',
    hard: 'Advanced'
  };

  const difficultyColors = {
    easy: 'green',
    moderate: 'yellow',
    hard: 'red'
  };

  const filterExercises = useCallback(() => {
    let filtered = exercises;
    if (searchQuery) {
      filtered = filtered.filter(ex =>
        ex.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        ex.description?.toLowerCase()?.includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ex => {
        const bodyParts = ex.bodyParts || [];
        return bodyParts.some(part => part.toLowerCase().includes(selectedCategory));
      });
    }
    setFilteredExercises(filtered);
  }, [exercises, searchQuery, selectedCategory]);

  useEffect(() => {
    filterExercises();
  }, [filterExercises]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/exercises');
      setExercises(response.data.exercises || []);
      setStats(response.data.stats || { total: 0, completed: 0, thisWeek: 0 });
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchExercises(); }, []);

  const handleAddExercise = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const payload = {
        name: newExercise.name,
        description: newExercise.description,
        category: newExercise.category,
        difficulty: newExercise.difficulty,
        duration: {
          value: Number(newExercise.durationValue),
          unit: newExercise.durationUnit
        },
        repetitions: Number(newExercise.repetitions),
        videoUrl: newExercise.videoUrl,
        imageUrl: newExercise.imageUrl,
        instructions: newExercise.instructions
      };
      
      await physiotherapistsAPI.addExercise(payload);
      alert('Exercise created successfully!');
      setShowAddModal(false);
      setNewExercise({
        name: '', description: '', category: 'stretching', difficulty: 'moderate',
        durationValue: '', durationUnit: 'minutes', repetitions: '', videoUrl: '', imageUrl: '', instructions: ''
      });
      fetchExercises();
    } catch (err) {
      alert('Error creating exercise: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };



  const handleStartExercise = (exerciseId) => {
    // Navigate to exercise detail/start page
    window.location.href = `/exercise/${exerciseId}`;
  };

  const renderExerciseCard = (exercise) => (
    <Card key={exercise._id} className="flex flex-col h-full hover:shadow-xl transition-all duration-200">
      {exercise.videoUrl ? (
        <div className="mb-4 h-40 rounded-lg overflow-hidden relative">
          <iframe 
            src={exercise.videoUrl} 
            title={exercise.name}
            className="w-full h-full absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      ) : exercise.imageUrl ? (
        <div className="mb-4 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden">
          <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="mb-4 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-4xl">🏋️‍♂️</span>
        </div>
      )}
      
      <h3 className="text-lg font-bold text-gray-800 mb-2">{exercise.name}</h3>
      {exercise.description && (
        <p className="text-sm text-gray-600 mb-3 flex-grow">{exercise.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {exercise.duration && (
          <Badge variant="blue" className="text-xs">
            ⏱️ {exercise.duration.value} {exercise.duration.unit?.replace('s', '')}
          </Badge>
        )}
        {exercise.repetitions && (
          <Badge variant="blue" className="text-xs">
            🔄 {exercise.repetitions} reps
          </Badge>
        )}
        <Badge variant={difficultyColors[exercise.difficulty]} className="text-xs">
          {difficultyLevels[exercise.difficulty] || 'Moderate'}
        </Badge>
      </div>

      {exercise.status === 'completed' && (
        <div className="mb-3">
          <Badge variant="green" className="text-xs">✓ Done</Badge>
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => handleStartExercise(exercise._id)}
      >
        ▶ Start Exercise
      </Button>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton count={3} height={300} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <PageHeader
            title="Exercise Library"
            subtitle="Browse and start your personalized rehabilitation exercises"
          />
          {user?.role === 'physiotherapist' && (
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              + Create Exercise
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Total Exercises</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">Completed</div>
            <div className="text-3xl font-bold">{stats.completed}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
            <div className="text-sm opacity-90 mb-1">This Week</div>
            <div className="text-3xl font-bold">{stats.thisWeek}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="mb-6">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map(exercise => renderExerciseCard(exercise))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="No exercises found"
            subtitle={searchQuery ? "Try a different search term" : "Select another category"}
          />
        )}
      </div>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Exercise"
        size="lg"
      >
        <form onSubmit={handleAddExercise} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Exercise Name *"
              value={newExercise.name}
              onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category *</label>
              <select 
                className="premium-input w-full"
                value={newExercise.category}
                onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
              >
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
                <option value="stretching">Stretching</option>
                <option value="strengthening">Strengthening</option>
                <option value="balance">Balance</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Description *"
            value={newExercise.description}
            onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty *</label>
              <select 
                className="premium-input w-full"
                value={newExercise.difficulty}
                onChange={(e) => setNewExercise({...newExercise, difficulty: e.target.value})}
              >
                <option value="easy">Beginner</option>
                <option value="moderate">Intermediate</option>
                <option value="hard">Advanced</option>
              </select>
            </div>
            <Input
              label="Duration Value"
              type="number"
              value={newExercise.durationValue}
              onChange={(e) => setNewExercise({...newExercise, durationValue: e.target.value})}
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration Unit</label>
              <select 
                className="premium-input w-full"
                value={newExercise.durationUnit}
                onChange={(e) => setNewExercise({...newExercise, durationUnit: e.target.value})}
              >
                <option value="minutes">Minutes</option>
                <option value="seconds">Seconds</option>
                <option value="reps">Reps</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Repetitions"
              type="number"
              value={newExercise.repetitions}
              onChange={(e) => setNewExercise({...newExercise, repetitions: e.target.value})}
            />
            <Input
              label="Image URL"
              value={newExercise.imageUrl}
              onChange={(e) => setNewExercise({...newExercise, imageUrl: e.target.value})}
            />
          </div>

          <Input
            label="Video URL (YouTube embed link)"
            value={newExercise.videoUrl}
            onChange={(e) => setNewExercise({...newExercise, videoUrl: e.target.value})}
          />

          <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-4">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={adding}>Save Exercise</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
