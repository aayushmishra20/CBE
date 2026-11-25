const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 5001);
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(pdf|docx|txt)$/i.test(file.originalname);
    cb(allowed ? null : new Error('Upload a PDF, DOCX, or TXT file.'), allowed);
  }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '2mb' }));

const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const competencies = [
  { name:'Communication', terms:['communication','presentation','stakeholder','writing','documentation'] },
  { name:'Problem Solving', terms:['problem solving','analytical','troubleshoot','critical thinking','debugging'] },
  { name:'Teamwork', terms:['teamwork','collaboration','cross-functional','team player'] },
  { name:'Leadership', terms:['leadership','led ','managed','mentored','coordinated'] },
  { name:'Programming', terms:['javascript','python','java','c++','programming','typescript'] },
  { name:'Data Analysis', terms:['sql','excel','data analysis','statistics','pandas','visualization'] },
  { name:'Project Management', terms:['project management','agile','scrum','planning',' jira'] },
  { name:'Adaptability', terms:['adaptability','fast-paced','learn quickly','flexible'] }
];

function assess(text, jobDescription = '') {
  const normalized = text.toLowerCase();
  const jd = jobDescription.toLowerCase();
  const found = competencies.map(item => {
    const evidence = item.terms.filter(term => normalized.includes(term));
    const required = item.terms.some(term => jd.includes(term));
    return { competency:item.name, score:Math.min(100, evidence.length ? 45 + evidence.length * 18 : 0), evidence, required, status:evidence.length ? 'Evidence found' : 'Not evidenced' };
  });
  const skills = [...new Set((normalized.match(/\b(javascript|typescript|python|java|c\+\+|react|node\.js|sql|excel|aws|docker|git|machine learning|communication|leadership|agile)\b/g) || []))];
  const matched = found.filter(x => x.required && x.evidence.length).length;
  const required = found.filter(x => x.required).length;
  return {
    overallScore: found.length ? Math.round(found.reduce((sum,x)=>sum+x.score,0)/found.length) : 0,
    competencies:found, skills,
    jobMatch: required ? Math.round(matched/required*100) : null,
    gaps:found.filter(x=>x.required && !x.evidence.length).map(x=>x.competency),
    note:'Heuristic evidence scan only. Scores indicate keyword evidence in the supplied text, not validated proficiency or an AI hiring decision.'
  };
}

app.get('/api/health', (_req,res) => res.json({ status:'ok', service:'CBE API', timestamp:new Date().toISOString() }));
app.get('/api/students', (_req,res) => db.all('SELECT * FROM students ORDER BY id DESC', [], (err,rows) => {
  if(err) return res.status(500).json({message:'Unable to load students.'});
  res.json(rows.map(row=>({...row,subjects:JSON.parse(row.subjects || '[]')})));
}));
app.post('/api/students', (req,res) => {
  const { name, email='', subjects=[] } = req.body || {};
  if(typeof name !== 'string' || !name.trim() || !Array.isArray(subjects) || !subjects.length)
    return res.status(400).json({message:'Name and at least one subject with marks are required.'});
  const valid = subjects.every(s => s && typeof s.subject === 'string' && s.subject.trim() && Number.isFinite(Number(s.marks)) && Number(s.marks)>=0 && Number(s.marks)<=100);
  if(!valid) return res.status(400).json({message:'Each subject needs a name and marks between 0 and 100.'});
  const averageScore = Number((subjects.reduce((sum,s)=>sum+Number(s.marks),0)/subjects.length).toFixed(2));
  const skillsetPrediction = averageScore>=80?'Advanced':averageScore>=60?'Intermediate':'Developing';
  db.run('INSERT INTO students(name,email,subjects,averageScore,skillsetPrediction) VALUES(?,?,?,?,?)',
    [name.trim(),String(email),JSON.stringify(subjects),averageScore,skillsetPrediction],
    function(err){ if(err) return res.status(500).json({message:'Unable to save student.'});
      res.status(201).json({student:{id:this.lastID,name:name.trim(),email,subjects,averageScore,skillsetPrediction}}); });
});
app.get('/api/students/:id', (req,res) => db.get('SELECT * FROM students WHERE id=?',[req.params.id],(err,row)=>{
  if(err) return res.status(500).json({message:'Unable to load report.'});
  if(!row) return res.status(404).json({message:'Student not found.'});
  res.json({...row,subjects:JSON.parse(row.subjects || '[]')});
}));
app.post('/api/analyze', upload.single('resume'), asyncRoute(async (req,res) => {
  if(!req.file) return res.status(400).json({message:'Choose a resume file first.'});
  let text = '';
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if(ext === '.txt') text = fs.readFileSync(req.file.path,'utf8');
    else if(ext === '.pdf') {
      const pdf = require('pdf-parse');
      text = (await pdf(fs.readFileSync(req.file.path))).text;
    } else {
      const mammoth = require('mammoth');
      text = (await mammoth.extractRawText({path:req.file.path})).value;
    }
    if(!text.trim()) return res.status(422).json({message:'No readable text found. Try a text-based PDF or DOCX.'});
    res.json({filename:req.file.originalname, ...assess(text,req.body.jobDescription || '')});
  } finally { fs.promises.unlink(req.file.path).catch(()=>{}); }
}));
app.use((err,_req,res,_next) => {
  const status = err instanceof multer.MulterError ? 400 : 500;
  res.status(status).json({message:err.message || 'Unexpected server error.'});
});
app.listen(PORT,()=>console.log(`CBE API listening on http://localhost:${PORT}`));
