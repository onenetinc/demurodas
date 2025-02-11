const { chromium } = require("playwright");
const path = require("path");
const os = require("os");
const fs = require("fs");

exports.handler = async () => {
  console.log("🚀 Connecting to Browserless...");
  const browserURL = `wss://chrome.browserless.io?token=RjRbvDDTnIm2vN2d0126163c4ba7de95be0a42f050&--keep-alive=true`;

  try {
    console.log("🔄 Attempting to connect to Browserless...");
    const browser = await chromium.connectOverCDP(browserURL);
    console.log("✅ Connected to Browserless!");

    console.log("🌐 Creating a new page...");
    const page = await browser.newPage();
    console.log("✅ Successfully created a new page.");

    // **🌍 Navigate to Webflow product page**
    const productSlug = "athena-side-table"; // Change slug dynamically later
    const testURL = `https://demurodas.webflow.io/products/${productSlug}?mode=server`;

    console.log(`🌍 Navigating to: ${testURL}...`);
    await page.goto(testURL, { waitUntil: "domcontentloaded", timeout: 10000 });
    console.log("✅ Page loaded successfully.");

    // **📸 Take a screenshot**
    const screenshotPath = path.join(os.tmpdir(), "product_screenshot.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot taken: ${screenshotPath}`);

    // **📄 Generate a PDF**
    const pdfPath = path.join(os.tmpdir(), "product_output.pdf");
    await page.pdf({ path: pdfPath, format: "A4" });
    console.log(`📄 PDF generated: ${pdfPath}`);

    await browser.close();
    console.log("✅ Browser session closed.");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Webflow page successfully processed!",
        screenshotPath,
        pdfPath,
      }),
    };
  } catch (error) {
    console.error("❌ ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error occurred", error: error.message }),
    };
  }
};
