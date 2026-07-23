const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace patterns in order of longest to shortest to avoid overlap
  content = content.replace(/â€”/g, ' — '); // em dash with spaces as per user
  content = content.replace(/â€¢/g, '•');
  content = content.replace(/â€œ/g, '"');
  content = content.replace(/â€/g, '"'); // right double quote
  // Single quotes
  content = content.replace(/â€˜/g, "'");
  content = content.replace(/â€™/g, "'");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Test on App.tsx
const testPath = path.join(__dirname, 'src/presentation/pages/App.tsx');
console.log('Before fix:');
let before = fs.readFileSync(testPath, 'utf8');
console.log(before.split('\n')[31]); // line 32 (0-indexed)
fixFile(testPath);
console.log('After fix:');
let after = fs.readFileSync(testPath, 'utf8');
console.log(after.split('\n')[31]);