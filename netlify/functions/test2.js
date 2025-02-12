const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  console.log("🚀 Connecting to Browserless...");

  let browser;
  try {
    console.log("🔄 Attempting to connect to Browserless...");
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    console.log("🌐 Creating a new page...");

    const page = await browser.newPage();
    // await page.setUserAgent(
    //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    // );

    console.log("✅ Successfully created a new page.");

    // Accept a product slug from the query string, or default to 'athena-side-table'
    const productSlug = req.query.slug || "athena-side-table";
    const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;

    console.log(`🌍 Navigating to ${testURL}...`);
    await page.goto(testURL, {
      waitUntil: "load",
      timeout: 0,
    });

    console.log("✅ Page loaded successfully.");
    await browser.close();

    res.status(200).json({
      message: "Navigation test completed successfully!",
    });
  } catch (error) {
    console.error("❌ ERROR: Failed:", error);
    if (browser) await browser.close();
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
};
