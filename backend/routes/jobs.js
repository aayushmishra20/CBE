const express = require('express');
const router = express.Router();
const jobs = require('../data/jobs');
router.get('/', (_req, res) => res.json(jobs));
router.get('/:id', (req, res) => {
  const job = jobs.find((item) => item.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job listing not found.' });
  res.json(job);
});
module.exports = router;