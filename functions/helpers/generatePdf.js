const PDFDocument = require('pdfkit');
const path = require('path');
const os = require('os');
const fs = require('fs');

const generatePdf = (page1, page2, newFileName) => {

    return new Promise((resolve, reject) => {

        try {

            const tempPath = path.join(os.tmpdir(), newFileName);

            const doc = new PDFDocument({
                size: 'A4'
            });
            const writeStream = fs.createWriteStream(tempPath);
            doc.pipe(writeStream);
            doc.image(page1, 0, 0, {
                width: 595
            });
            doc.addPage().image(page2, 0, 0, {
                width: 595
            });

            doc.end();

            writeStream.on('finish', async () => {
                console.log('Created PDF file');
                const stats = fs.statSync(tempPath);
                console.log(`Size: ${stats.size}`);
                resolve(tempPath);
            });

            writeStream.on('error', (err) => {
                console.error(err);
                reject();
            });

        } catch (err) {

            console.error(err);
            reject(err);

        }

    });

}

module.exports = generatePdf;