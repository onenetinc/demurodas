const { db, bucket } = require('./firebase');
const getAppSettings = require('./getAppSettings');
const getRandomId = require('./getRandomId');
const getProductPricing = require('./getProductPricing');
const generatePdf = require('./generatePdf');
const path = require('path');
const os = require('os');
const fs = require('fs');
const chromium = require('@sparticuz/chromium');
const { chromium: playwrightChromium } = require('playwright');

const createProductPdfs = async (slug) => {
  return new Promise(async (resolve, reject) => {
    let browser;
    let tempFiles = [];

    try {
      console.log(`Generating PDFs for ${slug}`);

      // Fetch product pricing
      let pricing = await getProductPricing({ slug });
      if (!pricing) throw new Error('Product pricing not found');

      pricing = pricing.replace(/<\/?strong[^>]*>/g, '');
      console.log(pricing);

      // Fetch app settings
      const appSettings = await getAppSettings(db);
      const backendMode = appSettings.backendMode;
      console.log(`Function is running in ${backendMode} mode`);

      // Determine storage paths
      let pubPath = backendMode === 'production' ? 'pdfs-pub' : 'pdfs-pub-staging';
      let privPath = backendMode === 'production' ? 'pdfs-priv' : 'pdfs-priv-staging';

      const fileName = getRandomId();
      console.log('Opening browser');

      // Get Chromium executable path
      const executablePath = await chromium.executablePath();

      console.log(`Chromium Executable Path: ${executablePath}`);

      if (!executablePath) {
        console.error("❌ ERROR: Chromium executable path is invalid! Exiting...");
        reject({
          statusCode: 500,
          body: JSON.stringify({ message: "Chromium executable not found. Aborting." })
        });
        return;
      }

      console.log("✅ Chromium is correctly installed and executable.");

      // Launch Playwright browser
      browser = await playwrightChromium.launch({
        executablePath,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--single-process',
          '--disable-features=site-per-process',
          '--disable-translate',
          '--disable-sync',
          '--no-zygote',
        ],
      });

      if (!browser) {
        console.error("❌ ERROR: Browser instance is NULL! Chromium may have crashed.");
        reject({
          statusCode: 500,
          body: JSON.stringify({ message: "Browser failed to launch. Check memory usage." })
        });
        return;
      }

      console.log("✅ Browser launched successfully. Creating a background page...");
      const backgroundPage = await browser.newPage(); // ✅ Keeps Playwright from closing early
      await backgroundPage.evaluate(() => new Promise(resolve => setTimeout(resolve, 60000))); // ✅ Keeps browser alive

      console.log("✅ Browser is stable. Creating new page...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // ✅ Delay to ensure stability

      const page = await browser.newPage();
      console.log("✅ Successfully created a new page.");
      await page.setViewportSize({ width: 1420, height: 2000 });

      // **Retry page.goto() in case of failures**
      let maxRetries = 3;
      let attempt = 0;
      while (attempt < maxRetries) {
        try {
          await page.goto(`https://demurodas.webflow.io/products/${slug}?mode=server`, {
            waitUntil: 'load', // ✅ More stable than 'networkidle' in Netlify
            timeout: 10000,
          });
          console.log('✅ Page loaded successfully.');
          break;
        } catch (error) {
          console.warn(`⚠️ Attempt ${attempt + 1} failed: ${error.message}`);
          attempt++;
          if (attempt === maxRetries) throw new Error('Failed to load page after multiple attempts');
        }
      }

      // Hide trade modal
      await page.evaluate(() => {
        const modal = document.getElementById('tradeModalWrapper');
        if (modal) modal.remove();
      });

      // **Take screenshot of page 1**
      const tempPngPage1FilePath = path.join(os.tmpdir(), `${fileName}.page1.png`);
      await page.screenshot({ path: tempPngPage1FilePath, fullPage: true });
      console.log('Took screenshot of page 1');

      // **Show page 2**
      await page.evaluate(() => {
        document.querySelector('.landscape-pdf-wrapper').style.display = 'none';
        document.querySelector('.portrait-pdf-wrapper').style.display = 'none';
        document.querySelector('.pdf-page-2-wrapper').style.display = 'flex';
      });

      console.log('Modified web page to show page 2');

      // **Take screenshot of page 2 without pricing**
      const tempPubPngFilePath = path.join(os.tmpdir(), `${fileName}.pub.png`);
      await page.screenshot({ path: tempPubPngFilePath, fullPage: true });
      console.log('Took screenshot of page 2 without pricing');

      // **Inject pricing into the page**
      await page.evaluate((pricing) => {
        const priceEls = document.querySelectorAll("[data-pdf='price']");
        const priceHeadings = document.querySelectorAll("[data-pdf='priceHeading']");
        priceEls.forEach(el => { el.innerHTML = pricing; el.style.display = 'block'; });
        priceHeadings.forEach(el => { el.style.display = 'block'; });
      }, pricing);

      console.log('Injected pricing into the web page');

      // **Take screenshot of page 2 with pricing**
      const tempPrivPngFilePath = path.join(os.tmpdir(), `${fileName}.priv.png`);
      await page.screenshot({ path: tempPrivPngFilePath, fullPage: true });
      console.log('Took screenshot of page 2 with pricing');

      // Close the browser
      await browser.close();
      console.log('Took screenshots and closed browser');

      // **Generate PDFs**
      const pdfs = await Promise.all([
        generatePdf(tempPngPage1FilePath, tempPubPngFilePath, `${fileName}.pub.pdf`),
        generatePdf(tempPngPage1FilePath, tempPrivPngFilePath, `${fileName}.priv.pdf`)
      ]);

      const tempPubPdfFilePath = pdfs[0];
      const tempPrivPdfFilePath = pdfs[1];

      // **Upload PDFs to Firebase Storage**
      await Promise.all([
        bucket.upload(tempPubPdfFilePath, {
          destination: `${pubPath}/${slug}`,
          public: true
        }),
        bucket.upload(tempPrivPdfFilePath, {
          destination: `${privPath}/${slug}`
        }),
      ]);

      console.log('Uploaded PDFs to storage');

      resolve({
        statusCode: 200,
        body: JSON.stringify({ message: 'PDFs generated and uploaded successfully' })
      });
    } catch (err) {
      console.error("❌ ERROR:", err);
      reject({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error', error: err.message })
      });

    } finally {
      // **Ensure temp files are always deleted**
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });

      if (browser) await browser.close();
    }
  });
};

module.exports = createProductPdfs;
