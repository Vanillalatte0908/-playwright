// tests/Binding.test.js
const { test, expect, request } = require('@playwright/test');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process'); 
const { generateSignature } = require('../../generateSignature');
function generateUUID() {
  return Math.floor(Math.random() * (100000000 - 1000000) + 1000000) * 123456789;
}

test('should retrieve access token and call account binding API', async ({ request, page }) => {
  const secretKey = 'fc1817afe3145b5045b74fec75ca5ea6';
  const encodingSignType = 'default';
  const clientKey = '01FSPERZ2G7MS4QYM5JSKZDTD8';
  const privateKeyPath = '../private_key_linkage.pem'; // <== Make sure this file exists in your project
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
      merchantId: '506300908492350',
      msisdn: '6281113019700',
      additionalInfo: {
          partnerRedirectUrl: 'https://google.com',
          state: 'MM1538archive000100129516',
          scope:'DIRECT_DEBIT_TRANSACTION'
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

  const bindResult = await bindResponse.json();
  console.log('Bind Response:', JSON.stringify(bindResult, null, 2));
  expect(bindResponse.ok()).toBeTruthy();
  

  //redirectURL
  const redirectUrl = bindResult.redirectUrl;
  console.log('Redirect URL:', redirectUrl);

  // 4. Visit redirect URL and simulate flow
  await page.goto(redirectUrl, { waitUntil: 'networkidle' });

  //Click WEb
  await page.locator('#sapper label span').click();
  await page.getByRole('button', { name: 'Lanjut' }).click();
  await page.getByRole('textbox', { name: 'Masukkan nama lengkap kamu' }).click();
  await page.getByRole('textbox', { name: 'Masukkan nama lengkap kamu' }).fill('refqi');
  await page.getByRole('textbox', { name: 'Masukkan email kamu' }).first().click();
  await page.getByRole('textbox', { name: 'Masukkan email kamu' }).first().fill('hussein@hussein.com');
  await page.getByRole('textbox', { name: 'Masukkan email kamu' }).nth(1).fill('hussein@hussein.com');
  await page.getByRole('button', { name: 'Lanjutkan Proses' }).click(); 

  await page.getByRole('textbox', { name: 'Masukkan 6 digit PIN kamu' }).click();
  await page.getByRole('textbox', { name: 'Masukkan 6 digit PIN kamu' }).fill('123455');
  await page.getByRole('textbox', { name: 'Masukkan 6 digit PIN kembali' }).click();
  await page.getByRole('textbox', { name: 'Masukkan 6 digit PIN kembali' }).fill('123455');
  await page.getByRole('button', { name: 'Konfirmasi' }).click();
  await page.goto('https://www.google.com/?authCode=01JTFX021HYNRN9V5N33BZQZG5&responseCode=2001000&responseMessage=Successful&state=MM1538archive000100129516');

//Get B2B2C

  const privateKeyPath1 = './private_key_b2b2c.pem'; // <== Make sure this file exists in your project
  const { signature1, timestamp1 } = generateSignature(clientKey, privateKeyPath);
  const xtimestamp1= moment().format('YYYY-MM-DDTHH:mm:ssZ');
const b2b2c = await request.post('http://partner-dev.linkaja.com/bi/v1.0/access-token/b2b2c', {
  headers: {
    'X-CLIENT-KEY': '01FSPERZ2G7MS4QYM5JSKZDTD8',
    'X-TIMESTAMP': xtimestamp1, // Add this
    'X-SIGNATURE': signature1
  },
  data: {
    grantType: 'AUTHORIZATION_CODE',
    authCode: '01JT7FVADNT8B7HE8Z4CQDGAYH'  
  }

  
});
const authJson1 = await authResponse.json();
console.log('Auth response:', JSON.stringify(authJson1, null, 2)); // ADD THIS
const accessTokenCustomer = authJson1.accessTokenCustomer;
expect(accessTokenCustomer).toBeTruthy();

});