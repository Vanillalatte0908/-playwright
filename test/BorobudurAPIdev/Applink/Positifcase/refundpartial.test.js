// Replace these values with your TestRail instance details
const fs = require('fs');  // Add this line to import fs
const FormData = require('form-data'); // Ensure you have FormData available
const { reportToTestRail } = require('../../testrail-helper'); // adjust the path as needed
const { test, expect, request } = require('@playwright/test');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process'); 
const { generateSignature } = require('../../generateSignature');
function generateUUID() {
return Math.floor(Math.random() * (100000000 - 1000000) + 1000000) * 123456789;
};

test('should retrieve access token and call account binding API', async ({ request, page }) => {

  const secretKey = 'fc1817afe3145b5045b74fec75ca5ea6';
  const encodingSignType = 'default';
  const clientKey = '01FSPERZ2G7MS4QYM5JSKZDTD8';
  const privateKeyPath = './test/private_key_linkage.pem'; // <== Make sure this file exists in your project
  const { signature, timestamp } = generateSignature(clientKey, privateKeyPath);
  const xtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  // Get access token
  const authResponse = await request.post('http://borobudur-svc.linkaja.dev:8000/bi/v1.0/access-token/b2b', {
    headers: {
      'X-CLIENT-KEY': '01FSPERZ2G7MS4QYM5JSKZDTD8',
      'X-TIMESTAMP': xtimestamp, // Add this
      'X-SIGNATURE': signature
    },
    data: {
      grantType: 'client_credentials'
    }
  });



  // Generate X-External-Id
  const externalId = String(generateUUID());  // Convert UUID to string
  console.log('X-External-Id:', externalId);

  //Generate Auth
  const xauthJson = await authResponse.json();
  const authToken = xauthJson.accessToken;  // Extract the access token
  const method = 'POST';
  const path = '/bi/applink/v1.0/debit/refund';
  const baseUrl = 'http://borobudur-svc.linkaja.dev:8000';
  const xxtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const partnerReferenceNo = `TRX${moment().unix()}`;

  const body = {
    "originalPartnerReferenceNo": "1746695985",
    "partnerRefundNo": "refqirefund0002",
    "merchantId": "snap_applink",
    "refundAmount": {
      "value": "150.00",
      "currency": "IDR"
    },
    "additionalInfo": {
      "approvalCode": "E81C776901",
      "terminalId": "snap_applink",
      "refundType": 2,
      "items": [
       {
          "id": "01",
          "name": "Item 1",
          "unitPrice": "150.00",
          "qty": "1"
        }
      ]
    }
  };
  
  const rawBody = JSON.stringify(body);
  const hashBody = CryptoJS.SHA256(rawBody).toString();
  const signingString = `${method}:${path}:${authToken}:${hashBody}:${timestamp}`;

  let xxsignature;
  if (encodingSignType === '2') {
    xxsignature = CryptoJS.HmacSHA512(signingString, secretKey).toString();
  } else {
    xxsignature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA512(signingString, secretKey));
  }
  console.log('Signing String:', signingString);
  console.log('Signature:', xxsignature);
  const bindResponse = await request.post(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-TIMESTAMP': xxtimestamp,
      'X-SIGNATURE': xxsignature,
      'X-PARTNER-ID': '01FSPERZ2G7MS4QYM5JSKZDTD8',
      'X-EXTERNAL-ID': externalId,
      'CHANNEL-ID': '95221',
      'Authorization': `Bearer ${authToken}`
    },
    data: body
  });
  const authJson = await bindResponse.json();
  console.log('Auth response:', JSON.stringify(authJson, null, 2)); // ADD THIS
  const fs = require('fs');
  const path1 = require('path');
  // Define full path to the file before using it
  const detailsPath = path1.resolve('api-details.json');
  
  // Write request and response details to the file
  fs.writeFileSync(detailsPath, JSON.stringify({
    request: {
      url: `${baseUrl}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-TIMESTAMP': xxtimestamp,
        'X-SIGNATURE': xxsignature,
        'X-PARTNER-ID': '01FSPERZ2G7MS4QYM5JSKZDTD8',
        'X-EXTERNAL-ID': externalId,
        'CHANNEL-ID': '95221',
        'Authorization': `Bearer ${authToken}`
      },
      body
    },
    response: authJson
  }, null, 2));
  
  // Upload the .json file as an attachment to TestRail
  await reportToTestRail(
    'C193517',
    1,
    'API Test Passed by Playwright',
    detailsPath,
    body,
    authJson
  );
  });