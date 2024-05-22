const getRandomId = require('./helpers/getRandomId');
const getProductPricing = require('./helpers/getProductPricing');
const generatePdf = require('./helpers/generatePdf');
const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { bucket } = require('../helpers/firebase');


const generatePdfForProduct = async (slug) => {
  try {
    console.log(`Generating PDFs for ${slug}`);

    let pricing = await getProductPricing({ slug });
    if (!pricing) throw new Error('Product pricing not found');

    pricing = pricing.replace('<strong>', '');
    pricing = pricing.replace('</strong>', '');

    console.log(pricing);

    const fileName = getRandomId();

    console.log('Opening browser');

    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1320,
      height: 2000
    });
    await page.goto(`https://demurodas.webflow.io/products/${slug}?mode=pdf`, { waitUntil: 'load', timeout: 0 });

    const tempPubPngFilePath = path.join(os.tmpdir(), `${fileName}.pub.png`);
    await page.screenshot({
      path: tempPubPngFilePath,
      type: 'png',
      fullPage: true
    });

    const tempPrivPngFilePath = path.join(os.tmpdir(), `${fileName}.priv.png`);
    await page.evaluate((pricing) => {
      const priceHeading = document.getElementById('pdfPriceHeading');
      const priceEl = document.getElementById('pdfPrice');
      priceEl.innerHTML = pricing;
      [priceHeading, priceEl].forEach(el => el.style.display = 'block');
    }, pricing);
    await page.screenshot({
      path: tempPrivPngFilePath,
      type: 'png',
      fullPage: true
    });

    await browser.close();

    console.log('Took screenshots and closed browser');

    const pubPngStats = fs.statSync(tempPubPngFilePath);
    console.log(`Size of pub png: ${pubPngStats.size}`);
    const privPngStats = fs.statSync(tempPrivPngFilePath);
    console.log(`Size of priv png: ${privPngStats.size}`);

    const pdfs = await Promise.all([
      generatePdf(tempPubPngFilePath, `${fileName}.pub.pdf`),
      generatePdf(tempPrivPngFilePath, `${fileName}.priv.pdf`)
    ]);

    const tempPubPdfFilePath = pdfs[0];
    const tempPrivPdfFilePath = pdfs[1];

    await Promise.all([
      bucket.upload(tempPubPdfFilePath, { destination: `pdfs-pub/${slug}` }),
      bucket.upload(tempPrivPdfFilePath, { destination: `pdfs-priv/${slug}` })
    ]);

    console.log('Uploaded pdfs to storage');

    [tempPubPngFilePath, tempPrivPngFilePath, tempPubPdfFilePath, tempPrivPdfFilePath].forEach(el => fs.unlinkSync(el));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'PDFs generated and uploaded successfully' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: err.message })
    };
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
    }),
    sendFile: (filePath, callback) => {
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('open', () => {
        callback(null);
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/zip',
            'Access-Control-Allow-Origin': '*'
          },
          body: fileStream
        };
      });
      fileStream.on('error', (err) => {
        callback(err);
        return {
          statusCode: 500,
          body: 'Error sending file',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        };
      });
    }
  };

  const slug = req.query.slug;
  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing slug parameter' })
    };
  }

  return await generatePdfForProduct(slug);
};





// const getRandomId = require('../helpers/getRandomId');
// const getProductPricing = require('../helpers/getProductPricing');
// const generatePdf = require('../helpers/generatePdf')
// const puppeteer = require('puppeteer');

// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// const admin = require('firebase-admin');
// const serviceAccount = require('../service-account.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: 'demurodas.appspot.com'
// });

// const bucket = admin.storage().bucket();

// (async () => {

//     try {

//         console.log(`Generating PDFs for ${slug}`);

//         let pricing = await getProductPricing({ slug: slug });
//         if (!pricing) throw 404;

//         pricing = pricing.replace('<strong>', '');
//         pricing = pricing.replace('</strong>', '');

//         console.log(pricing);

//         const fileName = getRandomId();

//         console.log('Opening browser');

//         const browser = await puppeteer.launch({
//             args: ['--no-sandbox']
//         });
//         const page = await browser.newPage();
//         await page.setViewport({
//             width: 1320,
//             height: 2000
//         });
//         await page.goto(`https://demurodas.webflow.io/products/${slug}?mode=pdf`, { waitUntil: 'load', timeout: 0 });

//         const tempPubPngFilePath = path.join(os.tmpdir(), `${fileName}.pub.png`);
//         await page.screenshot({
//             path: tempPubPngFilePath,
//             type: 'png',
//             fullpage: true
//         });

//         const tempPrivPngFilePath = path.join(os.tmpdir(), `${fileName}.priv.png`);
//         await page.evaluate((pricing) => {
//             const priceHeading = document.getElementById('pdfPriceHeading');
//             const priceEl = document.getElementById('pdfPrice');
//             priceEl.innerHTML = pricing;
//             [priceHeading, priceEl].forEach(el => el.style.display = 'block');
//         }, pricing);
//         await page.screenshot({
//             path: tempPrivPngFilePath,
//             type: 'png',
//             fullpage: true
//         });

//         await browser.close();

//         console.log('Took screenshots and closed browser');

//         const pubPngStats = fs.statSync(tempPubPngFilePath);
//         console.log(`Size of pub png: ${pubPngStats.size}`);
//         const privPngStats = fs.statSync(tempPrivPngFilePath);
//         console.log(`Size of priv png: ${privPngStats.size}`);

//         const pdfs = await Promise.all([
//             generatePdf(tempPubPngFilePath, `${fileName}.pub.pdf`),
//             generatePdf(tempPrivPngFilePath, `${fileName}.priv.pdf`)
//         ]);

//         const tempPubPdfFilePath = pdfs[0];
//         const tempPrivPdfFilePath = pdfs[1];

//         await Promise.all([
//             bucket.upload(tempPubPdfFilePath, { destination: `pdfs-pub/${slug}` }),
//             bucket.upload(tempPrivPdfFilePath, { destination: `pdfs-priv/${slug}` }),
//         ]);

//         console.log('Uploaded pdfs to storage');

//         [tempPubPngFilePath, tempPrivPngFilePath, tempPubPdfFilePath, tempPrivPdfFilePath].forEach(el => fs.unlinkSync(el));


//     } catch (err) {

//         console.error(err);
//         reject(err);

//     }

// })();
