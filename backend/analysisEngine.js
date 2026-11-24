const CATALOG = {
  "Programming": ["javascript", "typescript", "python", "java", "c++", "c#", "go", "php", "ruby"],
  "Frontend": ["react", "angular", "vue", "html", "css", "tailwind", "bootstrap", "next.js"],
  "Backend & APIs": ["node.js", "express", "django", "flask", "fastapi", "rest api", "graphql", "microservices"],
  "Data & Databases": ["sql", "postgresql", "mysql", "mongodb", "sqlite", "redis", "data analysis", "pandas", "excel"],
  "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "linux", "git", "github", "ci/cd"],
  "AI & Machine Learning": ["machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "generative ai", "llm", "openai api"],
  "Engineering Practices": ["testing", "jest", "unit testing", "agile", "system design", "problem solving", "communication"]
};
const ALIASES = {
  "js": "javascript", "react.js": "react", "node": "node.js", "nodejs": "node.js",
  "postgres": "postgresql", "mongo": "mongodb", "restful api": "rest api",
  "amazon web services": "aws", "google cloud": "gcp", "ms azure": "azure",
  "ml": "machine learning", "ai": "generative ai", "scikit-learn": "machine learning",
  "communication skills": "communication", "problem-solving": "problem solving"
};
const ALL = [...new Set(Object.values(CATALOG).flat())];

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[\u2010-\u2015]/g, "-").replace(/\s+/g, " ");
}
function extractSkills(text) {
  const source = normalize(text);
  const found = new Set();
  for (const term of ALL) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("(^|[^a-z0-9+#.])" + escaped + "($|[^a-z0-9+#.])", "i").test(source)) found.add(term);
  }
  for (const [alias, canonical] of Object.entries(ALIASES)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp("(^|[^a-z0-9+#.])" + escaped + "($|[^a-z0-9+#.])", "i").test(source)) found.add(canonical);
  }
  return [...found].sort();
}
function analyzeResume({ resumeText, jobDescription, fileName }) {
  const resume = normalize(resumeText);
  const jd = normalize(jobDescription);
  if (resume.length < 40) throw new Error("The resume text is too short to analyse. Upload a text-based PDF or DOCX file.");
  if (jd.length < 40) throw new Error("Please provide a job description with at least 40 characters.");
  const resumeSkills = extractSkills(resume);
  const requiredSkills = extractSkills(jd);
  if (!requiredSkills.length) throw new Error("No recognised competencies were found in the job description. Add explicit skills or technologies and try again.");
  const matched = requiredSkills.filter(skill => resumeSkills.includes(skill));
  const missing = requiredSkills.filter(skill => !resumeSkills.includes(skill));
  const score = Math.round((matched.length / requiredSkills.length) * 100);
  const sections = [
    ["Education", /\b(bachelor|master|b\.tech|btech|degree|university|college|education)\b/i],
    ["Experience", /\b(experience|employment|internship|work history)\b/i],
    ["Projects", /\b(projects?|portfolio|built|developed|implemented)\b/i],
    ["Certifications", /\b(certifications?|certificates?|licensed)\b/i]
  ];
  const presentSections = sections.filter(([, re]) => re.test(resume)).map(([name]) => name);
  const absentSections = sections.filter(([name]) => !presentSections.includes(name)).map(([name]) => name);
  const categories = Object.entries(CATALOG).map(([category, skills]) => ({
    category,
    required: skills.filter(skill => requiredSkills.includes(skill)).length,
    matched: skills.filter(skill => requiredSkills.includes(skill) && resumeSkills.includes(skill)).length
  })).filter(item => item.required > 0);
  const recommendations = missing.slice(0, 8).map(skill => ({
    title: "Build evidence for " + skill,
    detail: "Add a relevant project, coursework example, certification, or measurable work outcome demonstrating " + skill + "."
  }));
  if (absentSections.length) recommendations.push({
    title: "Strengthen resume structure",
    detail: "Consider adding clearly labelled sections for: " + absentSections.join(", ") + "."
  });
  if (!recommendations.length) recommendations.push({
    title: "Make your evidence more specific",
    detail: "Your listed competencies cover the recognised job requirements. Add quantified outcomes and project evidence to make the match easier to verify."
  });
  const level = score >= 80 ? "Strong alignment" : score >= 55 ? "Moderate alignment" : score >= 30 ? "Developing alignment" : "Low alignment";
  return {
    id: require("crypto").randomUUID(),
    createdAt: new Date().toISOString(),
    fileName: fileName || "resume",
    score,
    level,
    summary: matched.length + " of " + requiredSkills.length + " recognised job-description competencies were found in the resume text.",
    matchedSkills: matched,
    missingSkills: missing,
    resumeSkills,
    requiredSkills,
    categories,
    sections: { present: presentSections, missing: absentSections },
    recommendations
  };
}
module.exports = { CATALOG, extractSkills, analyzeResume };