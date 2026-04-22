const { User, PatientProfile, Exercise, ExerciseSession, ExerciseLog } = require('../models');

// @route   GET /api/mentor/all-patients
// @desc    Get all patients in system (for connection)
// @access  Private (Physiotherapist)
exports.getAllPatients = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;

    const assignedProfiles = await PatientProfile.find({
      assignedPhysiotherapist: { $ne: null }
    }).select('patientId assignedPhysiotherapist');

    const assignedToOthersPatientIds = assignedProfiles
      .filter(
        (profile) =>
          profile.assignedPhysiotherapist &&
          profile.assignedPhysiotherapist.toString() !== physiotherapistId
      )
      .map((profile) => profile.patientId);

    const allPatients = await User.find({
      role: 'patient',
      _id: { $nin: assignedToOthersPatientIds }
    })
      .select('_id firstName lastName email phone age uniqueId')
      .sort({ firstName: 1 });

    if (!allPatients || allPatients.length === 0) {
      return res.status(200).json({ 
        message: 'No patients available',
        patients: [] 
      });
    }

    res.status(200).json({ 
      message: `Found ${allPatients.length} patient(s)`,
      patients: allPatients
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients', error: error.message });
  }
};

// @route   POST /api/mentor/assign-patient
// @desc    Directly assign patient to physiotherapist
// @access  Private (Physiotherapist)
exports.assignPatient = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const patientUser = await User.findById(patientId);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const physioUser = await User.findById(physiotherapistId);
    if (!physioUser || physioUser.role !== 'physiotherapist') {
      return res.status(403).json({ message: 'You are not authorized as a physiotherapist' });
    }

    let patientProfile = await PatientProfile.findOne({ patientId });
    
    if (!patientProfile) {
      patientProfile = await PatientProfile.create({
        patientId,
        assignedPhysiotherapist: physiotherapistId
      });
    } else {
      const currentlyAssignedPhysioId = patientProfile.assignedPhysiotherapist
        ? patientProfile.assignedPhysiotherapist.toString()
        : null;

      if (currentlyAssignedPhysioId && currentlyAssignedPhysioId !== physiotherapistId) {
        return res.status(409).json({
          message: 'Patient is already assigned to another physiotherapist'
        });
      }

      patientProfile.assignedPhysiotherapist = physiotherapistId;
      await patientProfile.save();
    }

    await patientProfile.populate('patientId', 'firstName lastName email phone age');

    res.status(200).json({
      message: 'Patient assigned successfully',
      patientProfile
    });
  } catch (error) {
    console.error('Assign patient error:', error);
    res.status(500).json({ message: 'Server error assigning patient', error: error.message });
  }
};

// @route   GET /api/mentor/patients
// @desc    Get all patients assigned to physiotherapist
// @access  Private (Physiotherapist)
exports.getPatients = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;

    const patients = await PatientProfile.find({ assignedPhysiotherapist: physiotherapistId })
      .populate('patientId', 'firstName lastName email phone age')
      .populate('assignedDoctor', 'firstName lastName email');

    if (!patients || patients.length === 0) {
      return res.status(200).json({ 
        message: 'No patients assigned',
        patients: [] 
      });
    }

    res.status(200).json({ 
      message: `Found ${patients.length} assigned patient(s)`,
      patients 
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients', error: error.message });
  }
};

// @route   POST /api/mentor/add-exercise
// @desc    Create new exercise for rehabilitation
// @access  Private (Physiotherapist)
exports.addExercise = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;
    const { name, description, category, difficulty, duration, repetitions, bodyParts, instructions, imageUrl, videoUrl } = req.body;

    // Validate required fields
    if (!name || !description || !category || !difficulty) {
      return res.status(400).json({ message: 'Name, description, category, and difficulty are required' });
    }

    // Create exercise
    const exercise = await Exercise.create({
      name,
      description,
      category,
      difficulty,
      duration,
      repetitions,
      bodyParts: bodyParts || [],
      instructions,
      imageUrl,
      videoUrl,
      createdBy: physiotherapistId,
      isActive: true
    });

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise
    });
  } catch (error) {
    console.error('Add exercise error:', error);
    res.status(500).json({ message: 'Server error creating exercise', error: error.message });
  }
};

// @route   POST /api/mentor/assign-exercise
// @desc    Assign exercise to patient
// @access  Private (Physiotherapist)
exports.assignExercise = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;
    const { patientId, exerciseId } = req.body;

    // Validate input
    if (!patientId || !exerciseId) {
      return res.status(400).json({ message: 'Patient ID and Exercise ID are required' });
    }

    // Verify patient is assigned to this physiotherapist
    const patientProfile = await PatientProfile.findOne({
      patientId,
      assignedPhysiotherapist: physiotherapistId
    });

    if (!patientProfile) {
      return res.status(403).json({ message: 'Patient not assigned to you' });
    }

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Create exercise session
    const session = await ExerciseSession.create({
      patient: patientId,
      exercise: exerciseId,
      physiotherapist: physiotherapistId,
      sessionDate: new Date(),
      completionStatus: 'pending'
    });

    res.status(201).json({
      message: 'Exercise assigned successfully',
      session: await session.populate('exercise patient', 'name firstName lastName')
    });
  } catch (error) {
    console.error('Assign exercise error:', error);
    res.status(500).json({ message: 'Server error assigning exercise', error: error.message });
  }
};

// @route   POST /api/mentor/update-progress
// @desc    Update patient exercise progress/session
// @access  Private (Physiotherapist)
exports.updateProgress = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;
    const { sessionId } = req.params;
    const { completionStatus, durationCompleted, repsCompleted, feedback, notes, pain_level, effort_level } = req.body;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Get and verify session belongs to this physiotherapist
    const session = await ExerciseSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.physiotherapist.toString() !== physiotherapistId) {
      return res.status(403).json({ message: 'You can only update sessions you created' });
    }

    // Update session
    const updatedSession = await ExerciseSession.findByIdAndUpdate(
      sessionId,
      {
        completionStatus,
        durationCompleted,
        repsCompleted,
        feedback,
        notes,
        pain_level,
        effort_level,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('exercise patient', 'name firstName lastName');

    res.status(200).json({
      message: 'Progress updated successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error updating progress', error: error.message });
  }
};

// @route   GET /api/mentor/patient/:patientId/progress
// @desc    Get patient's progress and exercise logs
// @access  Private (Physiotherapist)
exports.getPatientProgress = async (req, res) => {
  try {
    const physiotherapistId = req.user.userId;
    const { patientId } = req.params;

    // Verify patient is assigned to this physiotherapist
    const patientProfile = await PatientProfile.findOne({
      patientId,
      assignedPhysiotherapist: physiotherapistId
    });

    if (!patientProfile) {
      return res.status(403).json({ message: 'Patient not assigned to you' });
    }

    // Get exercise logs
    const logs = await ExerciseLog.find({ patientId })
      .populate('exerciseId', 'name difficulty category')
      .sort({ date: -1 });

    // Get exercise sessions
    const sessions = await ExerciseSession.find({ patient: patientId })
      .populate('exercise', 'name difficulty')
      .sort({ sessionDate: -1 });

    res.status(200).json({
      patientProfile,
      logs,
      sessions
    });
  } catch (error) {
    console.error('Get patient progress error:', error);
    res.status(500).json({ message: 'Server error fetching progress', error: error.message });
  }
};
