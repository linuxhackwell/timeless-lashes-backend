const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Example Data Fetching (Replace with real queries)
router.get('/metrics', protect, async (req, res) => {
    try {
        const metrics = {
            totalAppointments: 120,
            revenue: 5000,
            activePromotions: 3,
            newUsers: 25,
            systemNotifications: [
                { type: 'Error', message: 'Payment gateway timeout', date: '2024-11-25' },
                { type: 'Info', message: 'New promotion activated', date: '2024-11-24' }
            ]
        };
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching metrics', error });
    }
});

// Example Revenue Trend Data
router.get('/revenue-trends', protect, async (req, res) => {
    try {
        const trends = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            data: [500, 700, 800, 900, 1200, 1500]
        };
        res.json(trends);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trends', error });
    }
});

// Example Service Popularity Data
router.get('/service-popularity', protect, async (req, res) => {
    try {
        const popularity = {
            labels: ['Service A', 'Service B', 'Service C', 'Service D'],
            data: [35, 25, 20, 20]
        };
        res.json(popularity);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching service popularity', error });
    }
});

module.exports = router;
