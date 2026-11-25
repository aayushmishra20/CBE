# CareerFit — Resume Intelligence & Job Matching

CareerFit is a resume-to-job-description comparison application built with React, Express and local document parsing. Users upload a PDF/DOCX resume, choose a sample role or paste a custom job description, and receive a transparent skills-match report.

## Requirements
- Node.js 18+
- npm 9+

## Setup
```bash
npm install
npm run dev
```
Frontend: http://localhost:3000  
API: http://localhost:5001

## Workflow
1. Upload a text-based PDF or DOCX resume (maximum 5 MB).
2. Choose one of the curated sample jobs or paste a custom job description.
3. The API extracts document text and identifies skills using a maintained skills/alias taxonomy.
4. The analyzer compares required and preferred skills, extracts evidence snippets, and calculates a transparent weighted score.
5. Review missing requirements and practical resume recommendations.

## API
- `GET /api/health` — service health.
- `GET /api/jobs` — curated sample jobs.
- `GET /api/jobs/:id` — one job.
- `POST /api/resume/analyze` — multipart form with `resume` (PDF/DOCX) and either `jobId` or `jobDescription`.

## Scoring
The match score is a deterministic heuristic:
- Skills alignment: 80% (required skills weighted more heavily than preferred skills).
- Experience signal: 10%.
- Education section signal: 5%.
- Project/delivery evidence: 5%.

The report separately shows required/preferred skill coverage and text excerpts supporting detected skills. This is not a trained machine-learning model, an employment prediction or a hiring decision. It can miss synonyms, implicit experience and text in scanned/image-only PDFs. OCR is not included.

## Privacy and limits
Uploads are processed in memory and are not written to disk or persisted in the database. Maximum upload size is 5 MB. Use text-based PDFs or DOCX; scanned PDFs require OCR before analysis. The sample job listings are illustrative demo data, not live vacancies.

## Configuration
Set `PORT` to change the API port and `REACT_APP_API_URL` to use a separately hosted API. In local development, the frontend proxies `/api` to port 5001.