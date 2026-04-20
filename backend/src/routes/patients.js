const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/patients - Get all patients (accessible by doctors & physiotherapists)
router.get('/', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.status(200).json({ patients });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients', error: error.message });
  }
});

// GET /api/patients/:id - Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json({ patient });
  } catch (error) {
    console.error('Get patient by id error:', error);
    res.status(500).json({ message: 'Server error fetching patient', error: error.message });
  }
});

// POST /api/patients/:patientId/assign-physiotherapist
router.post('/:patientId/assign-physiotherapist', async (req, res) => {
  try {
    const { physiotherapistId } = req.body;
    const patient = await User.findById(req.params.patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    // Store assignment (basic implementation)
    patient.assignedPhysiotherapist = physiotherapistId;
    await patient.save();
    res.status(200).json({ message: 'Physiotherapist assigned successfully' });
  } catch (error) {
    console.error('Assign physiotherapist error:', error);
    res.status(500).json({ message: 'Server error assigning physiotherapist', error: error.message });
  }
});

module.exports = router;
