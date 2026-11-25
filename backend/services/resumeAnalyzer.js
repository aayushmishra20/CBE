const SKILLS = [
  ['JavaScript', ['javascript', 'js', 'ecmascript']], ['TypeScript', ['typescript', 'ts']],
  ['React', ['react', 'react.js', 'reactjs']], ['Node.js', ['node.js', 'nodejs', 'node']],
  ['Express', ['express', 'express.js']], ['MongoDB', ['mongodb', 'mongo db']],
  ['PostgreSQL', ['postgresql', 'postgres']], ['SQL', ['sql', 'structured query language']],
  ['Python', ['python']], ['Java', ['java']], ['C++', ['c++']], ['C', [' c ', 'c language']],
  ['HTML', ['html', 'html5']], ['CSS', ['css', 'css3']], ['REST APIs', ['rest api', 'restful api', 'rest apis']],
  ['Git', ['git', 'github', 'gitlab']], ['Docker', ['docker', 'containerization']],
  ['AWS', ['aws', 'amazon web services']], ['Azure', ['azure']], ['Linux', ['linux', 'ubuntu']],
  ['Flask', ['flask']], ['FastAPI', ['fastapi', 'fast api']], ['Django', ['django']],
  ['Machine Learning', ['machine learning', ' ml ', 'ml model']], ['Scikit-learn', ['scikit-learn', 'sklearn']],
  ['TensorFlow', ['tensorflow']], ['PyTorch', ['pytorch']], ['Pandas', ['pandas']],
  ['NumPy', ['numpy']], ['NLP', ['natural language processing', ' nlp ']],
  ['Data Visualization', ['data visualization', 'data visualisation', 'visualization']],
  ['Statistics', ['statistics', 'statistical']], ['Excel', ['excel', 'spreadsheets']],
  ['Power BI', ['power bi']], ['Tableau', ['tableau']], ['Data Cleaning', ['data cleaning', 'data preprocessing']],
  ['Jest', ['jest']], ['Pytest', ['pytest']], ['Playwright', ['playwright']],
  ['Selenium', ['selenium']], ['API Testing', ['api testing', 'postman']],
  ['Automation Testing', ['automation testing', 'test automation']],
  ['CI/CD', ['ci/cd', 'continuous integration', 'continuous deployment']],
  ['Kubernetes', ['kubernetes', 'k8s']], ['Bash', ['bash', 'shell scripting']],
  ['OOP', ['object-oriented', 'object oriented', ' oops ', 'oop']],
  ['Data Structures', ['data structures', 'algorithms', 'dsa']],
  ['Spring Boot', ['spring boot']], ['JUnit', ['junit']],
  ['Problem Solving', ['problem solving', 'analytical thinking']],
  ['Communication', ['communication', 'stakeholder management']],
  ['Accessibility', ['accessibility', 'wcag']], ['Performance Optimization', ['performance optimization', 'web vitals']]
];

const normalize = (text) => ` ${String(text || '').toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ').replace(/\s+/g, ' ')} `;
function extractSkills(text) {
  const normalized = normalize(text);
  return SKILLS.filter(([, aliases]) => aliases.some((alias) => normalized.includes(alias))).map(([skill]) => skill);
}
function findEvidence(text, skill) {
  const sentences = String(text).split(/(?<=[.!?\n])\s+/).filter(Boolean);
  const entry = SKILLS.find(([name]) => name === skill);
  const aliases = entry ? entry[1] : [skill.toLowerCase()];
  const match = sentences.find((sentence) => aliases.some((alias) => normalize(sentence).includes(alias)));
  return match ? match.trim().slice(0, 260) : '';
}
function estimateExperience(text) {
  const patterns = [
    /\b(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:professional\s+)?experience\b/i,
    /\bexperience\s*[:\-]\s*(\d+(?:\.\d+)?)\s*\+?\s*years?\b/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return 0;
}
function analyzeResume(resumeText, job) {
  const skills = extractSkills(resumeText);
  const required = job.requiredSkills || [];
  const preferred = job.preferredSkills || [];
  const matchedRequired = required.filter((skill) => skills.includes(skill));
  const missingRequired = required.filter((skill) => !skills.includes(skill));
  const matchedPreferred = preferred.filter((skill) => skills.includes(skill));
  const missingPreferred = preferred.filter((skill) => !skills.includes(skill));
  const requiredCoverage = required.length ? matchedRequired.length / required.length : 0;
  const preferredCoverage = preferred.length ? matchedPreferred.length / preferred.length : 0;
  const skillScore = Math.round(requiredCoverage * 75 + preferredCoverage * 25);
  const years = estimateExperience(resumeText);
  const experienceScore = job.minExperience ? Math.min(100, Math.round(years / job.minExperience * 100)) : 100;
  const text = normalize(resumeText);
  const educationSignals = ['b.tech', 'bachelor', 'b.e.', 'b.sc', 'master', 'm.tech', 'degree', 'university', 'college'];
  const projectSignals = ['project', 'developed', 'built', 'implemented', 'designed', 'deployed'];
  const educationFound = educationSignals.some((word) => text.includes(word));
  const projectsFound = projectSignals.some((word) => text.includes(word));
  const score = Math.round(skillScore * 0.8 + (experienceScore * 0.1) + (educationFound ? 100 : 0) * 0.05 + (projectsFound ? 100 : 0) * 0.05);
  const evidence = matchedRequired.map((skill) => ({ skill, excerpt: findEvidence(resumeText, skill) })).filter((item) => item.excerpt);
  const recommendations = [];
  if (missingRequired.length) recommendations.push(`Address the required skills not found in the resume: ${missingRequired.join(', ')}. Add them only if you genuinely have that experience.`);
  if (missingPreferred.length) recommendations.push(`Consider building demonstrable experience in preferred skills: ${missingPreferred.join(', ')}.`);
  if (!projectsFound) recommendations.push('Add a Projects section with concrete outcomes, technologies and your individual contribution.');
  if (!educationFound) recommendations.push('Make your education and relevant certifications easy to locate.');
  if (!/\b(result|improv|reduc|increas|achiev|\d+%|\d+ users|\d+ projects)\b/i.test(resumeText)) recommendations.push('Quantify achievements with credible metrics such as performance gains, users supported or project outcomes.');
  const verdict = score >= 80 ? 'Strong match' : score >= 65 ? 'Promising match' : score >= 45 ? 'Partial match' : 'Low match';
  return {
    score, verdict, skillScore, experienceScore, experienceYearsDetected: years,
    summary: `Found ${matchedRequired.length} of ${required.length} required skills and ${matchedPreferred.length} of ${preferred.length} preferred skills in the uploaded resume.`,
    skillsFound: skills, matchedRequired, missingRequired, matchedPreferred, missingPreferred,
    evidence, educationFound, projectsFound, recommendations,
    scoring: [
      { label: 'Required and preferred skills', score: skillScore, weight: '80%' },
      { label: 'Experience signal', score: experienceScore, weight: '10%' },
      { label: 'Education section signal', score: educationFound ? 100 : 0, weight: '5%' },
      { label: 'Project / delivery evidence', score: projectsFound ? 100 : 0, weight: '5%' }
    ],
    disclaimer: 'This is a transparent keyword-and-evidence screening aid, not an AI hiring decision. It may miss synonyms, context and skills in scanned or image-only documents. Review the evidence and verify every claim.'
  };
}
module.exports = { extractSkills, analyzeResume };