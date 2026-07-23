const fs = require('fs');

function hasBOM(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.length >= 3 && 
           buffer[0] === 0xEF && 
           buffer[1] === 0xBB && 
           buffer[2] === 0xBF;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return false;
  }
}

function checkFile(filePath) {
  if (fs.existsSync(filePath)) {
    const bom = hasBOM(filePath);
    console.log(`${filePath}: ${bom ? 'BOM DETECTED' : 'No BOM'}`);
    
    // If it has BOM, show first few bytes
    if (bom) {
      const buffer = fs.readFileSync(filePath);
      console.log(`  First 10 bytes: [${buffer.slice(0, 10).join(', ')}]`);
      console.log(`  As string: "${buffer.toString('utf8', 0, 20)}"`);
    }
  } else {
    console.log(`${filePath}: NOT FOUND`);
  }
}

// Check all potential PostCSS config files
const files = [
  'postcss.config.json',
  '.postcssrc',
  '.postcssrc.json',
  '.postcssrc.js',
  '.postcssrc.yaml',
  '.postcssrc.yml',
  'postcss.config.cjs',
  'postcss.config.mjs'
];

// Also check standard JSON files
const jsonFiles = [
  'package.json',
  'tsconfig.json',
  'tsconfig.node.json',
  '.npmrc',
  '.eslintrc',
  '.eslintrc.json',
  '.babelrc',
  '.babelrc.json'
];

console.log('=== Checking PostCSS config files ===');
files.forEach(checkFile);

console.log('\n=== Checking standard JSON files ===');
jsonFiles.forEach(checkFile);