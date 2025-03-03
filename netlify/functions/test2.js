// const chromium = require("@sparticuz/chromium");
// const puppeteer = require("puppeteer-core");

// exports.handler = async (event, context) => {
//   console.log("🚀 Connecting to Browserless...");

//   let browser;
//   try {
//     console.log("🔄 Attempting to connect to Browserless...");
//     const browser = await puppeteer.launch({
//       args: chromium.args,
//       defaultViewport: chromium.defaultViewport,
//       executablePath: await chromium.executablePath(),
//       headless: chromium.headless,
//     });

//     console.log("🌐 Creating a new page...");

//     const page = await browser.newPage();
//     // await page.setUserAgent(
//     //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     // );

//     console.log("✅ Successfully created a new page.");

//     // Accept a product slug from the query string, or default to 'athena-side-table'
//     const productSlug = event.queryStringParameters?.slug || "athena-side-table";
//     const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;

//     console.log(`🌍 Navigating to ${testURL}...`);
//     await page.goto(testURL, {
//       waitUntil: "load",
//       timeout: 0,
//     });

//     console.log("✅ Page loaded successfully.");
//     await browser.close();

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: "Navigation test completed successfully!",
//       }),
//     };
//   } catch (error) {
//     console.error("❌ ERROR: Failed:", error);
//     if (browser) await browser.close();
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: "Error occurred",
//         error: error.message,
//       }),
//     };
//   }
// };
