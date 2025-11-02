const express = require('express');
const basicAuth = require('basic-auth');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Simple password middleware
function auth(req, res, next) {
  const user = basicAuth(req);
  const username = 'admin';
  const password = 'secret123';

  if (user && user.name === username && user.pass === password) {
    return next();
  } else {
    res.set('WWW-Authenticate', 'Basic realm="PDF Access"');
    return res.status(401).send('Authentication required.');
  }
}

app.get('/generate-pdf', auth, async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // You can customize this HTML or load from a file
    await page.setContent('<h1>Hello from Puppeteer!</h1><p>This PDF is password protected via Express.</p>');

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="puppeteer.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate PDF');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 