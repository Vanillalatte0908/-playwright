const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const TESTRAIL_DOMAIN = 'https://testcaselinkaja.testrail.io';
const runId = 13083;
const auth = {
  username: 'refqi_hussein@linkaja.id',
  password: 'Awv/atGLoU6SnQxkWRuA-gaPQnVX1.AQMznm8qoyX'
};

async function reportWithMultipleAttachments(caseId, statusId, comment, attachments = [], requestDetails = {}, responseDetails = {}) {
  try {
    // Step 1: Add test result
    const resultRes = await axios.post(
      `${TESTRAIL_DOMAIN}/index.php?/api/v2/add_result_for_case/${runId}/${caseId.replace('C', '')}`,
      {
        status_id: statusId,
        comment,
        custom_environment: 2, // REQUIRED FIELD
        custom_request_details: JSON.stringify(requestDetails, null, 2),
        custom_response_details: JSON.stringify(responseDetails, null, 2),
      },
      { auth }
    );

    const resultId = resultRes.data.id;
    console.log(`✅ Test result created: ID ${resultId}`);

    // Step 2: Upload all attachments
    for (const filePath of attachments) {
      if (typeof filePath !== 'string' || !fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping invalid attachment path:`, filePath);
        continue;
      }

      const form = new FormData();
      form.append('attachment', fs.createReadStream(filePath));

      const uploadRes = await axios.post(
        `${TESTRAIL_DOMAIN}/index.php?/api/v2/add_attachment_to_result/${resultId}`,
        form,
        {
          headers: form.getHeaders(),
          auth
        }
      );

      console.log(`✅ Uploaded attachment: ${filePath}`);
    }
  } catch (error) {
    console.error('❌ Error reporting to TestRail:', error.response?.data || error.message);
  }
}

module.exports = { reportWithMultipleAttachments };