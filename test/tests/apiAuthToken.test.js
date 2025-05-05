// apiAuthToken.test.js
const { test, expect } = require('@playwright/test');
const { generateSignature } = require('./generateSignature');

test('Generate access token with signed headers', async ({ request }) => {
  const clientKey = '01HXRAYA91HTCB0FSJJPZRWJ2T';
  const privateKeyPath = './private_key.pem'; // <== Make sure this file exists in your project

  const { signature, timestamp } = generateSignature(clientKey, privateKeyPath);

  const response = await request.post('http://borobudur-svc.linkaja.dev:8000/bi/v1.0/access-token/b2b', {
    headers: {
      'X-CLIENT-KEY': clientKey,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    },
    data: {
      "grantType" : "client_credentials"
    }
  });

  const json = await response.json();
  console.log('Access token:', json.accessToken);
  expect(json.accessToken).toBeTruthy();
});
