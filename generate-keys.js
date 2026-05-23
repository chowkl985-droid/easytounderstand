const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COUNT = parseInt(process.argv[2]) || 100;
const FILE = path.join(__dirname, 'data', 'license-keys.json');
const CREEM_FILE = path.join(__dirname, 'data', 'keys-for-creem.txt');

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

const keys = new Set();
for (let i = 0; i < COUNT; i++) {
  let key;
  do { key = generateKey(); } while (keys.has(key));
  keys.add(key);
}

const dir = path.dirname(FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Save JSON backup (for your reference, not shipped to users)
const keyObj = {};
keys.forEach(k => { keyObj[k] = false; });
fs.writeFileSync(FILE, JSON.stringify(keyObj, null, 2), 'utf-8');

// Save plain text for Creem upload (one key per line)
fs.writeFileSync(CREEM_FILE, Array.from(keys).join('\n'), 'utf-8');

console.log(`Generated ${keys.size} license keys → ${FILE}`);
console.log(`Creem upload file → ${CREEM_FILE}`);
console.log('Sample keys:');
Array.from(keys).slice(0, 5).forEach(k => console.log('  ' + k));
