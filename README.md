# CBE — Competency-Based Resume Analyzer

A local-first application that extracts text from PDF, DOCX and TXT resumes, compares recognised competencies with a target job description, and produces an explainable match report with missing skills and development recommendations.

## Requirements
- Node.js 18.17+ and npm
- macOS, Windows or Linux

## Quick start
```bash
git clone https://github.com/aayushmishra20/CBE.git
cd CBE
git checkout repair/cbe-end-to-end
npm install
npm run dev
```
Open **http://localhost:3000**. The API runs at **http://localhost:5001**.

For a production frontend build: `npm run build`. Run the backend tests with `npm test`.

## How to use
1. Upload a PDF, DOCX or TXT resume (maximum 8 MB).
2. Paste the target job description (minimum 40 characters).
3. Select **Run competency analysis**.
4. Review the overall competency coverage, matched competencies, gaps, resume section check and recommended next steps.
5. Reopen a previous analysis from Recent analyses.

## API
- `GET /api/health` — service health
- `POST /api/analyze` — multipart form fields: `resume`, `jobDescription`
- `GET /api/analyses` — recent saved reports
- `GET /api/analyses/:id` — one saved report

## Configuration
The backend defaults to port 5001. Set `PORT` to change it. Set `REACT_APP_API_URL` before building the frontend if the API is hosted elsewhere (default: `http://localhost:5001`). Optionally set `CLIENT_ORIGIN` to a comma-separated list of allowed frontend origins.

## Data and privacy
Uploaded files are removed after text extraction. Analysis summaries are stored as JSON in `backend/data/analyses.json`; temporary uploads are stored in `backend/uploads` and are not intended for source control. Do not upload sensitive personal data to a publicly exposed instance. Add authentication, access controls, HTTPS and a managed database before production deployment.

## Scoring methodology and limitations
The current scoring engine uses a curated, transparent competency vocabulary and alias mapping. The match score is the percentage of recognised job-description competencies also found in the extracted resume text. Category coverage, missing competencies and resume section checks are included for explainability.

This is a heuristic baseline, not an LLM assessment, validated psychometric instrument, or automated hiring decision. It can miss synonyms, context, proficiency and skills outside its catalogue. Human review remains necessary. Extend `backend/analysisEngine.js` to expand the taxonomy or introduce a validated semantic model.

## Troubleshooting
- If the UI reports API offline, keep both processes running with `npm run dev`.
- If port 3000 or 5001 is occupied, stop the other process or set `PORT` for the backend.
- Scanned/image-only PDFs need OCR; the current PDF parser extracts embedded text only.
- If a PDF is encrypted or malformed, export it again as a text-searchable PDF or DOCX.
