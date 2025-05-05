// tests/fixtures.js
const base = require('@playwright/test');

exports.test = base.test.extend({
  accessToken: async ({ request }, use) => {
    const { generateSignature } = require('./generateSignature');
    const clientKey = '01HXRAYA91HTCB0FSJJPZRWJ2T';
    const { signature, timestamp } = generateSignature(clientKey, './private_key.pem');

    const res = await request.post('http://borobudur-svc.linkaja.dev:8000/bi/v1.0/access-token/b2b', {
      headers: {
        'X-CLIENT-KEY': clientKey,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature
      },
      data: {
        grantType: 'client_credentials'
      }
    });

    const json = await res.json();
    await use(json.accessToken); // token now accessible in tests as `accessToken`
  }
});
