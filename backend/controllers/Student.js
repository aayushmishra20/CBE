const Student = require('../models/Students');

function normalizeStudent(row) {
  if (!row) return row;
  let subjects = [];
  try { subjects = JSON.parse(row.subjects || '[]'); } catch (_) { subjects = []; }
  return { ...row, subjects };
}

function classify(score) {
  if (score >= 85) return 'Workforce Ready';
  if (score >= 70) return 'Proficient';
  if (score >= 50) return 'Developing';
  return 'Needs Support';
}

const getAllStudents = (_req, res) => {
  Student.getAll((error, rows) => {
    if (error) return res.status(500).json({ message: 'Unable to load students.' });
    res.json(rows.map(normalizeStudent));
  });
};

const addStudent = (req, res) => {
  const { name, email = '', department = '', year = '', subjects } = req.body || {};
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Student name is required.' });
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ message: 'Add at least one competency or subject.' });
  }
  const cleanSubjects = [];
  for (const item of subjects) {
    const subject = typeof item.subject === 'string' ? item.subject.trim() : '';
    const marks = Number(item.marks);
    if (!subject || !Number.isFinite(marks) || marks < 0 || marks > 100) {
      return res.status(400).json({ message: 'Each competency needs a name and a score from 0 to 100.' });
    }
    cleanSubjects.push({ subject, marks });
  }
  const averageScore = Number((cleanSubjects.reduce((sum, item) => sum + item.marks, 0) / cleanSubjects.length).toFixed(1));
  const student = {
    name: name.trim(), email: String(email).trim(), department: String(department).trim(),
    year: String(year).trim(), subjects: cleanSubjects, averageScore,
    skillsetPrediction: classify(averageScore)
  };
  Student.add(student, (error, id) => {
    if (error) return res.status(500).json({ message: 'Could not save this student.' });
    res.status(201).json({ message: 'Student added successfully.', student: { id, ...student } });
  });
};

const getStudentReport = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid student ID.' });
  Student.getById(id, (error, row) => {
    if (error) return res.status(500).json({ message: 'Unable to load student report.' });
    if (!row) return res.status(404).json({ message: 'Student not found.' });
    res.json(normalizeStudent(row));
  });
};

const deleteStudent = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid student ID.' });
  Student.delete(id, (error, changes) => {
    if (error) return res.status(500).json({ message: 'Unable to delete student.' });
    if (!changes) return res.status(404).json({ message: 'Student not found.' });
    res.status(204).end();
  });
};

module.exports = { getAllStudents, addStudent, getStudentReport, deleteStudent };