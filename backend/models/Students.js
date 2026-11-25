const db = require('../database');

class Student {
  static getAll(callback) {
    db.all('SELECT * FROM students ORDER BY createdAt DESC, id DESC', callback);
  }

  static add(student, callback) {
    const { name, email, department, year, subjects, averageScore, skillsetPrediction } = student;
    db.run(
      `INSERT INTO students (name, email, department, year, subjects, averageScore, skillsetPrediction)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email || null, department || null, year || null, JSON.stringify(subjects), averageScore, skillsetPrediction],
      function (error) { callback(error, this && this.lastID); }
    );
  }

  static getById(id, callback) {
    db.get('SELECT * FROM students WHERE id = ?', [id], callback);
  }

  static delete(id, callback) {
    db.run('DELETE FROM students WHERE id = ?', [id], function (error) {
      callback(error, this && this.changes);
    });
  }
}

module.exports = Student;