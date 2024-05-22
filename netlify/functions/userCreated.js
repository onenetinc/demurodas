const { db } = require('../helpers/firebase');
const getAppSettings = require('./helpers/getAppSettings');
const getUserDoc = require('./helpers/getUserDoc');
const sendEmail = require('./helpers/sendEmail');
const userSignUpEmailBody = require('./emailBodies/userSignUpEmailBody');
const adminUserSignUpEmailBody = require('./emailBodies/adminUserSignUpEmailBody');


const userCreated = async (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`A user was created, sending notification email to the admin and to the user...`);

      const appSettings = await getAppSettings(db);
      const adminDisplayName = appSettings.adminDisplayName;

      const userEmail = user.email;
      const userId = user.uid;
      const userDisplayName = user.displayName;
      const userData = await getUserDoc(db, userId);

      let proms = [];

      const adminEmail = userData.americas ? appSettings.americasAdmin : appSettings.othersAdmin;
      userData.displayName = user.displayName;
      userData.email = user.email;
      const adminEmailSubject = `NEW TRADE APPLICATION`;
      const adminEmailBody = adminUserSignUpEmailBody(adminDisplayName, userData);
      proms.push(sendEmail(adminEmail, adminEmailSubject, adminEmailBody));

      const userEmailSubject = `Thank you for your application!`;
      const userEmailBody = userSignUpEmailBody(userDisplayName);
      proms.push(sendEmail(userEmail, userEmailSubject, userEmailBody));

      await Promise.all(proms);

      console.log(`Successfully sent new user sign up email to admin and new user - terminating now`);

      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'Notification emails sent successfully' })
      });
    } catch (err) {
      console.error(err);
      reject({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error: err.message })
      });
    }
  });
};

exports.handler = async (event, context) => {
  const user = JSON.parse(event.body);

  if (!user) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid request payload' })
    };
  }

  return await userCreated(user);
};





// const getAppSettings = require('../helpers/getAppSettings');
// const getUserDoc = require('../helpers/getUserDoc');
// const sendEmail = require('../helpers/sendEmail');
// const userSignUpEmailBody = require('../emailBodies/userSignUpEmailBody');
// const adminUserSignUpEmailBody = require('../emailBodies/adminUserSignUpEmailBody');

// const userCreated = (db) => (user) => {

//     return new Promise(async(resolve, reject) => {

//         try {

//             console.log(`A user was created, sending notification email to the admin and to the user...`);
    
//             const appSettings = await getAppSettings(db);
//             const adminDisplayName = appSettings.adminDisplayName;
    
//             const userEmail = user.email;
//             const userId = user.uid;
//             const userDisplayName = user.displayName;
//             const userData = await getUserDoc(db, userId);
    
//             let proms = [];
    
//             const adminEmail = userData.americas ? appSettings.americasAdmin : appSettings.othersAdmin;
//             userData.displayName = user.displayName;
//             userData.email = user.email;
//             const adminEmailSubject = `NEW TRADE APPLICATION`;
//             const adminEmailBody = adminUserSignUpEmailBody(adminDisplayName, userData);
//             proms.push(sendEmail(adminEmail, adminEmailSubject, adminEmailBody));
    
//             const userEmailSubject = `Thank you for your application!`;
//             const userEmailBody = userSignUpEmailBody(userDisplayName);
//             proms.push(sendEmail(userEmail, userEmailSubject, userEmailBody));
    
//             await Promise.all(proms);
    
//             console.log(`Successfully sent new user sign up email to admin and new user - terminating now`);

//             resolve();
    
//         } catch (err) {
    
//             console.error(err);
//             reject();
    
//         }
    
//     });

// }

// module.exports = userCreated;