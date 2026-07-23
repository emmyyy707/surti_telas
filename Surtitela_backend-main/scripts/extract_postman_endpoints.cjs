const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'postman_collection.json');
const outFile = path.join(__dirname, '..', 'postman_endpoints.txt');
const c = JSON.parse(fs.readFileSync(file, 'utf8'));
let out = '';
(c.item || []).forEach(it => {
  const r = it.request || {};
  const m = r.method || '';
  const u = (r.url && r.url.raw) || '';
  let b = '-';
  if (r.body && typeof r.body.raw === 'string') b = r.body.raw.trim();
  out += `${m} ${u}\n${b}\n\n`;
});
fs.writeFileSync(outFile, out, 'utf8');
console.log('ok');
