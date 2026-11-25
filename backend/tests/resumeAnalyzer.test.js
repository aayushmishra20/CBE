const test = require('node:test');
const assert = require('node:assert/strict');
const { extractSkills, analyzeResume } = require('../services/resumeAnalyzer');
const jobs = require('../data/jobs');

test('sample job library contains multiple entry-level roles', () => {
  assert.ok(jobs.length >= 6);
  assert.ok(jobs.some((job) => job.title.includes('Full Stack')));
});

test('extracts supported skills from resume text', () => {
  const skills = extractSkills('Built a React frontend with JavaScript and Node.js. Used PostgreSQL and Docker.');
  for (const skill of ['React', 'JavaScript', 'Node.js', 'PostgreSQL', 'Docker']) assert.ok(skills.includes(skill), skill);
});

test('analysis reports missing requirements and a bounded score', () => {
  const job = { requiredSkills: ['React', 'Node.js', 'MongoDB'], preferredSkills: ['Docker'], minExperience: 0 };
  const report = analyzeResume('B.Tech Computer Science. Developed a React project and deployed it.', job);
  assert.ok(report.score >= 0 && report.score <= 100);
  assert.ok(report.matchedRequired.includes('React'));
  assert.ok(report.missingRequired.includes('Node.js'));
  assert.ok(report.missingRequired.includes('MongoDB'));
  assert.ok(report.recommendations.length > 0);
});
