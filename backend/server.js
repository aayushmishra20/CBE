const express = require('express');
const cors = require('cors');
require('./database');

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'careerfit-api' }));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/students', require('./routes/students'));
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  if (error.message && error.message.startsWith('Upload a PDF')) return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error while processing the request.' });
});
app.listen(PORT, () => console.log(`CareerFit API listening at http://localhost:${PORT}`));