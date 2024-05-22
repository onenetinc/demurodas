const { admin } = require('../helpers/firebase');

const userId = 'kKTxSiT35ka9hE6JSkCXhgNYNuo2';

admin.auth().updateUser(userId, {
  password: 'ddaccess13!',
  disabled: false,
  emailVerified: true
}).then(userRecord => {
  console.log('Successfully updated user', userRecord.toJSON());
}).catch(error => {
  console.error('Error updating user:', error);
});

// const admin = require('firebase-admin');
// const functions = require('firebase-functions');
// const serviceAccountBuffer = Buffer.from(process.env.SERVICE_ACCOUNT, 'base64');
// const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf8'));

// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     storageBucket: 'demurodas.appspot.com'
// });



// const bucket = admin.storage().bucket();

// const db = admin.firestore();
// db.settings({
//     timestampsInSnapshots: true
// });

// const userId = 'kKTxSiT35ka9hE6JSkCXhgNYNuo2';


// admin.auth().updateUser(userId, {

//     password: 'ddaccess13!',
//     disabled: false,
//     emailVerified: true

// });