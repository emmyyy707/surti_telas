const fs = require('fs');
const path = require('path');

function getAllTsxTsFiles(dir) {
  const files = [];
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace patterns in order of longest to shortest to avoid overlap
  // First, handle the three-byte patterns
  content = content.replace(/â€œ/g, '"');   // left double quote
  content = content.replace(/â€˜/g, "'");  // left single quote
  content = content.replace(/â€™/g, "'");  // right single quote
  content = content.replace(/â€¢/g, '•');  // bullet
  content = content.replace(/â€”/g, ' — '); // em dash with spaces as per user

  // Then handle the two-byte pattern for right double quote
  // Note: we must be careful not to replace â€ that is part of â€œ or â€”
  // Since we already replaced the three-byte patterns, we can safely replace â€
  content = content.replace(/â€/g, '"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

const srcDir = path.join(__dirname, 'src');
const files = getAllTsxTsFiles(srcDir);
let fixedCount = 0;
for (const file of files) {
  if (fixFile(file)) {
    fixedCount++;
  }
}
console.log(`Total files fixed: ${fixedCount}`);