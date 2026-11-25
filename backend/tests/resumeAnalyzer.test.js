const test = require('node:test');
const assert = require('node:assert/strict');
const { extractSkills, analyzeResume } = require('../services/resumeAnalyzer');

test('detects technologies using whole-token aliases', () => {
  const skills = extractSkills('Built a JavaScript and React app with Node.js, PostgreSQL and REST APIs.');
  assert.deepEqual(skills, ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs']);
});

test('does not infer Java from JavaScript or SQL from unrelated substrings', () => {
  const skills = extractSkills('I built a JavaScript interface and improved visual quality.');
  assert.equal(skills.includes('Java'), false);
  assert.equal(skills.includes('SQL'), false);
});

test('returns transparent required and preferred skill coverage', () => {
  const result = analyzeResume(
    'B.Tech graduate. Developed and deployed a React project using JavaScript and REST APIs. Improved response time by 20%.',
    {
      requiredSkills: ['React', 'JavaScript', 'Python'],
      preferredSkills: ['Git'],
      minExperience: 0
    }
  );
  assert.deepEqual(result.matchedRequired, ['React', 'JavaScript']);
  assert.deepEqual(result.missingRequired, ['Python']);
  assert.equal(result.matchedPreferred.length, 0);
  assert.equal(typeof result.score, 'number');
  assert.ok(result.evidence.some((item) => item.skill === 'React'));
});
