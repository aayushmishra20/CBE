const express = require('express');
const cors = require('cors');
require('./database');

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'cbe-api' }));
app.use('/api/students', require('./routes/students'));
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error.' });
});

app.listen(PORT, () => console.log(`CBE API listening at http://localhost:${PORT}`));