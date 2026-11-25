const db = require('./database');
db.get('SELECT COUNT(*) AS count FROM students', (error, row) => {
  if (error) {
    console.error('Database initialization failed:', error.message);
    process.exitCode = 1;
  } else {
    console.log(`CBE database ready (${row.count} student records).`);
  }
  db.close();
});