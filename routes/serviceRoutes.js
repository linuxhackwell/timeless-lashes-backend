const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Service = require('../models/Service');
const router = express.Router();

// Ensure the uploads folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// @route GET /api/services
// @desc Get all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// @route POST /api/services
// @desc Add a new service
router.post(
  '/',
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price } = req.body;
    //const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;


    try {
      const newService = new Service({
        name,
        description,
        price,
        image: imagePath,
      });
      await newService.save();
      res.status(201).json({ message: 'Service added successfully', newService });
    } catch (error) {
      console.error('Error in POST /api/services:', error.message);
      res.status(500).json({ error: 'Failed to add service' });
    }
  }
);

// @route PUT /api/services/:id
// @desc Update an existing service
router.put(
  '/:id',
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price } = req.body;
    const imagePath = req.file ? req.file.path : null;

    try {
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      service.name = name;
      service.description = description;
      service.price = price;
      if (imagePath) {
        service.image = imagePath;
      }

      await service.save();
      res.status(200).json({ message: 'Service updated successfully', service });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update service' });
    }
  }
);

// DELETE: Delete a service by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Find the service by ID and delete it
      const deletedService = await Service.findByIdAndDelete(id);
  
      if (!deletedService) {
        return res.status(404).json({ message: 'Service not found.' });
      }
  
      res.status(200).json({ message: 'Service deleted successfully.' });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({ message: 'Server error. Unable to delete the service.' });
    }
  });

module.exports = router;
