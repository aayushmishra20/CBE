import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function App() {
  const [students,setStudents] = useState([]);
  const [name,setName] = useState('');
  const [subjects,setSubjects] = useState([{subject:'',marks:0}]);
  const [report,setReport] = useState(null);
  const [resume,setResume] = useState(null);
  const [jobDescription,setJobDescription] = useState('');
  const [analysis,setAnalysis] = useState(null);
  const [loading,setLoading] = useState(false);

  const loadStudents = async () => {
    try { const {data}=await axios.get(`${API}/api/students`); setStudents(data); }
    catch { toast.error('Could not connect to the CBE API. Start the backend and retry.'); }
  };
  useEffect(()=>{loadStudents();},[]);

  const updateSubject = (i,key,value) => setSubjects(old=>old.map((s,index)=>index===i?{...s,[key]:value}:s));
  const saveStudent = async e => {
    e.preventDefault();
    try {
      const {data}=await axios.post(`${API}/api/students`,{name,subjects});
      setStudents(old=>[data.student,...old]); setName(''); setSubjects([{subject:'',marks:0}]); toast.success('Student saved.');
    } catch(error) { toast.error(error.response?.data?.message || 'Unable to save student.'); }
  };
  const analyzeResume = async e => {
    e.preventDefault();
    if(!resume) return toast.error('Select a resume file.');
    const form=new FormData(); form.append('resume',resume); form.append('jobDescription',jobDescription);
    setLoading(true);
    try { const {data}=await axios.post(`${API}/api/analyze`,form); setAnalysis(data); toast.success('Resume analysis completed.'); }
    catch(error) { toast.error(error.response?.data?.message || 'Resume analysis failed.'); }
    finally { setLoading(false); }
  };
  const chartData = report ? {labels:report.subjects.map(s=>s.subject),datasets:[{label:'Marks',data:report.subjects.map(s=>s.marks),backgroundColor:'#6478f5',borderRadius:8}]} : null;

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark">CBE</div><div><strong>Competency-Based Education</strong><small>Student & workforce readiness platform</small></div><span className="status"><i/> Learning analytics</span></header>
    <section className="hero"><div><p className="eyebrow">SKILLS • EVIDENCE • GROWTH</p><h1>Turn learning into<br/><span>demonstrable capability.</span></h1><p>Track student outcomes and evaluate resume evidence against job competencies.</p></div><div className="hero-stat"><strong>{students.length}</strong><span>Students tracked</span></div></section>
    <section className="metrics"><article><span>Students</span><strong>{students.length}</strong><small>Saved learner profiles</small></article><article><span>Average score</span><strong>{students.length?(students.reduce((a,s)=>a+Number(s.averageScore||0),0)/students.length).toFixed(1):'—'}{students.length?'%':''}</strong><small>Across recorded subjects</small></article><article><span>Resume analysis</span><strong>{analysis?'Ready':'Available'}</strong><small>PDF, DOCX and TXT</small></article></section>
    <div className="workspace">
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">LEARNER RECORDS</p><h2>Add a student</h2></div></div>
        <form onSubmit={saveStudent}><label>Student name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Aanya Sharma" required/></label>
        <div className="subject-heading"><strong>Subject performance</strong><button type="button" className="text-button" onClick={()=>setSubjects(s=>[...s,{subject:'',marks:0}])}>+ Add subject</button></div>
        {subjects.map((s,i)=><div className="subject-row" key={i}><input aria-label="Subject" placeholder="Subject name" value={s.subject} onChange={e=>updateSubject(i,'subject',e.target.value)} required/><input aria-label="Marks" type="number" min="0" max="100" value={s.marks} onChange={e=>updateSubject(i,'marks',Number(e.target.value))} required/><button type="button" aria-label="Remove subject" onClick={()=>setSubjects(old=>old.length>1?old.filter((_,j)=>j!==i):old)} disabled={subjects.length===1}>×</button></div>)}
        <button className="primary-button" type="submit">Save student</button></form>
      </section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">COMPETENCY ENGINE</p><h2>Analyze a resume</h2></div></div>
        <form onSubmit={analyzeResume}><label>Resume file<input type="file" accept=".pdf,.docx,.txt" onChange={e=>setResume(e.target.files?.[0]||null)} required/></label><label>Job description <span className="muted">(optional)</span><textarea rows="5" value={jobDescription} onChange={e=>setJobDescription(e.target.value)} placeholder="Paste the role requirements to identify competency gaps..."/></label><button className="primary-button" disabled={loading}>{loading?'Analyzing…':'Analyze resume'}</button></form>
        {analysis&&<div className="analysis-result"><div className="score"><strong>{analysis.overallScore}%</strong><span>Evidence score</span></div><div><strong>{analysis.filename}</strong><p>{analysis.skills.length?analysis.skills.join(' · '):'No predefined technical skills detected'}</p><p>{analysis.jobMatch===null?'Add a job description for a match score':`Job-description evidence match: ${analysis.jobMatch}%`}</p>{analysis.gaps.length>0&&<p><b>Evidence gaps:</b> {analysis.gaps.join(', ')}</p>}<small>{analysis.note}</small></div></div>}
      </section>
    </div>
    <section className="panel records"><div className="panel-heading"><div><p className="eyebrow">COHORT OVERVIEW</p><h2>Student records</h2></div><button className="text-button" onClick={loadStudents}>Refresh ↻</button></div>
      {students.length===0?<p className="empty">No students yet. Add a learner above to start tracking outcomes.</p>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Average</th><th>Readiness level</th><th>Report</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td>{s.name}</td><td>{Number(s.averageScore).toFixed(1)}%</td><td><span className="level">{s.skillsetPrediction}</span></td><td><button className="text-button" onClick={async()=>{try{const {data}=await axios.get(`${API}/api/students/${s.id}`);setReport(data);}catch{toast.error('Could not load report.');}}}>View report →</button></td></tr>)}</tbody></table></div>}
      {report&&<div className="report"><div><h3>{report.name}</h3><p>Average score: <b>{Number(report.averageScore).toFixed(1)}%</b> · {report.skillsetPrediction}</p></div><button className="text-button" onClick={()=>setReport(null)}>Close</button><div className="chart"><Bar data={chartData} options={{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,max:100}}}}/></div></div>}
    </section>
    <footer>Competency-Based Education · Scores are indicative learning signals, not hiring decisions.</footer><ToastContainer position="bottom-right"/>
  </main>;
}
