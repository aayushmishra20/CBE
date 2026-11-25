import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import api from './api';

const scoreTone = (score) => score >= 80 ? 'good' : score >= 60 ? 'mid' : 'low';

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [file, setFile] = useState(null);
  const [customMode, setCustomMode] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    api.get('/jobs')
      .then(({ data }) => {
        setJobs(data);
        if (data.length) setSelectedJob(data[0].id);
      })
      .catch(() => toast.error('Could not load sample jobs. Check that the API is running.'));
  }, []);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    const extension = candidate.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx'].includes(extension)) {
      toast.error('Please choose a PDF or DOCX file.');
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      toast.error('Maximum resume size is 5 MB.');
      return;
    }
    setFile(candidate);
    setResult(null);
  };

  const analyze = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error('Upload your resume first.');
      return;
    }
    if (customMode && jobDescription.trim().length < 80) {
      toast.error('Paste a complete job description (at least 80 characters).');
      return;
    }
    if (!customMode && !selectedJob) {
      toast.error('Select a job to continue.');
      return;
    }

    const body = new FormData();
    body.append('resume', file);
    if (customMode) body.append('jobDescription', jobDescription);
    else body.append('jobId', selectedJob);

    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/resume/analyze', body, {
        headers: { 'Content-Type': undefined }
      });
      setResult(data);
      window.setTimeout(() => {
        document.getElementById('analysis-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Analysis failed. Check the API and try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeJob = jobs.find((job) => job.id === selectedJob);
  const matched = (skill) => result.analysis.matchedRequired.includes(skill);
  const preferredMatched = (skill) => result.analysis.matchedPreferred.includes(skill);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">C</span>
          <div><b>career<span>fit</span></b><small>RESUME INTELLIGENCE</small></div>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <a className="nav-link active" href="#analyzer"><span>⌕</span> Resume analyzer</a>
        <a className="nav-link" href="#job-library"><span>▤</span> Job library</a>
        <div className="side-note"><span className="pulse"></span> Analysis engine ready</div>
        <div className="side-bottom"><b>CAREERFIT</b><small>Evidence-led career insights</small></div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <div className="crumb">WORKSPACE <span>/</span> RESUME ANALYZER</div>
            <h1>Find your next <i>opportunity.</i></h1>
            <p>See how your experience aligns with role requirements — and what to improve next.</p>
          </div>
          <div className="header-chip"><span className="pulse"></span> Matching engine online</div>
        </header>

        <section className="intro-strip">
          <div className="intro-symbol">✳</div>
          <div><b>One resume. A clearer career direction.</b><p>Upload your resume, choose a role and get a transparent, evidence-backed match report.</p></div>
          <div className="steps"><span>01 UPLOAD</span><span>02 SELECT ROLE</span><span>03 ANALYZE</span></div>
        </section>

        <form className="workspace-grid" id="analyzer" onSubmit={analyze}>
          <section className="panel upload-panel">
            <div className="section-head">
              <div><span className="kicker">STEP 01</span><h2>Upload your resume</h2><p>We’ll extract your experience, education, projects and skills.</p></div>
              <span className="step-number">01</span>
            </div>
            <label
              className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
            >
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => acceptFile(event.target.files[0])}
              />
              <span className="upload-icon">{file ? '✓' : '↑'}</span>
              <b>{file ? file.name : 'Drop your resume here'}</b>
              <small>{file ? `${(file.size / 1024).toFixed(0)} KB · Ready to analyze` : 'or click to browse your files'}</small>
              <span className="file-types">PDF or DOCX <i>·</i> MAX 5 MB</span>
            </label>
            {file && <button type="button" className="remove-file" onClick={() => { setFile(null); setResult(null); }}>Remove file ×</button>}
            <div className="privacy-note"><span>♢</span> Resume is processed for this analysis and is not saved to a profile.</div>
          </section>

          <section className="panel job-panel">
            <div className="section-head">
              <div><span className="kicker">STEP 02</span><h2>Choose your target role</h2><p>Compare against a curated job or your own job description.</p></div>
              <span className="step-number">02</span>
            </div>
            <div className="mode-tabs">
              <button type="button" className={!customMode ? 'selected' : ''} onClick={() => setCustomMode(false)}>Job library <span>{jobs.length}</span></button>
              <button type="button" className={customMode ? 'selected' : ''} onClick={() => setCustomMode(true)}>Custom job description</button>
            </div>

            <div className="job-selection">
              {!customMode ? (
                <div className="sample-job-selection">
                  <label className="field-label" htmlFor="job-select">SELECT A JOB</label>
                  <select id="job-select" value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>
                    {jobs.map((job) => <option key={job.id} value={job.id}>{job.title} — {job.company}</option>)}
                  </select>
                  {activeJob && (
                    <div className="job-preview">
                      <div className="job-preview-top">
                        <div><b>{activeJob.title}</b><small>{activeJob.company} · {activeJob.location}</small></div>
                        <span>{activeJob.type}</span>
                      </div>
                      <div className="job-meta"><span>◷ {activeJob.experience}</span><span>▦ {activeJob.category}</span></div>
                      <p>{activeJob.description}</p>
                      <div className="skill-chips">
                        {activeJob.requiredSkills.map((skill) => <span key={skill}>{skill}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="custom-job-selection">
                  <label className="field-label" htmlFor="custom-jd">PASTE JOB DESCRIPTION</label>
                  <textarea
                    id="custom-jd"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the complete job description, including responsibilities and required skills..."
                    rows="9"
                  />
                  <small className="helper">Include the skills and responsibilities for a more useful comparison.</small>
                </div>
              )}
            </div>
          </section>

          <div className="analyze-row">
            <div><b>Ready when you are.</b><small>Your report will include matched skills, missing requirements and practical recommendations.</small></div>
            <button type="submit" disabled={loading || (!customMode && !jobs.length)}>
              {loading ? <><span className="spinner"></span> Analyzing resume…</> : 'Analyze resume ↗'}
            </button>
          </div>
        </form>

        {result && (
          <section className="results" id="analysis-result">
            <div className="result-heading">
              <div><span className="kicker">STEP 03 · ANALYSIS COMPLETE</span><h2>Your match report</h2><p>{result.fileName} <span>·</span> {result.job.title} at {result.job.company}</p></div>
              <button type="button" className="new-analysis" onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>＋ New analysis</button>
            </div>

            <div className="result-grid">
              <article className="panel score-card">
                <span className="kicker">OVERALL MATCH</span>
                <div className={`score-ring ${scoreTone(result.analysis.score)}`} style={{ '--score-angle': `${result.analysis.score * 3.6}deg` }}>
                  <div><strong>{result.analysis.score}</strong><small>/100</small></div>
                </div>
                <span className={`verdict ${scoreTone(result.analysis.score)}`}>{result.analysis.verdict}</span>
                <p>{result.analysis.summary}</p>
                <small className="muted">{result.resume.wordCount} words scanned · {result.analysis.skillsFound.length} skills detected</small>
              </article>
              <article className="panel breakdown-card">
                <span className="kicker">SCORE BREAKDOWN</span><h3>What shaped your score</h3>
                {result.analysis.scoring.map((item) => (
                  <div className="metric" key={item.label}>
                    <div><span>{item.label}</span><b>{item.score}% <small>· {item.weight}</small></b></div>
                    <div className="track"><i style={{ width: `${item.score}%` }}></i></div>
                  </div>
                ))}
              </article>
            </div>

            <div className="result-grid skills-grid">
              <article className="panel">
                <span className="kicker">SKILL ALIGNMENT</span><h3>Required skills</h3>
                <div className="skill-list">
                  {result.job.requiredSkills.map((skill) => (
                    <div key={skill}><span className={matched(skill) ? 'skill-ok' : 'skill-missing'}>{matched(skill) ? '✓' : '!'}</span><span>{skill}</span><small>{matched(skill) ? 'Found in resume' : 'Not detected'}</small></div>
                  ))}
                </div>
              </article>
              <article className="panel">
                <span className="kicker">ADDITIONAL ALIGNMENT</span><h3>Preferred skills</h3>
                <div className="skill-list">
                  {result.job.preferredSkills.length ? result.job.preferredSkills.map((skill) => (
                    <div key={skill}><span className={preferredMatched(skill) ? 'skill-ok' : 'skill-missing'}>{preferredMatched(skill) ? '✓' : '·'}</span><span>{skill}</span><small>{preferredMatched(skill) ? 'Found in resume' : 'Not detected'}</small></div>
                  )) : <p className="muted">No preferred skills were specified.</p>}
                </div>
              </article>
            </div>

            <article className="panel evidence-panel">
              <span className="kicker">MATCH EVIDENCE</span><h3>What the analyzer found</h3>
              {result.analysis.evidence.length ? result.analysis.evidence.map((item) => (
                <div className="evidence" key={item.skill}><b>{item.skill}</b><p>“{item.excerpt}”</p></div>
              )) : <p className="muted">No direct evidence snippets were found for matched skills. Review the extracted skills and resume text manually.</p>}
            </article>

            <article className="panel recommendations">
              <span className="kicker">YOUR NEXT STEPS</span><h3>Recommendations to strengthen your application</h3>
              {result.analysis.recommendations.length ? (
                <ol>{result.analysis.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ol>
              ) : <p>Your resume covers the listed requirements well. Tailor the summary and project bullets to this role.</p>}
            </article>
            <p className="disclaimer">Important: {result.analysis.disclaimer}</p>
          </section>
        )}

        <section className="job-library" id="job-library">
          <div className="library-heading">
            <div><span className="kicker">EXPLORE OPPORTUNITIES</span><h2>Curated job library</h2><p>Try your resume against different entry-level roles.</p></div>
            <span className="library-count">{jobs.length} SAMPLE ROLES</span>
          </div>
          <div className="job-cards">
            {jobs.map((job) => (
              <button type="button" key={job.id} className={selectedJob === job.id && !customMode ? 'job-card chosen' : 'job-card'} onClick={() => { setSelectedJob(job.id); setCustomMode(false); document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <span>{job.category}</span><b>{job.title}</b><small>{job.company} · {job.location}</small>
                <div>{job.requiredSkills.slice(0, 3).map((skill) => <i key={skill}>{skill}</i>)}</div>
                <strong>Use this role →</strong>
              </button>
            ))}
          </div>
        </section>
        <footer>CAREERFIT <span>Transparent analysis. Better applications.</span></footer>
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
