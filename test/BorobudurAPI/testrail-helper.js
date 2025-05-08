const fs = require('fs');  // Import fs module
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');  // Ensure fetch is available in Node.js

async function reportToTestRail(caseId, statusId, comment, screenshotPath, requestDetails, responseDetails) {

  const runId = 13056;  // Replace with your actual run ID
  const form = new FormData();
  form.append('attachment', fs.createReadStream(screenshotPath));
  
  // Step 1: Add test result to TestRail
  const resultRes = await fetch(`https://testcaselinkaja.testrail.io/index.php?/api/v2/add_result_for_case/${runId}/${caseId.replace('C', '')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from('refqi_hussein@linkaja.id:Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX').toString('base64'),
    },
    body: JSON.stringify({
      status_id: statusId,
      comment,
      custom_environment: 2,  // Optional custom field, replace as needed
      custom_request_details: JSON.stringify(requestDetails, null, 2),
      custom_response_details: JSON.stringify(responseDetails, null, 2),
    }),
  });

  const resultJson = await resultRes.json();
  if (!resultRes.ok || !resultJson.id) {
    console.error('❌ Failed to create test result:', resultJson);
    return;
  }

  // Step 2: Upload the screenshot
  const uploadRes = await fetch(`https://testcaselinkaja.testrail.io/index.php?/api/v2/add_attachment_to_result/${resultJson.id}`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from('refqi_hussein@linkaja.id:Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX').toString('base64'),
    },
    body: form,
  });

  const uploadText = await uploadRes.text();
  if (!uploadRes.ok) {
    console.error('❌ Upload failed. Status:', uploadRes.status);
    console.error('❌ Response:', uploadText);
  } else {
    try {
      const uploadResult = JSON.parse(uploadText);
      console.log('✅ Uploaded attachment response:', uploadResult);
    } catch (e) {
      console.error('❌ Could not parse upload response:', uploadText);
    }
  }
}
module.exports = { reportToTestRail };