'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'demurodas.appspot.com'
});

const bucket = admin.storage().bucket();

const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true
});

process.env['GOOGLE_APPLICATION_CREDENTIALS'] = './service-account.json';

const signUp = require('./main/signUp')(db, admin);
const userCreated = require('./main/userCreated')(db);
const userDeleted = require('./main/userDeleted')(db);
const checkForApprovals = require('./main/checkForApprovals')(db, admin);
const getPrivateWfData = require('./main/getPrivateWfData')(admin);
const getProfile = require('./main/getProfile')(db, admin);
const updateProfile = require('./main/updateProfile')(db, admin);
const sitePublish = require('./main/sitePublish')(db);
const uploadToStorage = require('./main/uploadToStorage')(db, bucket);
const deleteFromStorage = require('./main/deleteFromStorage')(bucket);
const loadGridData = require('./main/loadGridData')(db);
const resetPassword = require('./main/resetPassword')(db, admin);
const createZip = require('./main/createZip')(admin);
const gaUsers = require('./main/gaUsers')(db, admin);
const generateProductPdfs = require('./main/generateProductPdfs')(db, bucket);


const runtimeOpts = {
    timeoutSeconds: 60,
    memory: '1GB',
    region: 'us-central1'
}


// User signs up from website function. This creates the Firebase
// user account and creates a user document in Firestore.
exports.signUp = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'POST') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            signUp(req, res);
        }
    });

// This function runs if a user is created. It sends a notification email
// to the admin and an explainer email to the user about approval process.
exports.userCreated = functions
    .runWith(runtimeOpts)
    .auth.user().onCreate((user) => {
        return userCreated(user);
    });

// This function runs if a user is deleted. This runs a clean up and 
// if the admin deleted the user sends an explainer email to the user
exports.userDeleted = functions
    .runWith(runtimeOpts)
    .auth.user().onDelete((user) => {
        return userDeleted(user);
    });

// This http function gets periodically hit by a cron job to check if
// the admin has approved any new users. If so, the user account is
// enabled and a password set link is sent to the user.
exports.checkForApprovals = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        res.set('Access-Control-Allow-Origin', '*');
        checkForApprovals(req, res);
    });

// This function accepts authenticated requests from the front end
// and returns private pricing and hi res image urls from WF CMS.
exports.getPrivateWfData = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'GET') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            getPrivateWfData(req, res);
        }
    });

// This function accepts authenticated requests from the front end
// and returns private pricing and hi res image urls from WF CMS.
exports.getProfile = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'GET') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            getProfile(req, res);
        }
    });

// User updates their profile function. This updates the Firebase
// user account and updates the user document in Firestore.
exports.updateProfile = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'POST') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            updateProfile(req, res);
        }
    });

// Webhook triggered by Webflow site publish. Processes all Products CMS
// collection items to detect any new, updated or deleted items. Any new
// or updated items are then processed to form the product pages masonry grids 
exports.sitePublish = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'POST') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            sitePublish(res);
        }
    });

// Triggered by a pubsub message to process a CMS item. Downloads the item's
// image, resizes to the sizes for the masonry grid, then uplods them to 
// Firebase storage
exports.uploadToStorage = functions
    .runWith(runtimeOpts)
    .pubsub.topic('processCmsItem')
    .onPublish(message => {
        return uploadToStorage(message);
    });

// Triggered by sitePublish if a deleted CMS item is detected
exports.deleteFromStorage = functions
    .runWith(runtimeOpts)
    .pubsub.topic('deleteCmsItem')
    .onPublish(message => {
        return deleteFromStorage(message);
    });

// Returns data for creating the masonry grids on the product pages
exports.loadGridData = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'GET') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            loadGridData(req, res);
        }
    });

exports.resetPassword = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'POST') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            resetPassword(req, res);
        }
    });

exports.createZip = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'GET') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            createZip(req, res);
        }
    });

exports.gaUsers = functions
    .runWith(runtimeOpts)
    .https.onRequest((req, res) => {
        if (req.method !== 'GET') {
            return res.sendStatus(405)
        } else {
            res.set('Access-Control-Allow-Origin', '*');
            gaUsers(req, res);
        }
    });

// Triggered by a pubsub message to process a CMS item. Creates
// PDFs of the products and saves them in storage
exports.generateProductPdfs = functions
    .runWith(runtimeOpts)
    .pubsub.topic('generateProductPdfs')
    .onPublish(message => {
        return generateProductPdfs(message);
    });