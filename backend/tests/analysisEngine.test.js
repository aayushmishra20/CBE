const test = require("node:test");
const assert = require("node:assert/strict");
const { extractSkills, analyzeResume } = require("../analysisEngine");

test("extracts canonical skills and aliases", () => {
  assert.deepEqual(extractSkills("Built a React.js and NodeJS app with Postgres"), ["node.js", "postgresql", "react"]);
});
test("calculates competency coverage and missing skills", () => {
  const result = analyzeResume({
    resumeText: "B.Tech education. Developed projects using JavaScript, React, Node.js and PostgreSQL. Internship experience.",
    jobDescription: "We need React, Node.js, PostgreSQL, AWS and Docker experience for this role.",
    fileName: "candidate.pdf"
  });
  assert.equal(result.score, 60);
  assert.deepEqual(result.matchedSkills, ["node.js", "postgresql", "react"]);
  assert.deepEqual(result.missingSkills, ["aws", "docker"]);
});
test("rejects job descriptions without recognised competencies", () => {
  assert.throws(() => analyzeResume({ resumeText: "A sufficiently long resume text with education and projects listed.", jobDescription: "A sufficiently long job description without any mapped technologies or competencies." }), /No recognised competencies/);
});