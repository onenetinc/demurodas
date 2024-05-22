const { db } = require('../helpers/firebase');
const sendEmail = require('./helpers/sendEmail');
const deleteUserDoc = require('./helpers/deleteUserDoc');
const userSignUpDisapprovedEmailBody = require('./emailBodies/userSignUpDisapprovedEmailBody');


const userDeleted = async (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`A user was deleted, beginning cleanup process...`);

      const email = user.email;
      const displayName = user.displayName;
      const id = user.uid;

      const query = await db.collection('users').doc(id).get();
      const userData = query.data();
      const welcomeSent = userData.welcomeSent;

      const deletionProms = [
        deleteUserDoc(db, id)
      ];

      if (!welcomeSent) {
        console.log(`This user deletion was caused by the admin rejecting a sign up`);

        const subject = `Your application has not been approved`;
        const body = userSignUpDisapprovedEmailBody(displayName);
        deletionProms.push(sendEmail(email, subject, body));
      }

      await Promise.all(deletionProms);

      if (deletionProms.length === 1) {
        console.log(`Removed user doc from Firebase - terminating now`);
      } else {
        console.log(`Removed user doc from Firebase and sent explainer email to user - terminating now`);
      }

      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'User deletion processed successfully' })
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

  return await userDeleted(user);
};






// const sendEmail = require('../helpers/sendEmail');
// const deleteUserDoc = require('../helpers/deleteUserDoc');
// const userSignUpDisapprovedEmailBody = require('../emailBodies/userSignUpDisapprovedEmailBody');

// const userDeleted = (db) => (user) => {

//     return new Promise(async(resolve, reject) => {

//         try {

//             console.log(`A user was deleted, beginning cleanup process...`);
    
//             const email = user.email;
//             const displayName = user.displayName;
//             const id = user.uid;
    
//             const query = await db.collection('users').doc(id).get();
//             const userData = query.data();
//             const welcomeSent = userData.welcomeSent;
    
//             const deletionProms = [
//                 deleteUserDoc(db, id)
//             ];
    
//             if (!welcomeSent) {
    
//                 console.log(`This user deletion was caused by the admin rejecting a sign up`);
    
//                 const subject = `Your application has not been approved`;
//                 const body = userSignUpDisapprovedEmailBody(displayName);
//                 deletionProms.push(sendEmail(email, subject, body));
    
//             }
    
//             await Promise.all(deletionProms);
    
//             if (deletionProms.length === 1) {
    
//                 console.log(`Removed user doc from Firebase - terminating now`);
    
//             } else {
    
//                 console.log(`Removed user doc from Firebase and sent explainer email to user - terminating now`);
    
//             }

//             resolve();
    
//         } catch (err) {
    
//             console.error(err);
//             reject();
    
//         }

//     });

// };

// module.exports = userDeleted;