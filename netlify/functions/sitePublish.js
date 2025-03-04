const { db } = require('./helpers/firebase');
const getWfItems = require('./helpers/getWfItems');
const getMapping = require('./helpers/getMapping');
const createNewMapping = require('./helpers/createNewMapping');
const checkForDeletions = require('./helpers/checkForDeletions');
const checkforNewItems = require('./helpers/checkforNewItems');
const checkForUpdatedItems = require('./helpers/checkForUpdatedItems');
const deleteCmsItem = require('./helpers/deleteCmsItem');
// const processCmsItem = require('./helpers/processCmsItem');
const createProductPdfs = require('./helpers/createProductPdfs');
const fetch = require('node-fetch');

// force push 2

const sitePublish = async (req, res) => {
  try {
    console.log(`Webflow site was published, processing changes to the Products CMS collection...`);

    let [currentCmsItems, savedMapping] = await Promise.all([
      getWfItems(),
      getMapping(db)
    ]);

    const updatedMapping = createNewMapping(currentCmsItems);

    console.log("currentCmsItems length:", currentCmsItems.length);

    // check if savedMapping is empty
    if (Object.keys(savedMapping).length === 0) {
      Object.assign(savedMapping, updatedMapping);
      console.log("First-time setup: savedMapping initialized. Skipping updates & new items.");
      await db.collection('cmsMapping').doc('items').set(savedMapping);
      return res.status(200).send('Initial mapping setup completed');
    }
    // console.log("savedMapping:", savedMapping);

    /** 🔹 HANDLE DELETIONS **/
    const deletions = checkForDeletions(savedMapping, updatedMapping);
    if (deletions && deletions.length > 0) {
      console.log(`Processing ${deletions.length} deletions...`);
      await Promise.all(
        deletions.map(async (id) => {
          const imgUrl = savedMapping[id]?.imgUrl;
          if (imgUrl) {
            const extension = imgUrl.split('.').pop();
            const fileName = `${id}.${extension}`;
            await deleteCmsItem(fileName);
            console.log(`Deleted CMS item: ${fileName}`);
          }
          delete savedMapping[id];
        })
      );
    }

    /** 🔹 HANDLE UPDATES **/
    const updatedCmsItems = checkForUpdatedItems(savedMapping, updatedMapping);
    if (updatedCmsItems && updatedCmsItems.length > 0) {
      console.log(`Processing ${updatedCmsItems.length} updated items...`);
      await Promise.all(
        updatedCmsItems.map(async (id) => {
          const item = updatedMapping[id];
          if (!item.slug) {
            console.error(`Skipping item with ID ${id} due to missing slug`);
            return;
          }
          savedMapping[id] = item;
          // await processCmsItem(id, item.imgUrl);
          // await createProductPdfs(item.slug);
          const pdfEndpoint = `https://screenshot-app-pearl.vercel.app/api/generateProductPdfs.js?slug=${slug}`;
          fetch(pdfEndpoint)
              .then(response => {
                console.log(`Triggered PDF generation for ${slug} with status ${response.status}`);
              })
              .catch(error => {
                console.error(`Error triggering PDF generation for ${slug}:`, error);
              });
        })
      );
    }

    /** 🔹 HANDLE NEW ITEMS **/
    const newCmsItems = checkforNewItems(savedMapping, updatedMapping);
    if (newCmsItems && newCmsItems.length > 0) {
      console.log(`Processing ${newCmsItems.length} new items...`);
      await Promise.all(
        newCmsItems.map(async (id) => {
          const item = updatedMapping[id];
          if (!item.slug) {
            console.error(`Skipping item with ID ${id} due to missing slug`);
            return;
          }
          savedMapping[id] = item;
          // await processCmsItem(id, item.imgUrl);
          // await createProductPdfs(item.slug);
          const pdfEndpoint = `https://screenshot-app-pearl.vercel.app/api/generateProductPdfs.js?slug=${slug}`;
          fetch(pdfEndpoint)
              .then(response => {
                console.log(`Triggered PDF generation for ${slug} with status ${response.status}`);
              })
              .catch(error => {
                console.error(`Error triggering PDF generation for ${slug}:`, error);
              });
        })
      );
    }

    /** 🔹 UPDATE FIRESTORE **/
    await db.collection('cmsMapping').doc('items').set(savedMapping);
    console.log(`Updated Firestore CMS mapping with ${Object.keys(savedMapping).length} items`);

    return res.status(200).send('Site publish processed successfully');
  } catch (err) {
    console.error('Error in sitePublish:', err);
    return res.status(500).send('Internal Server Error');
  }
};

