const db = require('../database');

class Student {
    static getAll(callback) {
        db.all('SELECT * FROM students', callback);
    }

    
    static add(student, callback) {
        const { name, subjects, averageScore, skillsetPrediction } = student;
        const sql = `
            INSERT INTO students (name, subjects, averageScore, skillsetPrediction)
            VALUES (?, ?, ?, ?)
        `;
        db.run(sql, [name, subjects, averageScore, skillsetPrediction], callback);
    }

    static getById(id, callback) {
        db.get('SELECT * FROM students WHERE id = ?', [id], callback);
    }
}

module.exports = Student;