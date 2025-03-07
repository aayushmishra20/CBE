const db = require('./database');

db.serialize(() => {
    // Create Students table
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subjects TEXT NOT NULL,  // Store subjects and marks as JSON
            averageScore REAL,      // Store calculated average score
            skillsetPrediction TEXT // Store AI-generated skillset prediction
        )
    `);
});

db.close();