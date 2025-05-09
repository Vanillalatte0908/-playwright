// Replace these values with your TestRail instance details
const fs = require('fs');  // Add this line to import fs
const FormData = require('form-data'); // Ensure you have FormData available
const { reportWithMultipleAttachments } = require('../../testrail-helper'); // adjust the path as needed
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
  const path = '/bi/wco/v1.0/debit/payment-host-to-host';
  const baseUrl = 'http://borobudur-svc.linkaja.dev:8000';
  const xxtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const partnerReferenceNo = `TRX${moment().unix()}`;
  const uniqueState = `LinkajaAutomate${Number()}`;  // Use uuidv4() for unique state


  console.log('Access Token:', authToken); // Log for debugging

  const body = {
    PartnerReferenceNo: partnerReferenceNo,
    merchantId: "testing_linkaja_wco",
    amount: {
      value: "1004.00",
      currency: "IDR"
    },
    urlParams: [
      {
        url: "https://google.com",
        type: "successUrl",
        isDeeplink: "N"
      },
      {
        url: "https://google.com",
        type: "failedUrl",
        isDeeplink: "N"
      }
    ],
    additionalInfo: {
      userKey : "wcotest1091",
      msisdn: '087787069388',
      editable: "Yes",
      defaultLanguage: "1",
      defaultTemplate: "2",
      items: [
        {
          name: "lenovo",
          price: "1004",
          qty: "1"
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

  //redirectURL
   //redirectURL
   const bindResult = await bindResponse.json();
   console.log('bindResult:', JSON.stringify(bindResult, null, 2));
   const redirectUrl = bindResult.webRedirectUrl;

  // 4. Visit redirect URL and simulate flow
  await page.goto(redirectUrl, { waitUntil: 'networkidle' });

  //Click WEb
  await page.getByRole('link', { name: 'Terms & Conditions' }).click();
  const path8 = require('path');
  const screenshotPath8 = path8.resolve(`screenshots/example8-${Date.now()}.png`);
  fs.mkdirSync('screenshots', { recursive: true });
  await page.screenshot({ path: screenshotPath8, fullPage: true });
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3000 ms = 3 seconds
  await page.locator('#modal-snk span').first().click();
  const path9 = require('path');
  const screenshotPath9 = path9.resolve(`screenshots/example8-${Date.now()}.png`);
  fs.mkdirSync('screenshots', { recursive: true });
  await page.screenshot({ path: screenshotPath9, fullPage: true });
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3000 ms = 3 seconds
 
  const authJson = await bindResponse.json();
  console.log('Auth response:', JSON.stringify(authJson, null, 2)); // ADD THIS
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
  await reportWithMultipleAttachments(
    'C296025',
    1,
    'API Test Passed by Playwright',
    [
    detailsPath,// your .json file
    body,
    authJson,
      screenshotPath8,
      screenshotPath9
    ],
  );
  
  });