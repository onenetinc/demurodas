const { db, bucket } = require('./firebase');
const getAppSettings = require('./getAppSettings');
const getRandomId = require('./getRandomId');
const getProductPricing = require('./getProductPricing');
// const puppeteer = require('puppeteer');
const generatePdf = require('./generatePdf');
const path = require('path');
const os = require('os');
const fs = require('fs');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');


const createProductPdfs = async (slug) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Generating PDFs for ${slug}`);

      let pricing = await getProductPricing({ slug });
      if (!pricing) throw new Error('Product pricing not found');

      pricing = pricing.replace(/<\/?strong[^>]*>/g, '');

      console.log(pricing);

      const appSettings = await getAppSettings(db);
      const backendMode = appSettings.backendMode;

      console.log(`Function is running in ${backendMode} mode`);

      let pubPath = 'pdfs-pub-staging';
      let privPath = 'pdfs-priv-staging';

      if (backendMode === 'production') {
        pubPath = 'pdfs-pub';
        privPath = 'pdfs-priv';
      }

      const fileName = getRandomId();

      console.log('Opening browser');

      const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless
      });
      const page = await browser.newPage();
      await page.setViewport({
        width: 1420,
        height: 2000
      });
      await page.goto(`https://demurodas.webflow.io/products/${slug}?mode=server`, {
        waitUntil: 'load',
        timeout: 0
      });

      // Hide trade modal
      await page.evaluate(() => {
        document.getElementById('tradeModalWrapper').remove();
      });

      // Take screenshot of page 1, same for both public and private PDFs as doesn't have pricing
      const tempPngPage1FilePath = path.join(os.tmpdir(), `${fileName}.page1.png`);
      await page.screenshot({
        path: tempPngPage1FilePath,
        type: 'png',
        fullPage: true
      });

      console.log('Took screenshot of page 1');

      // Hide page 1 and show page 2
      await page.evaluate(() => {
        document.querySelector('.landscape-pdf-wrapper').style.display = 'none';
        document.querySelector('.portrait-pdf-wrapper').style.display = 'none';
        document.querySelector('.pdf-page-2-wrapper').style.display = 'flex';
      });

      console.log('Modified web page to show page 2');

      // Screenshot page 2 without pricing
      const tempPubPngFilePath = path.join(os.tmpdir(), `${fileName}.pub.png`);
      await page.screenshot({
        path: tempPubPngFilePath,
        type: 'png',
        fullPage: true
      });

      console.log('Took screenshot of page 2 without pricing');

      // Inject pricing into the page
      await page.evaluate((pricing) => {
        const priceEls = document.querySelectorAll("[data-pdf='price']");
        const priceHeadings = document.querySelectorAll("[data-pdf='priceHeading']");
        priceEls.forEach(el => el.innerHTML = pricing);
        priceEls.forEach(el => el.style.display = 'block');
        priceHeadings.forEach(el => el.style.display = 'block');
      }, pricing);

      console.log('Injected pricing into the web page');

      // Screenshot page 2 with pricing
      const tempPrivPngFilePath = path.join(os.tmpdir(), `${fileName}.priv.png`);
      await page.screenshot({
        path: tempPrivPngFilePath,
        type: 'png',
        fullPage: true
      });

      console.log('Took screenshot of page 2 with pricing');

      await browser.close();

      console.log('Took screenshots and closed browser');

      const page1PngStats = fs.statSync(tempPngPage1FilePath);
      console.log(`Size of page 1 png: ${page1PngStats.size}`);
      const pubPngStats = fs.statSync(tempPubPngFilePath);
      console.log(`Size of pub png: ${pubPngStats.size}`);
      const privPngStats = fs.statSync(tempPrivPngFilePath);
      console.log(`Size of priv png: ${privPngStats.size}`);

      const pdfs = await Promise.all([
        generatePdf(tempPngPage1FilePath, tempPubPngFilePath, `${fileName}.pub.pdf`),
        generatePdf(tempPngPage1FilePath, tempPrivPngFilePath, `${fileName}.priv.pdf`)
      ]);

      const tempPubPdfFilePath = pdfs[0];
      const tempPrivPdfFilePath = pdfs[1];

      await Promise.all([
        bucket.upload(tempPubPdfFilePath, {
          destination: `${pubPath}/${slug}`,
          public: true
        }),
        bucket.upload(tempPrivPdfFilePath, {
          destination: `${privPath}/${slug}`
        }),
      ]);

      console.log('Uploaded pdfs to storage');

      [tempPngPage1FilePath, tempPubPngFilePath, tempPrivPngFilePath, tempPubPdfFilePath, tempPrivPdfFilePath].forEach(el => fs.unlinkSync(el));

      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'PDFs generated and uploaded successfully' })
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

module.exports = createProductPdfs;


