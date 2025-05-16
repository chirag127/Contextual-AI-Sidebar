const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create scripts directory if it doesn't exist
if (!fs.existsSync('scripts')) {
  fs.mkdirSync('scripts');
}

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read the SVG file
const svgPath = path.join(iconsDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Define the sizes to generate
const sizes = [16, 48, 128];

// Generate PNG files for each size
async function generatePngs() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated ${outputPath}`);
    }
    console.log('All PNG icons generated successfully!');
  } catch (error) {
    console.error('Error generating PNG icons:', error);
  }
}

generatePngs();
