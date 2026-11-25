import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import api from './api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const emptySubject = () => ({ subject: '', marks: '' });
const levelClass = (score) => score >= 85 ? 'ready' : score >= 70 ? 'proficient' : score >= 50 ? 'developing' : 'support';

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not connect to the CBE API.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadStudents(); }, []);

  const filteredStudents = useMemo(() => students.filter((student) =>
    [student.name, student.department, student.email].join(' ').toLowerCase().includes(query.toLowerCase())
  ), [students, query]);

  const updateSubject = (index, field, value) => {
    setSubjects((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    if (!name.trim()) return toast.error('Enter the student name.');
    if (subjects.some((item) => !item.subject.trim() || item.marks === '' || Number(item.marks) < 0 || Number(item.marks) > 100)) {
      return toast.error('Complete every competency with a score between 0 and 100.');
    }
    setSaving(true);
    try {
      const { data } = await api.post('/students', {
        name, email, department, year,
        subjects: subjects.map((item) => ({ subject: item.subject.trim(), marks: Number(item.marks) }))
      });
      setStudents((current) => [data.student, ...current]);
      setName(''); setEmail(''); setDepartment(''); setYear(''); setSubjects([emptySubject()]);
      toast.success('Student record saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save student.');
    } finally { setSaving(false); }
  };

  const viewReport = async (id) => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setReport(data);
      window.setTimeout(() => document.getElementById('student-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to load report.'); }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student record? This cannot be undone.')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((current) => current.filter((student) => student.id !== id));
      if (report?.id === id) setReport(null);
      toast.success('Student record deleted.');
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to delete student.'); }
  };

  const average = students.length ? Math.round(students.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) / students.length) : 0;
  const readyCount = students.filter((item) => item.averageScore >= 85).length;
  const chartData = report ? {
    labels: report.subjects.map((item) => item.subject),
    datasets: [{ label: 'Competency score', data: report.subjects.map((item) => item.marks), backgroundColor: '#6d7cff', borderRadius: 8 }]
  } : null;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">C</span><div><strong>CBE</strong><small>WORKFORCE READINESS</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <a className="nav-item active" href="#overview">▦ <span>Overview</span></a>
      <a className="nav-item" href="#students">♙ <span>Students</span></a>
      <a className="nav-item" href="#add-student">＋ <span>Add student</span></a>
      <div className="sidebar-bottom"><div className="status-dot"></div><span>Local workspace</span><small>v1.1</small></div>
    </aside>

    <main className="main-content" id="overview">
      <header className="topbar"><div><span className="eyebrow">ACADEMIC ANALYTICS / OVERVIEW</span><h1>Workforce readiness</h1><p>Track student competencies and identify development opportunities.</p></div><div className="top-tag"><span className="status-dot"></span> System workspace</div></header>

      <section className="stats-grid">
        <article className="stat-card"><span className="stat-icon violet">♙</span><span className="stat-label">TOTAL STUDENTS</span><strong>{students.length}</strong><small>Registered learner records</small></article>
        <article className="stat-card"><span className="stat-icon blue">◎</span><span className="stat-label">AVERAGE SCORE</span><strong>{average}<em>/100</em></strong><small>Across all competency scores</small></article>
        <article className="stat-card"><span className="stat-icon green">↗</span><span className="stat-label">WORKFORCE READY</span><strong>{readyCount}</strong><small>Score of 85 or above</small></article>
        <article className="stat-card"><span className="stat-icon amber">⌁</span><span className="stat-label">DEVELOPMENT NEEDED</span><strong>{students.length - readyCount}</strong><small>Students below readiness level</small></article>
      </section>

      <section className="content-grid">
        <div className="panel students-panel" id="students">
          <div className="panel-heading"><div><span className="eyebrow">LEARNER DIRECTORY</span><h2>Student records</h2></div><span className="count-pill">{students.length} records</span></div>
          <div className="toolbar"><input aria-label="Search students" placeholder="Search by name, email or department..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          {loading ? <div className="empty-state">Loading student records…</div> : filteredStudents.length === 0 ? <div className="empty-state"><span>⌕</span><strong>No student records found</strong><small>Add a student to begin tracking competencies.</small></div> :
            <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>DEPARTMENT</th><th>AVERAGE</th><th>READINESS</th><th>ACTION</th></tr></thead><tbody>
              {filteredStudents.map((student) => <tr key={student.id}><td><div className="student-cell"><span className="avatar">{student.name.slice(0,1).toUpperCase()}</span><div><strong>{student.name}</strong><small>{student.email || 'No email provided'}</small></div></div></td><td>{student.department || '—'}</td><td><strong>{Number(student.averageScore).toFixed(1)}%</strong></td><td><span className={`level-pill ${levelClass(student.averageScore)}`}>{student.skillsetPrediction}</span></td><td><div className="actions"><button className="link-button" onClick={() => viewReport(student.id)}>View report</button><button className="delete-button" aria-label={`Delete ${student.name}`} onClick={() => deleteStudent(student.id)}>×</button></div></td></tr>)}
            </tbody></table></div>}
        </div>

        <form className="panel form-panel" id="add-student" onSubmit={saveStudent}>
          <div className="panel-heading"><div><span className="eyebrow">NEW LEARNER</span><h2>Add student</h2></div><span className="plus-mark">＋</span></div>
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aanya Sharma" required /></label>
          <label>Email address <span className="optional">OPTIONAL</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" /></label>
          <div className="two-fields"><label>Department<input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" /></label><label>Academic year<input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Final year" /></label></div>
          <div className="competency-heading"><strong>Competency assessment</strong><small>Score each area from 0–100</small></div>
          {subjects.map((item, index) => <div className="subject-row" key={index}><input aria-label={`Competency ${index + 1}`} value={item.subject} onChange={(e) => updateSubject(index, 'subject', e.target.value)} placeholder="e.g. Problem solving" required /><input aria-label={`Score ${index + 1}`} type="number" min="0" max="100" value={item.marks} onChange={(e) => updateSubject(index, 'marks', e.target.value)} placeholder="Score" required />{subjects.length > 1 && <button type="button" className="remove-subject" onClick={() => setSubjects((current) => current.filter((_, i) => i !== index))}>×</button>}</div>)}
          <button type="button" className="add-competency" onClick={() => setSubjects((current) => [...current, emptySubject()])}>＋ Add competency</button>
          <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving record…' : 'Save student record  →'}</button>
        </form>
      </section>

      {report && <section className="panel report-panel" id="student-report"><div className="panel-heading"><div><span className="eyebrow">INDIVIDUAL ASSESSMENT</span><h2>{report.name} — competency report</h2></div><button className="close-report" onClick={() => setReport(null)}>Close ×</button></div><div className="report-summary"><div><small>OVERALL SCORE</small><strong>{Number(report.averageScore).toFixed(1)}%</strong></div><div><small>READINESS LEVEL</small><span className={`level-pill ${levelClass(report.averageScore)}`}>{report.skillsetPrediction}</span></div><div><small>COMPETENCIES ASSESSED</small><strong>{report.subjects.length}</strong></div></div><div className="chart-wrap"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100, grid: { color: '#edf0f5' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} /></div></section>}
      <footer> CBE · Competency-Based Education Workforce Preparedness <span>Scores are indicative academic assessments, not validated employment predictions.</span></footer>
    </main>
    <ToastContainer position="bottom-right" />
  </div>;
}

export default App;