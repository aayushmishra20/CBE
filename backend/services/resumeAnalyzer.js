const SKILLS = [
  ['JavaScript', ['javascript', 'ecmascript', 'js']], ['TypeScript', ['typescript', 'ts']],
  ['React', ['react.js', 'reactjs', 'react']], ['Node.js', ['node.js', 'nodejs', 'node']],
  ['Express', ['express.js', 'express']], ['MongoDB', ['mongodb', 'mongo db']],
  ['PostgreSQL', ['postgresql', 'postgres']], ['SQL', ['structured query language', 'sql']],
  ['Python', ['python']], ['Java', ['java']], ['C++', ['c++']], ['C', ['c language']],
  ['HTML', ['html5', 'html']], ['CSS', ['css3', 'css']],
  ['REST APIs', ['restful api', 'rest api', 'rest apis']], ['Git', ['github', 'gitlab', 'git']],
  ['Docker', ['containerization', 'docker']], ['AWS', ['amazon web services', 'aws']],
  ['Azure', ['azure']], ['Linux', ['ubuntu', 'linux']], ['Flask', ['flask']],
  ['FastAPI', ['fast api', 'fastapi']], ['Django', ['django']],
  ['Machine Learning', ['machine learning', 'ml model']], ['Scikit-learn', ['scikit-learn', 'sklearn']],
  ['TensorFlow', ['tensorflow']], ['PyTorch', ['pytorch']], ['Pandas', ['pandas']],
  ['NumPy', ['numpy']], ['NLP', ['natural language processing', 'nlp']],
  ['Data Visualization', ['data visualisation', 'data visualization']],
  ['Statistics', ['statistical analysis', 'statistics', 'statistical']],
  ['Excel', ['spreadsheets', 'microsoft excel', 'excel']], ['Power BI', ['power bi']],
  ['Tableau', ['tableau']], ['Data Cleaning', ['data preprocessing', 'data cleaning']],
  ['Jest', ['jest']], ['Pytest', ['pytest']], ['Playwright', ['playwright']],
  ['Selenium', ['selenium']], ['API Testing', ['api testing']], ['Postman', ['postman']],
  ['Automation Testing', ['test automation', 'automation testing']],
  ['CI/CD', ['continuous integration', 'continuous deployment', 'ci/cd']],
  ['Kubernetes', ['kubernetes', 'k8s']], ['Bash', ['shell scripting', 'bash']],
  ['OOP', ['object-oriented', 'object oriented', 'oops', 'oop']],
  ['Data Structures', ['data structures', 'algorithms', 'dsa']],
  ['Spring Boot', ['spring boot']], ['JUnit', ['junit']],
  ['Problem Solving', ['problem solving', 'analytical thinking']],
  ['Communication', ['stakeholder management', 'communication']],
  ['Accessibility', ['accessibility', 'wcag']],
  ['Performance Optimization', ['performance optimization', 'web vitals']],
  ['Authentication', ['authentication', 'authorization', 'jwt']],
  ['Model Evaluation', ['model evaluation', 'model validation']],
  ['Monitoring', ['monitoring', 'prometheus', 'grafana']],
  ['Networking', ['networking', 'tcp/ip', 'dns']]
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function containsAlias(text, alias) {
  const escaped = escapeRegex(alias.toLowerCase());
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(String(text || '').toLowerCase());
}
function extractSkills(text) {
  return SKILLS
    .filter(([, aliases]) => aliases.some((alias) => containsAlias(text, alias)))
    .map(([skill]) => skill);
}
function findEvidence(text, skill) {
  const sentences = String(text).split(/(?<=[.!?\\n])\\s+/).filter(Boolean);
  const entry = SKILLS.find(([name]) => name === skill);
  const aliases = entry ? entry[1] : [skill];
  const match = sentences.find((sentence) => aliases.some((alias) => containsAlias(sentence, alias)));
  return match ? match.trim().slice(0, 260) : '';
}
function estimateExperience(text) {
  const patterns = [
    /\\b(\\d+(?:\\.\\d+)?)\\s*\\+?\\s*years?\\s+(?:of\\s+)?(?:professional\\s+)?experience\\b/i,
    /\\bexperience\\s*[:\\-]\\s*(\\d+(?:\\.\\d+)?)\\s*\\+?\\s*years?\\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return 0;
}
function analyzeResume(resumeText, job) {
  const skillsFound = extractSkills(resumeText);
  const required = job.requiredSkills || [];
  const preferred = job.preferredSkills || [];
  const matchedRequired = required.filter((skill) => skillsFound.includes(skill));
  const missingRequired = required.filter((skill) => !skillsFound.includes(skill));
  const matchedPreferred = preferred.filter((skill) => skillsFound.includes(skill));
  const missingPreferred = preferred.filter((skill) => !skillsFound.includes(skill));
  const requiredCoverage = required.length ? matchedRequired.length / required.length : 0;
  const preferredCoverage = preferred.length ? matchedPreferred.length / preferred.length : 0;
  const skillScore = Math.round(requiredCoverage * 75 + preferredCoverage * 25);
  const years = estimateExperience(resumeText);
  const experienceScore = job.minExperience > 0
    ? Math.min(100, Math.round(years / job.minExperience * 100))
    : (years > 0 ? 100 : 70);
  const lowerResume = String(resumeText).toLowerCase();
  const educationSignals = ['b.tech', 'bachelor', 'b.e.', 'b.sc', 'master', 'm.tech', 'degree', 'university', 'college'];
  const projectSignals = ['project', 'developed', 'built', 'implemented', 'designed', 'deployed'];
  const educationFound = educationSignals.some((signal) => lowerResume.includes(signal));
  const projectsFound = projectSignals.some((signal) => lowerResume.includes(signal));
  const score = Math.round(skillScore * 0.8 + experienceScore * 0.1 + (educationFound ? 100 : 0) * 0.05 + (projectsFound ? 100 : 0) * 0.05);
  const evidence = matchedRequired.map((skill) => ({ skill, excerpt: findEvidence(resumeText, skill) })).filter((item) => item.excerpt);
  const recommendations = [];
  if (missingRequired.length) recommendations.push(`Required skills not detected: ${missingRequired.join(', ')}. Add them only if you genuinely have this experience; otherwise build evidence through projects or training.`);
  if (missingPreferred.length) recommendations.push(`Consider developing demonstrable experience in preferred skills: ${missingPreferred.join(', ')}.`);
  if (!projectsFound) recommendations.push('Add a Projects section with concrete outcomes, technologies and your individual contribution.');
  if (!educationFound) recommendations.push('Make your education and relevant certifications easy to locate.');
  if (!/\\b(result|improv|reduc|increas|achiev|\\d+%|\\d+ users|\\d+ projects)\\b/i.test(resumeText)) recommendations.push('Quantify achievements with credible metrics such as performance gains, users supported or project outcomes.');
  const verdict = score >= 80 ? 'Strong match' : score >= 65 ? 'Promising match' : score >= 45 ? 'Partial match' : 'Low match';
  return {
    score, verdict, skillScore, experienceScore, experienceYearsDetected: years,
    summary: `Found ${matchedRequired.length} of ${required.length} required skills and ${matchedPreferred.length} of ${preferred.length} preferred skills in the uploaded resume.`,
    skillsFound, matchedRequired, missingRequired, matchedPreferred, missingPreferred,
    evidence, educationFound, projectsFound, recommendations,
    scoring: [
      { label: 'Required and preferred skills', score: skillScore, weight: '80%' },
      { label: 'Experience signal', score: experienceScore, weight: '10%' },
      { label: 'Education section signal', score: educationFound ? 100 : 0, weight: '5%' },
      { label: 'Project / delivery evidence', score: projectsFound ? 100 : 0, weight: '5%' }
    ],
    disclaimer: 'This is a transparent keyword-and-evidence screening aid, not an AI hiring decision. It can miss synonyms, implicit experience and content in scanned/image-only documents. Review the evidence and verify every claim.'
  };
}
module.exports = { extractSkills, analyzeResume };
