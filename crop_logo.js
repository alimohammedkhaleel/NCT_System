const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'client/frontend/src/assets/logo.png');
const outputPath = path.join(__dirname, 'client/frontend/src/assets/logo-cropped.png');

sharp(inputPath)
  .metadata()
  .then(meta => {
    console.log('Original size:', meta.width, 'x', meta.height);
    // The logo emblem takes roughly the top 55% of the image
    // The Arabic text is in the bottom ~45%
    const cropHeight = Math.round(meta.height * 0.55);
    return sharp(inputPath)
      .extract({ left: 0, top: 0, width: meta.width, height: cropHeight })
      .png()
      .toFile(outputPath);
  })
  .then(() => console.log('Saved:', outputPath))
  .catch(err => {
    // sharp not available, try a different approach
    console.error('Error:', err.message);
  });
