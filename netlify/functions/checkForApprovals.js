const { admin, db } = require('./helpers/firebase');
const getEnabledUsers = require('./helpers/getEnabledUsers');
const getWelcomeNotSent = require('./helpers/getWelcomeNotSent');
const welcomeUser = require('./helpers/welcomeUser');

const checkForApprovals = async (req, res) => {
  try {
    console.log(`Checking for newly approved users...`);

    const data = await Promise.all([
      getEnabledUsers(admin),
      getWelcomeNotSent(db)
    ]);

    const enabledUsers = data[0];
    const welcomeNotSent = data[1];

    if (welcomeNotSent.length === 0) {
      console.log(`There are no users with "welcomeSent = false" recorded in Firestore - terminating now`);
      return res.status(200).json({ message: 'No welcome emails to send' });
    } else if (Object.keys(enabledUsers).length === 0) {
      console.log(`There are no users who are currently enabled - terminating now`);
      return res.status(200).json({ message: 'No enabled users' });
    } else {
      let welcomeProms = [];
      welcomeNotSent.forEach(id => {
        if (enabledUsers[id]) {
          const email = enabledUsers[id].email;
          const displayName = enabledUsers[id].displayName;
          welcomeProms.push(welcomeUser(db, id, email, displayName));
        }
      });

      await Promise.all(welcomeProms);
      console.log(`Sent welcome emails and wrote Firestore update for ${welcomeProms.length} user(s) - terminating now`);
      return res.status(200).json({ message: `Sent welcome emails to ${welcomeProms.length} user(s)` });
    }
  } catch (err) {
    console.error(err);
    console.log(`Sending 500 error`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = checkForApprovals;





// const getEnabledUsers = require('../helpers/getEnabledUsers');
// const getWelcomeNotSent = require('../helpers/getWelcomeNotSent');
// const welcomeUser = require('../helpers/welcomeUser');

// const checkForApprovals = (db, admin) => async (req, res) => {

//     try {

//         console.log(`Checking for newly approved users...`);

//         const data = await Promise.all([
//             getEnabledUsers(admin),
//             getWelcomeNotSent(db)
//         ]);

//         const enabledUsers = data[0];
//         const welcomeNotSent = data[1];

//         if (welcomeNotSent.length === 0) {

//             console.log(`There are no users with "welcomeSent = false" recorded in Firestore - terminating now`);
//             return res.sendStatus(200);

//         } else if (Object.keys(enabledUsers).length === 0) { 

//             console.log(`There are no users who are currently enabled - terminating now`);
//             return res.sendStatus(200);

//         } else {

//             let welcomeProms = [];
//             welcomeNotSent.forEach(id => {

//                 if (enabledUsers[id]) {

//                     const email = enabledUsers[id].email;
//                     const displayName = enabledUsers[id].displayName;
//                     welcomeProms.push(welcomeUser(db, id, email, displayName));

//                 }

//             });

//             await Promise.all(welcomeProms);
//             console.log(`Sent welcome emails and wrote Firestore update for ${welcomeProms.length} user(s) - terminating now`);
//             return res.sendStatus(200);
            
//         }

//     } catch (err) {

//         console.error(err);
//         console.log(`Sending 500 error`);
//         res.sendStatus(500);

//     }

// };

// module.exports = checkForApprovals;