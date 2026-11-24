import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const emptyHistory = [];

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(emptyHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    axios.get(API + "/api/health").then(() => setHealth("online")).catch(() => setHealth("offline"));
    axios.get(API + "/api/analyses").then(response => setHistory(response.data)).catch(() => setHistory([]));
  }, []);

  const submit = async event => {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!file) return setError("Choose a PDF, DOCX, or TXT resume first.");
    if (jobDescription.trim().length < 40) return setError("Paste a job description with at least 40 characters.");
    const data = new FormData();
    data.append("resume", file);
    data.append("jobDescription", jobDescription);
    setLoading(true);
    try {
      const response = await axios.post(API + "/api/analyze", data, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(response.data);
      setHistory(previous => [response.data, ...previous].slice(0, 20));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to analyse this resume. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async id => {
    try {
      const response = await axios.get(API + "/api/analyses/" + id);
      setResult(response.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not load that saved analysis.");
    }
  };

  const scoreTone = score => score >= 80 ? "good" : score >= 55 ? "mid" : "low";

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="CBE home"><span className="brand-mark">C</span><span>CBE<span className="brand-light"> / INSIGHTS</span></span></a>
      <div className="topbar-right"><span className={"status-dot " + (health === "online" ? "online" : "")}></span><span>API {health}</span><span className="version">BETA 2.0</span></div>
    </header>

    <main className="main">
      <section className="hero">
        <div className="eyebrow"><span></span> COMPETENCY INTELLIGENCE PLATFORM</div>
        <h1>See the skills.<br /><em>Understand the fit.</em></h1>
        <p className="hero-copy">Compare a candidate's resume against a role, uncover competency gaps, and turn the results into a practical development plan.</p>
      </section>

      <section className="workspace">
        <form className="input-panel panel" onSubmit={submit}>
          <div className="panel-heading"><div><span className="step">01</span><h2>Candidate & role</h2></div><span className="subtle">INPUTS</span></div>
          <label className="field-label" htmlFor="resume">Candidate resume</label>
          <label className={"upload-box " + (file ? "has-file" : "")} htmlFor="resume">
            <input id="resume" type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files?.[0] || null)} />
            <span className="upload-icon">↑</span>
            <strong>{file ? file.name : "Drop a resume here or browse files"}</strong>
            <small>{file ? (file.size / 1024).toFixed(0) + " KB · Ready to analyse" : "PDF, DOCX or TXT · Maximum 8 MB"}</small>
          </label>
          <div className="field-row"><label className="field-label" htmlFor="jd">Target job description</label><span className="subtle">{jobDescription.length} characters</span></div>
          <textarea id="jd" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder={"Paste the job description here...\n\nInclude responsibilities, required skills, tools and experience so the analyzer can identify the role's competencies."} rows="8" />
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="primary-button" type="submit" disabled={loading || health === "offline"}>{loading ? <><span className="spinner"></span> Analysing resume…</> : <>Run competency analysis <span>↗</span></>}</button>
          <p className="privacy-note">Files are processed locally by this application server and removed after extraction. Analysis summaries are saved in your local data folder.</p>
        </form>

        <section className="results-column">
          {!result ? <div className="empty-state panel">
            <div className="empty-art"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="orbit-core">CBE</div><span className="orbit-node node-one">SK</span><span className="orbit-node node-two">↗</span></div>
            <span className="subtle">YOUR ANALYSIS WORKSPACE</span><h2>Evidence before assumptions.</h2><p>Upload a resume and add a target role. Your competency match, missing skills and recommendations will appear here.</p>
            <div className="empty-metrics"><div><strong>01</strong><span>Resume</span></div><div><strong>02</strong><span>Role fit</span></div><div><strong>03</strong><span>Action plan</span></div></div>
          </div> : <div className="result-panel panel">
            <div className="panel-heading"><div><span className="step">02</span><h2>Analysis report</h2></div><span className="subtle">JUST GENERATED</span></div>
            <div className="score-layout">
              <div className={"score-ring " + scoreTone(result.score)} style={{ "--score": result.score }}><div><strong>{result.score}%</strong><small>COMPETENCY<br />MATCH</small></div></div>
              <div className="score-copy"><span className={"score-tag " + scoreTone(result.score)}>{result.level}</span><h3>{result.fileName}</h3><p>{result.summary}</p></div>
            </div>
            <div className="stat-grid"><div><strong>{result.matchedSkills.length}</strong><span>Matched</span></div><div><strong>{result.missingSkills.length}</strong><span>Gaps found</span></div><div><strong>{result.resumeSkills.length}</strong><span>Resume skills</span></div></div>
            <div className="result-section"><h3>Competency coverage</h3>{result.categories.map(item => <div className="coverage-row" key={item.category}><div><span>{item.category}</span><small>{item.matched}/{item.required}</small></div><div className="bar-track"><span style={{ width: (item.required ? item.matched / item.required * 100 : 0) + "%" }}></span></div></div>)}</div>
            <div className="result-section"><h3>Matched competencies <span className="count">{result.matchedSkills.length}</span></h3><div className="chips">{result.matchedSkills.map(skill => <span className="chip matched" key={skill}>{skill}</span>)}</div></div>
            <div className="result-section"><h3>Competency gaps <span className="count">{result.missingSkills.length}</span></h3>{result.missingSkills.length ? <div className="chips">{result.missingSkills.map(skill => <span className="chip missing" key={skill}>{skill}</span>)}</div> : <p className="muted">No gaps in the recognised competency catalogue.</p>}</div>
            <div className="result-section"><h3>Resume section check</h3><div className="section-checks">{result.sections.present.map(name => <span className="section-ok" key={name}>✓ {name}</span>)}{result.sections.missing.map(name => <span className="section-missing" key={name}>＋ {name}</span>)}</div></div>
            <div className="result-section"><h3>Recommended next steps</h3><div className="recommendations">{result.recommendations.map((item, index) => <div className="recommendation" key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div></div>
            <p className="disclaimer">Method note: this is a transparent, keyword-and-evidence heuristic over a curated competency catalogue. It is decision support, not an automated hiring decision or a validated psychometric assessment.</p>
          </div>}
        </section>
      </section>

      <section className="history panel">
        <div className="panel-heading"><div><span className="step">03</span><h2>Recent analyses</h2></div><span className="subtle">{history.length} SAVED</span></div>
        {history.length ? <div className="history-list">{history.slice(0, 8).map(item => <button className="history-item" key={item.id} onClick={() => openHistory(item.id)}><span className="history-file"><span className="file-icon">PDF</span><span><strong>{item.fileName}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></span></span><span className={"history-score " + scoreTone(item.score)}>{item.score}%</span><span className="history-open">View ↗</span></button>)}</div> : <p className="muted history-empty">Completed analyses will be listed here.</p>}
      </section>
      <footer><span>CBE INSIGHTS</span><span>Competency-Based Resume Analysis · Built for evidence-led development</span></footer>
    </main>
  </div>;
}
export default App;