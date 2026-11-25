const express = require('express');
const router = express.Router();
const controller = require('../controllers/Student');

router.get('/', controller.getAllStudents);
router.post('/', controller.addStudent);
router.get('/:id', controller.getStudentReport);
router.delete('/:id', controller.deleteStudent);

module.exports = router;