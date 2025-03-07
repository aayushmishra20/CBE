const Student = require('../models/Students');

// Get all students
const getAllStudents = (req, res) => {
    Student.getAll((err, students) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.json(students);
        }
    });
};

// Add a new student
const addStudent = (req, res) => {
    const { name, subjects } = req.body;

    // Validate the request data
    if (!name || !subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ message: 'Invalid data. Name and subjects are required.' });
    }

    // Calculate average score
    const totalMarks = subjects.reduce((sum, subject) => sum + subject.marks, 0);
    const averageScore = totalMarks / subjects.length;

    // Dummy skillset prediction based on average score
    let skillsetPrediction = 'Beginner';
    if (averageScore > 80) skillsetPrediction = 'Advanced';
    else if (averageScore > 60) skillsetPrediction = 'Intermediate';

    const student = { name, subjects: JSON.stringify(subjects), averageScore, skillsetPrediction };
    Student.add(student, (err) => {
        if (err) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(201).json({ message: 'Student added successfully', student });
        }
    });
};

// Get student report
const getStudentReport = (req, res) => {
    const { id } = req.params;
    Student.getById(id, (err, student) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.json(student);
        }
    });
};

// Export all functions
module.exports = {
    getAllStudents,
    addStudent,
    getStudentReport,
};