const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: 'demurodas.appspot.com'
});



const bucket = admin.storage().bucket();

const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});

const userId = 'kKTxSiT35ka9hE6JSkCXhgNYNuo2';


admin.auth().updateUser(userId, {

    password: 'ddaccess13!',
    disabled: false,
    emailVerified: true

});