const fs = require('fs');
const moment = require('moment');
const { KJUR, hextob64, KEYUTIL } = require('jsrsasign');

function generateSignature(clientKey, privateKeyPath) {
  const timestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
  const text = `${clientKey}|${timestamp}`;

  const privateKeyPEM = fs.readFileSync(privateKeyPath, 'utf8');
  const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
  const prvKey = KEYUTIL.getKey(privateKeyPEM);
  sig.init(prvKey);
  sig.updateString(text);
  const rawSignature = sig.sign();
  const base64Signature = hextob64(rawSignature);

  return {
    signature: base64Signature,
    timestamp: timestamp,
  };
}

module.exports = { generateSignature };