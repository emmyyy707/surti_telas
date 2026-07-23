import fs from 'fs';
import path from 'path';

function checkBOM(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length >= 3) {
      // Check for UTF-8 BOM: EF BB BF
      if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error(`Error checking ${filePath}:`, err.message);
    return false;
  }
}

// Check all JSON files in the project
const jsonFiles = [
  'package.json',
  'tsconfig.json',
  'tsconfig.node.json'
];

jsonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const hasBOM = checkBOM(file);
    console.log(`${file}: ${hasBOM ? 'HAS BOM' : 'NO BOM'}`);
  }
});