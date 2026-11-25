# CBE — Competency-Based Education & Workforce Readiness

A React dashboard with an Express/SQLite API for learner records and evidence-based resume competency analysis.

## Requirements
- Node.js 18 or newer
- npm 9 or newer

## Setup
```bash
npm install
npm start
```
The React app runs at http://localhost:3000.

In a second terminal:
```bash
npm run server
```
The API runs at http://localhost:5001. Check it at http://localhost:5001/api/health.

To run both processes together:
```bash
npm run dev
```

## Resume analysis
Upload a text-based PDF, DOCX, or TXT resume (maximum 8 MB). Optionally paste a job description. The API extracts text and reports detected skills, competency evidence, a transparent heuristic evidence score, and missing evidence areas. This is a keyword/evidence aid, not a validated psychometric assessment, AI hiring decision, or proof of actual proficiency.

## API
- `GET /api/health` — service health
- `GET /api/students` — list learner records
- `POST /api/students` — create a learner; body: `{ "name": "...", "subjects": [{ "subject": "...", "marks": 80 }] }`
- `GET /api/students/:id` — learner report
- `POST /api/analyze` — multipart form with `resume` and optional `jobDescription`

## Data and configuration
SQLite is stored in `backend/data/cbe.sqlite` and created automatically. Set `CBE_DB_PATH` to use another database path, `PORT` to change the API port, and `REACT_APP_API_URL` to change the frontend API origin. Uploads are temporary and removed after processing.

## Important repository note
The original repository contains a legacy tracked `node_modules` tree and a `frontend` gitlink without a checked-in submodule configuration. Do not rely on either for installation. Use the root package manifest and tracked `src/` application.
