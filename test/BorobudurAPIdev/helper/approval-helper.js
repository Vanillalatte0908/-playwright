const { generateSignature } = require('../Signature/generateSignature');
// Replace these values with your TestRail instance details
const fs = require('fs');  // Add this line to import fs
const FormData = require('form-data'); // Ensure you have FormData available
//const { reportWithMultipleAttachments } = require('../testrail-helper'); // adjust the path as needed
const moment = require('moment');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process'); 
function generateUUID() {
return Math.floor(Math.random() * (100000000 - 1000000) + 1000000) * 123456789;
};

async function makePayment(request, expect) {
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
   const path = '/bi/v1.0/debit/payment-host-to-host';
   const baseUrl = 'http://borobudur-svc.linkaja.dev:8000';
   const xxtimestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
   const partnerReferenceNo = `TRX${moment().unix()}`;
   const uniqueState = `LinkajaAutomate${Number()}`;  // Use uuidv4() for unique state
 
 
   console.log('Access Token:', authToken); // Log for debugging
 
   const body = {
     "partnerReferenceNo": partnerReferenceNo,
     "merchantId": "506300908492350",
     "subMerchantId": "",
     "amount": {
         "value": "1800.00",
         "currency": "IDR"
     },
     "additionalInfo": {
         "type": "payment",
         "payerReferenceNumber": "6346346",
         "thirdPartyID": "POS_Broker",
         "password": "gMMqGGrKxsE=",
         "identifier": "DirectDebit",
         "securityCredential": "gMMqGGrKxsE="
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
       'Authorization': `Bearer ${authToken}`,
       'X-DEVICE-ID': '09864ADCASA',
       'Authorization-Customer': 'Bearer 2345' // <-- Add this if needed
 
     },
     data: body
   });

  const result = await bindResponse.json();
  const payment1 = await bindResponse.json();
  console.log('payment response:', JSON.stringify(payment1, null, 2)); 
  expect(payment1).toBeTruthy();
  return {
    approvalCode: result.approvalCode,
    partnerReferenceNo1: partnerReferenceNo, // reuse known partnerReferenceNo
  };
}

module.exports = { makePayment };
