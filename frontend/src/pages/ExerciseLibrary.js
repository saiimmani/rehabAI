import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { exercisesAPI } from '../services/api';
import { Navbar, PageHeader } from '../components/Layout';
import { Card, Button, Badge, Input, Skeleton, EmptyState, Modal } from '../components/UIComponents';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const defaultExerciseForm = {
  name: '',
  description: '',
  category: 'stretching',
  difficulty: 'moderate',
  durationValue: '',
  durationUnit: 'minutes',
  repetitions: '',
  bodyParts: '',
  videoUrl: '',
  imageUrl: '',
  instructionFileUrl: '',
  instructions: '',
  videoFile: null,
  imageFile: null,
  instructionFile: null
};

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url}`;
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
  } catch (error) {
    return url;
  }

  return url;
};

const buildExerciseFormData = (formState) => {
  const formData = new FormData();

  formData.append('name', formState.name);
  formData.append('description', formState.description);
  formData.append('category', formState.category);
  formData.append('difficulty', formState.difficulty);
  formData.append('durationValue', formState.durationValue);
  formData.append('durationUnit', formState.durationUnit);
  formData.append('repetitions', formState.repetitions);
  formData.append('bodyParts', formState.bodyParts);
  formData.append('videoUrl', formState.videoUrl);
  formData.append('imageUrl', formState.imageUrl);
  formData.append('instructionFileUrl', formState.instructionFileUrl);
  formData.append('instructions', formState.instructions);

  if (formState.videoFile) {
    formData.append('videoFile', formState.videoFile);
  }

  if (formState.imageFile) {
    formData.append('imageFile', formState.imageFile);
  }

  if (formState.instructionFile) {
    formData.append('instructionFile', formState.instructionFile);
  }

  return formData;
};

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

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState(defaultExerciseForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');

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
      const response = await exercisesAPI.getAllExercises();
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

  const openCreateModal = () => {
    setEditingExercise(null);
    setExerciseForm(defaultExerciseForm);
    setShowFormModal(true);
  };

  const openEditModal = (exercise) => {
    setEditingExercise(exercise);
    setExerciseForm({
      name: exercise.name || '',
      description: exercise.description || '',
      category: exercise.category || 'stretching',
      difficulty: exercise.difficulty || 'moderate',
      durationValue: exercise.duration?.value ?? '',
      durationUnit: exercise.duration?.unit || 'minutes',
      repetitions: exercise.repetitions ?? '',
      bodyParts: Array.isArray(exercise.bodyParts) ? exercise.bodyParts.join(', ') : '',
      videoUrl: exercise.videoUrl || '',
      imageUrl: exercise.imageUrl || '',
      instructionFileUrl: exercise.instructionFileUrl || '',
      instructions: exercise.instructions || '',
      videoFile: null,
      imageFile: null,
      instructionFile: null
    });
    setShowFormModal(true);
  };

  const handleSaveExercise = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildExerciseFormData(exerciseForm);

      if (editingExercise?._id) {
        await exercisesAPI.updateExercise(editingExercise._id, payload);
      } else {
        await exercisesAPI.createExercise(payload);
      }

      alert('Exercise created successfully!');
      setShowFormModal(false);
      setEditingExercise(null);
      setExerciseForm(defaultExerciseForm);
      fetchExercises();
    } catch (err) {
      alert('Error saving exercise: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Delete this exercise? It will be hidden from the library.')) {
      return;
    }

    setDeletingId(exerciseId);
    try {
      await exercisesAPI.deleteExercise(exerciseId);
      fetchExercises();
    } catch (error) {
      alert('Error deleting exercise: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId('');
    }
  };



  const handleStartExercise = (exerciseId) => {
    // Navigate to exercise detail/start page
    window.location.href = `/exercise/${exerciseId}`;
  };

  const renderExerciseCard = (exercise) => (
    <Card key={exercise._id} className="flex flex-col h-full hover:shadow-xl transition-all duration-200">
      {exercise.videoUrl ? (
        <div className="mb-4 h-40 rounded-lg overflow-hidden relative bg-slate-900">
          {exercise.videoUrl.includes('youtube.com') || exercise.videoUrl.includes('youtu.be') ? (
            <iframe 
              src={getYouTubeEmbedUrl(resolveMediaUrl(exercise.videoUrl))} 
              title={exercise.name}
              className="w-full h-full absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <video
              controls
              className="w-full h-full object-cover"
              src={resolveMediaUrl(exercise.videoUrl)}
            />
          )}
        </div>
      ) : exercise.imageUrl ? (
        <div className="mb-4 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden">
          <img src={resolveMediaUrl(exercise.imageUrl)} alt={exercise.name} className="w-full h-full object-cover" />
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

      {exercise.instructions && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{exercise.instructions}</p>
      )}

      {exercise.instructionFileUrl && (
        <a
          href={resolveMediaUrl(exercise.instructionFileUrl)}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-blue-500 mb-2 inline-flex"
        >
          View instruction file
        </a>
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

      <div className="flex gap-2 mt-auto">
        {user?.role === 'physiotherapist' ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => openEditModal(exercise)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              loading={deletingId === exercise._id}
              onClick={() => handleDeleteExercise(exercise._id)}
            >
              Delete
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => handleStartExercise(exercise._id)}
          >
            ▶ Start Exercise
          </Button>
        )}
      </div>
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
            <Button variant="primary" onClick={openCreateModal}>
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

      {/* Add/Edit Exercise Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingExercise(null);
          setExerciseForm(defaultExerciseForm);
        }}
        title={editingExercise ? 'Edit Exercise' : 'Create New Exercise'}
        size="lg"
      >
        <form onSubmit={handleSaveExercise} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Exercise Name *"
              value={exerciseForm.name}
              onChange={(e) => setExerciseForm({...exerciseForm, name: e.target.value})}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Category *</label>
              <select 
                className="premium-input w-full"
                value={exerciseForm.category}
                onChange={(e) => setExerciseForm({...exerciseForm, category: e.target.value})}
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
            value={exerciseForm.description}
            onChange={(e) => setExerciseForm({...exerciseForm, description: e.target.value})}
            required
          />

          <Input
            label="Body Parts (comma separated)"
            value={exerciseForm.bodyParts}
            onChange={(e) => setExerciseForm({...exerciseForm, bodyParts: e.target.value})}
            placeholder="knee, shoulder, back"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Difficulty *</label>
              <select 
                className="premium-input w-full"
                value={exerciseForm.difficulty}
                onChange={(e) => setExerciseForm({...exerciseForm, difficulty: e.target.value})}
              >
                <option value="easy">Beginner</option>
                <option value="moderate">Intermediate</option>
                <option value="hard">Advanced</option>
              </select>
            </div>
            <Input
              label="Duration Value"
              type="number"
              value={exerciseForm.durationValue}
              onChange={(e) => setExerciseForm({...exerciseForm, durationValue: e.target.value})}
            />
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration Unit</label>
              <select 
                className="premium-input w-full"
                value={exerciseForm.durationUnit}
                onChange={(e) => setExerciseForm({...exerciseForm, durationUnit: e.target.value})}
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
              value={exerciseForm.repetitions}
              onChange={(e) => setExerciseForm({...exerciseForm, repetitions: e.target.value})}
            />
            <Input
              label="Image URL"
              value={exerciseForm.imageUrl}
              onChange={(e) => setExerciseForm({...exerciseForm, imageUrl: e.target.value})}
            />
          </div>

          <Input
            label="Video URL (YouTube or direct link)"
            value={exerciseForm.videoUrl}
            onChange={(e) => setExerciseForm({...exerciseForm, videoUrl: e.target.value})}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Upload Video File</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setExerciseForm({...exerciseForm, videoFile: e.target.files?.[0] || null})}
                className="premium-input w-full py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instruction File</label>
              <input
                type="file"
                accept="application/pdf,.doc,.docx,.txt"
                onChange={(e) => setExerciseForm({...exerciseForm, instructionFile: e.target.files?.[0] || null})}
                className="premium-input w-full py-2"
              />
            </div>
          </div>

          <Input
            label="Instruction File URL"
            value={exerciseForm.instructionFileUrl}
            onChange={(e) => setExerciseForm({...exerciseForm, instructionFileUrl: e.target.value})}
            placeholder="Optional remote file link"
          />

          <Input
            label="Instructions"
            value={exerciseForm.instructions}
            onChange={(e) => setExerciseForm({...exerciseForm, instructions: e.target.value})}
          />

          {editingExercise && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300 space-y-2">
              <p className="font-semibold text-slate-100">Current attachments</p>
              <p>Video: {editingExercise.videoUrl ? 'Present' : 'None'}</p>
              <p>Instruction file: {editingExercise.instructionFileUrl ? 'Present' : 'None'}</p>
              <p>Image: {editingExercise.imageUrl ? 'Present' : 'None'}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-700/50 mt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setShowFormModal(false);
                setEditingExercise(null);
                setExerciseForm(defaultExerciseForm);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editingExercise ? 'Update Exercise' : 'Save Exercise'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
