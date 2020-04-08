const { StandardFonts, PDFDocument, rgb } = require("pdf-lib");
const { promises: fs } = require("fs");
const path = require("path");

// The cover we are trying to prepend
const COVER_FILE = path.resolve(__dirname, "cover.pdf");

// Not working set
const INPUT_FILE = path.resolve(__dirname, "input-problematic.pdf");
const OUTPUT_FILE = path.resolve(__dirname, "output-problematic.pdf");

// Working set
const INPUT_WORKING_FILE = path.resolve(__dirname, "input-working.pdf");
const OUTPUT_WORKING_FILE = path.resolve(__dirname, "output-working.pdf");

function range(size, startAt = 0) {
  return [...Array(size).keys()].map((i) => i + startAt);
}

async function mergePdfFiles(pdfArray) {
  const result = await PDFDocument.create();

  for (const doc of pdfArray) {
    const pageCount = doc.getPageCount();
    const pagesRange = range(pageCount);
    const copiedPages = await result.copyPages(doc, pagesRange);

    for (const page of copiedPages) {
      result.addPage(page);
    }
  }

  return result;
}

async function main(inputFileName, outputFileName) {
  const pdfBuffer = await fs.readFile(inputFileName);
  const coverBuffer = await fs.readFile(COVER_FILE);

  const doc = await PDFDocument.load(pdfBuffer);
  const cover = await PDFDocument.load(coverBuffer);
  const resultDoc = await mergePdfFiles([cover, doc]);
  const resultBytes = await resultDoc.save();

  await fs.writeFile(outputFileName, Buffer.from(resultBytes));
  console.log(`Output generated: ${outputFileName}`);
}

Promise.all([
  main(INPUT_FILE, OUTPUT_FILE),
  main(INPUT_WORKING_FILE, OUTPUT_WORKING_FILE),
])
  .then(() => process.exit())
  .catch(console.error);
