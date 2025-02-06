const { db, bucket } = require('./helpers/firebase');
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
const getAppSettings = require('./helpers/getAppSettings');
const getProductPricing = require('./helpers/getProductPricing');
const puppeteer = require('puppeteer');
const generatePdf = require('./helpers/generatePdf');
const path = require('path');
const os = require('os');
const fs = require('fs');
const getWfItems = require('./helpers/getWfItems');

const generateProductPdfs = async (slug) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Generating PDFs for ${slug}`);

      let pricing = await getProductPricing({ slug });
      if (!pricing) throw new Error('Product pricing not found');

      pricing = pricing.replace(/<\/?strong[^>]*>/g, ''); // Clean up pricing HTML

      const appSettings = await getAppSettings(db);
      const backendMode = appSettings.backendMode;

      let pubPath = 'pdfs-pub-staging';
      let privPath = 'pdfs-priv-staging';

      // if (backendMode === 'production') {
      //   pubPath = 'pdfs-pub';
      //   privPath = 'pdfs-priv';
      // }

      const pubFilePath = `${pubPath}/${slug}`;
      const privFilePath = `${privPath}/${slug}`;

      // Puppeteer: Launch browser
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 120000, // Set timeout to 60 seconds
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1420, height: 2000 });

      // Navigate to the product page
      await page.goto(`https://demurodas.webflow.io/products/${slug}?mode=server`, {
        waitUntil: 'load',
        timeout: 0,
      });

      // Hide trade modal if present
      await page.evaluate(() => {
        const modal = document.getElementById('tradeModalWrapper');
        if (modal) modal.remove();
      });

      // Screenshot Page 1 (No Pricing)
      const tempPngPage1FilePath = path.join(os.tmpdir(), `${slug}-page1.png`);
      await page.screenshot({ path: tempPngPage1FilePath, type: 'png', fullPage: true });

      console.log('Took screenshot of Page 1 (no pricing)');

      // Hide Page 1 and show Page 2
      await page.evaluate(() => {
        document.querySelector('.landscape-pdf-wrapper').style.display = 'none';
        document.querySelector('.portrait-pdf-wrapper').style.display = 'none';
        document.querySelector('.pdf-page-2-wrapper').style.display = 'flex';
      });

      console.log('Modified web page to show Page 2');

      // Screenshot Page 2 without pricing
      const tempPubPngFilePath = path.join(os.tmpdir(), `${slug}-pub.png`);
      await page.screenshot({ path: tempPubPngFilePath, type: 'png', fullPage: true });

      console.log('Took screenshot of Page 2 (no pricing)');

      // Inject pricing into Page 2
      await page.evaluate((pricing) => {
        const priceEls = document.querySelectorAll("[data-pdf='price']");
        const priceHeadings = document.querySelectorAll("[data-pdf='priceHeading']");
        priceEls.forEach((el) => (el.innerHTML = pricing));
        priceEls.forEach((el) => (el.style.display = 'block'));
        priceHeadings.forEach((el) => (el.style.display = 'block'));
      }, pricing);

      console.log('Injected pricing into the web page');

      // Screenshot Page 2 with pricing
      const tempPrivPngFilePath = path.join(os.tmpdir(), `${slug}-priv.png`);
      await page.screenshot({ path: tempPrivPngFilePath, type: 'png', fullPage: true });

      console.log('Took screenshot of Page 2 (with pricing)');

      await browser.close();

      console.log('Took screenshots and closed browser');

      // Generate PDFs from PNGs
      const pdfs = await Promise.all([
        generatePdf(tempPngPage1FilePath, tempPubPngFilePath, `${slug}-pub.pdf`),
        generatePdf(tempPngPage1FilePath, tempPrivPngFilePath, `${slug}-priv.pdf`),
      ]);

      const tempPubPdfFilePath = pdfs[0];
      const tempPrivPdfFilePath = pdfs[1];

      const { v4: uuidv4 } = require('uuid');

      try {
        await bucket.file(pubFilePath).delete();
        console.log(`Deleted old file at ${pubFilePath}`);
      } catch (err) {
        if (err.code !== 404) { // Ignore "not found" error
          throw err;
        }
      }

      // Upload PDFs to storage bucket
      await Promise.all([
        bucket.upload(tempPubPdfFilePath, { 
          destination: pubFilePath, 
          public: true, 
          metadata: {
            contentType: 'application/pdf',
            firebaseStorageDownloadTokens: uuidv4(),
          }, 
        }),
        bucket.upload(tempPrivPdfFilePath, { 
          destination: privFilePath,
          metadata: {
            contentType: 'application/pdf',
          } 
        }),
      ]);

      console.log(`Uploaded PDFs for ${slug}`);

      // const fileRef = bucket.file('pdfs-pub-staging/acantha-center-table');
      // const downloadURL= await getDownloadURL(fileRef);
      // console.log(`Download URL: ${downloadURL}`);

      // Clean up temporary files
      [tempPngPage1FilePath, tempPubPngFilePath, tempPrivPngFilePath, tempPubPdfFilePath, tempPrivPdfFilePath].forEach((file) =>
        fs.unlinkSync(file)
      );

      resolve({ message: `PDFs for ${slug} generated and uploaded successfully` });
    } catch (err) {
      console.error(`Error generating PDFs for ${slug}:`, err);
      reject(err);
    }
  });
};

// Main function to iterate through slugs and overwrite PDFs
const main = async () => {
  try {
    const webflowItems = await getWfItems();
    // const webflowItems = webflowItemsOg.filter((item) => {
    //   return item.fieldData.slug === 'acantha-center-table' || item.fieldData.slug === 'acantha-side-table';
    // })


    const results = await Promise.allSettled(
      webflowItems.map((item) => generateProductPdfs(item.fieldData.slug))
    );

    // const results = [];
    // for (const item of webflowItems) {
    //   results.push(await generateProductPdfs(item.fieldData.slug));
    // }


    console.log('Finished generating PDFs for all items');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Item ${webflowItems[index].fieldData.slug}: Success`);
      } else {
        console.error(`Item ${webflowItems[index].fieldData.slug}: Failed`, result.reason);
      }
    });
  } catch (err) {
    console.error('Error in main function:', err);
  }
};

main();
