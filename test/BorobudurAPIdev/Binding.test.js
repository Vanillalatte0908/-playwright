// tests/Binding.test.js
const { test, expect, request } = require('@playwright/test');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const { generateSignature } = require('./generateSignature');
function generateUUID() {
  return Math.floor(Math.random() * (100000000 - 1000000) + 1000000) * 123456789;
}

test('should retrieve access token and call account binding API', async ({ request }) => {
  const secretKey = 'mypertamina';
  const encodingSignType = 'default';
  const clientKey = '01HXRAYA91HTCB0FSJJPZRWJ2T';
  const privateKeyPath = './private_key.pem'; // <== Make sure this file exists in your project
  const { signature, timestamp } = generateSignature(clientKey, privateKeyPath);
  const xtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');

  // Get access token
  const authResponse = await request.post('http://borobudur-svc.linkaja.dev:8000/bi/v1.0/access-token/b2b', {
    headers: {
      'X-CLIENT-KEY': '01HXRAYA91HTCB0FSJJPZRWJ2T',
      'X-TIMESTAMP': xtimestamp, // Add this
      'X-SIGNATURE': signature
    },
    data: {
      grantType: 'client_credentials'
    }
  });

const authJson = await authResponse.json();
console.log('Auth response:', JSON.stringify(authJson, null, 2)); // ADD THIS
const accessToken = authJson.accessToken;
expect(accessToken).toBeTruthy();

  // Generate X-External-Id
  const externalId = String(generateUUID());  // Convert UUID to string
  console.log('X-External-Id:', externalId);

  //Generate Auth
  const xauthJson = await authResponse.json();
  const authToken = xauthJson.accessToken;  // Extract the access token
  const method = 'POST';
  const path = '/bi/v1.0/registration-account-binding';
  const baseUrl = 'http://borobudur-svc.linkaja.dev:8000';
  const xxtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const partnerReferenceNo = `TRX${moment().unix()}`;
  const uniqueState = `LinkajaAutomate${Number()}`;  // Use uuidv4() for unique state


  console.log('Access Token:', authToken); // Log for debugging

  const body = {
    merchantId: 'ss_pertamina',
    msisdn: '087892111234',
    additionalInfo: {
      partnerRedirectUrl: 'https://bankmandiri.co.id',
      state: uniqueState,
      scope: 'PAYMENT_GATEWAY',
      userId: '0000000011',
      name: 'refqiMM932',
      payMethod: 'direct_astrapay'
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
      'X-PARTNER-ID': '01HXRAYA91HTCB0FSJJPZRWJ2T',
      'X-EXTERNAL-ID': externalId,
      'CHANNEL-ID': '95221',
      'Authorization': `Bearer ${authToken}`
    },
    data: body
  });

  const bindResult = await bindResponse.json();
  console.log('Bind Response:', JSON.stringify(bindResult, null, 2));
  expect(bindResponse.ok()).toBeTruthy();


});
