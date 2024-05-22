// netlify/functions/helpers/firebase.js
const admin = require('firebase-admin');

const serviceAccountBuffer = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64');
const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf8'));

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