exports.handler = async (event, context) => {
  const req = {
    query: event.queryStringParameters,
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  };

  const res = {
    status: (code) => ({
      json: (data) => ({
        statusCode: code,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }),
      send: (message) => ({
        statusCode: code,
        body: message,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      })
    })
  };

  return await sitePublish(req, res);
};






// const getWfItems = require('../helpers/getWfItems');
// const getMapping = require('../helpers/getMapping');
// const createNewMapping = require('../helpers/createNewMapping');
// const checkForDeletions = require('../helpers/checkForDeletions');
// const checkforNewItems = require('../helpers/checkforNewItems');
// const checkForUpdatedItems = require('../helpers/checkForUpdatedItems');
// const publishMessage = require('../helpers/publishMessage');


// const sitePublish = (db) => async (res) => {

//     try {

//         console.log(`Webflow site was published, processing any changes to the Products CMS collection...`);

//         const proms = [
//             getWfItems(),
//             getMapping(db)
//         ];

//         const results = await Promise.all(proms);

//         const currentCmsItems = results[0];
//         const savedMapping = results[1];
//         const updatedMapping = createNewMapping(currentCmsItems);

//         let toProcess = [];

//         const deletions = checkForDeletions(savedMapping, updatedMapping);

//         if (null !== deletions) {

//             deletions.forEach(id => {

//                 const imgUrl = savedMapping[id].imgUrl;
//                 if (imgUrl) {
//                     const parts = imgUrl.split('.');
//                     const extension = parts.pop();
//                     const fileName = id + '.' + extension;
//                     toProcess.push(publishMessage('deleteCmsItem', { fileName: fileName }));
//                 }
//                 delete savedMapping[id];
                
//             });

//         }

//         const updatedCmsItems = checkForUpdatedItems(savedMapping, updatedMapping);

//         if (null !== updatedCmsItems) {

//             updatedCmsItems.forEach(id => {

//                 savedMapping[id] = updatedMapping[id];
//                 toProcess.push(publishMessage('processCmsItem', { id: id, imgUrl: updatedMapping[id].imgUrl }));
//                 toProcess.push(publishMessage('generateProductPdfs', { slug: updatedMapping[id].slug }));

//             });

//         }

//         const newCmsItems = checkforNewItems(savedMapping, updatedMapping);

//         if (null !== newCmsItems) {

//             newCmsItems.forEach(id => {

//                 savedMapping[id] = updatedMapping[id];
//                 toProcess.push(publishMessage('processCmsItem', { id: id, imgUrl: updatedMapping[id].imgUrl }));
//                 toProcess.push(publishMessage('generateProductPdfs', { slug: updatedMapping[id].slug }));

//             });

//         }

//         db.collection('cmsMapping').doc('items').set(savedMapping);

//         console.log(`To process: ${toProcess.length}`);

//         if (newCmsItems) {

//             console.log(`New items: ${newCmsItems.length}`);

//         }

//         if (updatedCmsItems) {

//             console.log(`Updated items: ${updatedCmsItems.length}`);

//         }

//         if (deletions) {

//             console.log(`Deleted items: ${deletions.length}`);

//         }

//         if (toProcess.length > 0) {

//             await Promise.all(toProcess);
//             console.log(`Sent all messages`);

//         }

//         return res.sendStatus(200);

//     } catch (err) {

//         console.error(err);
//         return res.sendStatus(500);

//     }

// }

// module.exports = sitePublish;