// netlify/functions/helpers/firebase.js
const admin = require('firebase-admin');
// dotenv config
require('dotenv').config();

const serviceAccountBuffer = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64');
const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf8'));

// console.log("serviceAccountBuffer: ", serviceAccountBuffer);
// console.log("serviceAccount: ", serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'demurodas.appspot.com'
});

const db = admin.firestore();
db.settings({
  timestampsInSnapshots: true
});

const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
