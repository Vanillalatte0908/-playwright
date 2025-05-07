const TestRail = require('testrail-api');
require('dotenv').config(); // Load from .env if using env variables (recommended)

const testrail = new TestRail({
  host: process.env.TESTRAIL_HOST || 'https://testcaselinkaja.testrail.io',
  user: process.env.TESTRAIL_USER || 'refqi_hussein@linkaja.id',
  password: process.env.TESTRAIL_API_KEY || 'Mysecret9892' // Consider using an API key
});

const runId = 13055; // Replace with your actual test run ID

async function reportToTestRail(caseId, statusId, comment) {
  try {
    await testrail.addResultForCase(runId, caseId, {
      status_id: statusId,
      comment: comment,
    });
    console.log(`✅ Reported result for C${caseId}`);
  } catch (error) {
    console.error(`❌ Failed to report result for C${caseId}:`, error);
  }
}

module.exports = {
  reportToTestRail
};
