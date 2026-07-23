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
  const buffer = fs.readFileSync(filePath);
  // Convert buffer to latin1 string (treating each byte as a latin1 char)
  const latin1Str = buffer.toString('latin1');
  // Re-encode that string as latin1 to get the original bytes
  const fixedBytes = Buffer.from(latin1Str, 'latin1');
  // Decode those bytes as utf8 to get the correct string
  const fixedUtf8 = fixedBytes.toString('utf8');
  // If the fixed content is different, write back
  if (fixedUtf8 !== buffer.toString('utf8')) {
    fs.writeFileSync(filePath, fixedUtf8, 'utf8');
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