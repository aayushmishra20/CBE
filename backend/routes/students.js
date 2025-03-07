const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/Student');

// Get all students
router.get('/', StudentController.getAllStudents);

// Add a new student
router.post('/', StudentController.addStudent);

// Get student report
router.get('/:id', StudentController.getStudentReport);

module.exports = router;