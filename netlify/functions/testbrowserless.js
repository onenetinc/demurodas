// const puppeteer = require("puppeteer-extra");
//
// module.exports = async (req, res) => {
//   console.log("🚀 Connecting to Browserless...");
//
//   // Retrieve your Browserless API key from environment variables.
//   const BROWSERLESS_API_KEY = process.env.BROWSERLESS_API_KEY || "RjRbvDDTnIm2vN2d0126163c4ba7de95be0a42f050";
//   const browserWSEndpoint = `wss://chrome.browserless.io?token=${BROWSERLESS_API_KEY}`;
//
//   let browser;
//   try {
//     console.log("🔄 Attempting to connect to Browserless...");
//     browser = await puppeteer.connect({
//       browserWSEndpoint,
//       defaultViewport: { width: 1280, height: 800 },
//     });
//
//     console.log("✅ Connected to Browserless!");
//     console.log("🌐 Creating a new page...");
//
//     const page = await browser.newPage();
//     await page.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );
//
//     console.log("✅ Successfully created a new page.");
//
//     // Accept a product slug from the query string, or default to 'athena-side-table'
//     const productSlug = req.query.slug || "athena-side-table";
//     const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;
//
//     console.log(`🌍 Navigating to ${testURL}...`);
//     await page.goto(testURL, {
//       waitUntil: "networkidle2",
//       timeout: 25000,
//     });
//
//     console.log("✅ Page loaded successfully.");
//     await browser.close();
//
//     res.status(200).json({
//       message: "Navigation test completed successfully!",
//     });
//   } catch (error) {
//     console.error("❌ ERROR: Failed:", error);
//     if (browser) await browser.close();
//     res.status(500).json({
//       message: "Error occurred",
//       error: error.message,
//     });
//   }
// };
