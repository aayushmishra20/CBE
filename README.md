# CBE — Competency-Based Education Workforce Preparedness

A React + Express + SQLite application for recording student competency scores, calculating indicative readiness levels, and reviewing individual assessment reports.

## Requirements
- Node.js 18 or newer
- npm 9 or newer

## Quick start
```bash
npm install
npm run dev
```
This starts the React development server at http://localhost:3000 and the API at http://localhost:5001. The React development server proxies `/api` requests to the backend.

Run either service separately with `npm start` (frontend) or `npm run server` (backend).

## Useful commands
- `npm run db:init` — initialize/check the SQLite database.
- `npm test` — run frontend tests once.
- `npm run build` — create a production frontend build.

## API
- `GET /api/health` — health check.
- `GET /api/students` — list student records.
- `POST /api/students` — create a student and calculate the average/readiness level.
- `GET /api/students/:id` — fetch an individual report.
- `DELETE /api/students/:id` — delete a student record.

Example request:
```json
{
  "name": "Aanya Sharma",
  "email": "aanya@example.com",
  "department": "Computer Science",
  "year": "Final year",
  "subjects": [
    { "subject": "Problem solving", "marks": 88 },
    { "subject": "Communication", "marks": 76 }
  ]
}
```

## Readiness rubric
- 85–100: Workforce Ready
- 70–84.9: Proficient
- 50–69.9: Developing
- Below 50: Needs Support

These labels are simple rules applied to entered academic competency scores. They are not validated predictions of hiring outcomes.

## Data and configuration
SQLite data is stored at `backend/data/cbe.sqlite` by default and excluded from version control. Set `DB_PATH` to use another database file. Set `PORT` to change the API port and `REACT_APP_API_URL` to point the frontend at a separately hosted API.

## Notes
The project is a student competency tracking prototype. It does not currently parse resumes or job descriptions, and it does not claim AI-based skill inference.