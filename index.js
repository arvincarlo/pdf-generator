const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.get('/generate-pdf', async (req, res) => {
  const data = {
    password: '12345'
  }
  const tempPath = path.join(__dirname, 'protected.pdf');

  try {
    // Step 1: Create password-protected PDF
    const options = {
      userPassword: data.password, // required to open
      ownerPassword: data.password, // full access
      permissions: {
        printing: false,
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false
      }
    };

    const doc = new PDFDocument(options);
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    doc.text('This is a password protected PDF document.', 23, 23);
    doc.addPage();
    doc.text('Second page content.');

    doc.end();

    // Step 2: Wait for file to finish writing
    stream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');

      const fileStream = fs.createReadStream(tempPath);
      fileStream.pipe(res);

      res.on('finish', () => {
        fs.unlink(tempPath, () => {});
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});