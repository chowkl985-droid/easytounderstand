const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COUNT = parseInt(process.argv[2]) || 100;
const FILE = path.join(__dirname, 'data', 'license-keys.json');

function randHex(len) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len).toUpperCase();
}

function checksum(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 0x10000).toString(16).padStart(4, '0').toUpperCase();
}

function generateKey() {
  const a = randHex(4);
  const b = randHex(4);
  const c = randHex(4);
  const base = a + b + c;
  const chk = checksum(base);
  return `MIE-${a}-${b}-${c}-${chk}`;
}

const keys = {};
for (let i = 0; i < COUNT; i++) {
  let key;
  do { key = generateKey(); } while (keys[key]);
  keys[key] = false;
}

const dir = path.dirname(FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify(keys, null, 2), 'utf-8');

console.log(`Generated ${Object.keys(keys).length} license keys → ${FILE}`);
console.log('Sample keys:');
const samples = Object.keys(keys).slice(0, 5);
samples.forEach(k => console.log('  ' + k));
