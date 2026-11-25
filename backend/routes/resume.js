const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const jobs = require('../data/jobs');
const { analyzeResume, extractSkills } = require('../services/resumeAnalyzer');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['.pdf', '.docx'];
    const extension = require('path').extname(file.originalname).toLowerCase();
    if (!allowed.includes(extension)) return callback(new Error('Upload a PDF or DOCX resume.'));
    callback(null, true);
  }
});

router.post('/analyze', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a PDF or DOCX resume.' });
    const extension = require('path').extname(req.file.originalname).toLowerCase();
    let resumeText = '';
    if (extension === '.pdf') {
      const parsed = await pdfParse(req.file.buffer);
      resumeText = parsed.text || '';
    } else {
      const parsed = await mammoth.extractRawText({ buffer: req.file.buffer });
      resumeText = parsed.value || '';
    }
    resumeText = resumeText.replace(/\s+/g, ' ').trim();
    if (resumeText.length < 80) return res.status(422).json({ message: 'We could not extract enough text. If this is a scanned PDF, upload a text-based PDF or DOCX version.' });
    const job = req.body.jobId ? jobs.find((item) => item.id === req.body.jobId) : null;
    const customDescription = String(req.body.jobDescription || '').trim();
    if (!job && customDescription.length < 80) return res.status(400).json({ message: 'Choose a sample job or paste a job description of at least 80 characters.' });
    const target = job || {
      id: 'custom', title: 'Custom job description', company: 'User supplied',
      description: customDescription,
      requiredSkills: extractSkills(customDescription),
      preferredSkills: [],
      minExperience: 0
    };
    if (!target.requiredSkills.length) return res.status(422).json({ message: 'No supported skills were detected in this job description. Add specific technical or professional skill requirements.' });
    const analysis = analyzeResume(resumeText, target);
    const words = resumeText.split(/\s+/).filter(Boolean);
    res.json({
      fileName: req.file.originalname,
      resume: { wordCount: words.length, skillsDetected: analysis.skillsFound, textLength: resumeText.length },
      job: { id: target.id, title: target.title, company: target.company, requiredSkills: target.requiredSkills, preferredSkills: target.preferredSkills },
      analysis
    });
  } catch (error) {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Resume exceeds the 5 MB upload limit.' });
    if (extensionError(error)) return res.status(400).json({ message: 'Upload a valid PDF or DOCX resume.' });
    if (error && (error.name === 'InvalidPDFException' || /pdf|zip|central directory|unexpected end/i.test(error.message || ''))) {
      return res.status(422).json({ message: 'The file could not be read. Please upload a valid, text-based PDF or DOCX document.' });
    }
    next(error);
  }
});
function extensionError(error) { return Boolean(error && error.message && error.message.startsWith('Upload a PDF')); }

module.exports = router;