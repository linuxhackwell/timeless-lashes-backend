const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET: Fetch all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error });
  }
});

// POST: Add a new employee
router.post('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, phone, assignedServices } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const newEmployee = new Employee({
      name,
      email,
      phone,
      assignedServices: assignedServices ? assignedServices.split(',') : [],
      profilePicture,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Error adding employee', error });
  }
});

// PUT: Update an employee by ID
router.put('/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, assignedServices } = req.body;
    employeeToUpdate.profilePicture = profilePicture 
    ? `/uploads/${profilePicture}` 
    : employeeToUpdate.profilePicture;
  
    const employeeToUpdate = await Employee.findById(id);

    if (!employeeToUpdate) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete existing profile picture if a new one is uploaded
    if (profilePicture && employeeToUpdate.profilePicture) {
      fs.unlinkSync(path.join(__dirname, '../uploads', employeeToUpdate.profilePicture));
    }

    // Update fields
    employeeToUpdate.name = name || employeeToUpdate.name;
    employeeToUpdate.email = email || employeeToUpdate.email;
    employeeToUpdate.phone = phone || employeeToUpdate.phone;
    employeeToUpdate.assignedServices = assignedServices ? assignedServices.split(',') : employeeToUpdate.assignedServices;
    employeeToUpdate.profilePicture = profilePicture || employeeToUpdate.profilePicture;

    const updatedEmployee = await employeeToUpdate.save();
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee', error });
  }
});

// DELETE: Delete an employee by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const employeeToDelete = await Employee.findByIdAndDelete(id);

    if (!employeeToDelete) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete the profile picture if exists
    if (employeeToDelete.profilePicture) {
      fs.unlinkSync(path.join(__dirname, '../uploads', employeeToDelete.profilePicture));
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error });
  }
});

module.exports = router;
