const TestRail = require('testrail-api');
const fs = require('fs');  // Add this line to import fs
const path = require('path');
const FormData = require('form-data');
const testrail = new TestRail({

  host: 'https://testcaselinkaja.testrail.io',
  user: 'refqi_hussein@linkaja.id',
  password: 'Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX',
});

async function reportToTestRail(caseId, statusId, comment) {
  const runId = 13056;
  const numericCaseId = caseId.startsWith('C') ? caseId.slice(1) : caseId;
  const screenshotPath = path.resolve('screenshot-api-test.png');
  const form = new FormData();
  const path1 = path.resolve('screenshot-api-test.png');
  const fileStream = fs.createReadStream(path1);  
  form.append('attachment', fs.createReadStream(screenshotPath));

  try {
    // First, post the test result
    const resultResponse = await fetch(`https://testcaselinkaja.testrail.io/index.php?/api/v2/add_result_for_case/${runId}/${numericCaseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from('refqi_hussein@linkaja.id:Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX').toString('base64')
      },
      body: JSON.stringify({
        status_id: statusId,
        comment,
        custom_environment: 2
      })
    });

    const resultData = await resultResponse.json();

    // Then, upload the screenshot as an attachment
    await fetch(`https://testcaselinkaja.testrail.io/index.php?/api/v2/add_attachment_to_result/${resultData.id}`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from('refqi_hussein@linkaja.id:Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX').toString('base64')
      },
      body: form
    });

    console.log(`✅ Reported to TestRail: case ${caseId}, status ${statusId} with screenshot`);
  } catch (err) {
    console.error('❌ Error reporting to TestRail:', err.message || err);
  }
}

module.exports = { reportToTestRail };
