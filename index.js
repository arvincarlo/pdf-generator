const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const app = express();
const port = 3000;

const width = 600;
const height = 400;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

app.get('/generate-pdf', async (req, res) => {
  const data = {
    password: '12345'
  };
  const tempPath = path.join(__dirname, 'protected.pdf');

  try {
    // Line Chart
    const lineChartConfig = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sales',
          data: [120, 150, 180, 90, 200],
          borderColor: 'blue',
          fill: false
        }]
      }
    };
    const lineChartBuffer = await chartCanvas.renderToBuffer(lineChartConfig);

    // Bar Chart
    const barChartConfig = {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
          label: 'Votes',
          data: [12, 19, 3],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
      }
    };
    const barChartBuffer = await chartCanvas.renderToBuffer(barChartConfig);

    // Pie Chart
    const pieChartConfig = {
      type: 'pie',
      data: {
        labels: ['Apple', 'Banana', 'Cherry'],
        datasets: [{
          data: [40, 30, 30],
          backgroundColor: ['#FF9999', '#99FF99', '#9999FF']
        }]
      }
    };
    const pieChartBuffer = await chartCanvas.renderToBuffer(pieChartConfig);

    // Create password-protected PDF
    const options = {
      userPassword: data.password,
      ownerPassword: data.password,
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

    doc.fontSize(16).text('Password Protected PDF with Charts', 50, 50);

    doc.addPage();
    doc.fontSize(14).text('Line Chart:', 50, 50);
    doc.image(lineChartBuffer, 50, 80, { width: 500 });

    doc.addPage();
    doc.fontSize(14).text('Bar Chart:', 50, 50);
    doc.image(barChartBuffer, 50, 80, { width: 500 });

    doc.addPage();
    doc.fontSize(14).text('Pie Chart:', 50, 50);
    doc.image(pieChartBuffer, 50, 80, { width: 500 });

    doc.end();

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