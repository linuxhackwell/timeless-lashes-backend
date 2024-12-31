const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Sample data (replace with database queries)
const sampleAppointments = [
    {
        id: 1,
        clientName: 'Jane Doe',
        date: '2024-11-26',
        time: '10:00 AM',
        service: 'Lash Extension',
        status: 'Pending',
        notes: ''
    },
    {
        id: 2,
        clientName: 'John Smith',
        date: '2024-11-26',
        time: '02:00 PM',
        service: 'Brow Tinting',
        status: 'Confirmed',
        notes: 'Prefers natural look'
    }
];

// Get all appointments
router.get('/', protect, async (req, res) => {
    try {
        res.json(sampleAppointments); // Replace with actual DB fetch
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
});

// Update appointment status
router.put('/:id/status', protect, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Find and update (replace with actual DB update logic)
        const appointment = sampleAppointments.find(appt => appt.id === parseInt(id));
        if (appointment) {
            appointment.status = status;
            res.json({ message: 'Status updated successfully', appointment });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment status', error });
    }
});

// Add notes to an appointment
router.put('/:id/notes', protect, async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;

    try {
        // Find and update (replace with actual DB update logic)
        const appointment = sampleAppointments.find(appt => appt.id === parseInt(id));
        if (appointment) {
            appointment.notes = notes;
            res.json({ message: 'Notes added successfully', appointment });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error adding notes to appointment', error });
    }
});

module.exports = router;
