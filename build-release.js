#!/usr/bin/env node
// Build release: bundle JS → SEA → .exe → zip
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const RELEASE = path.join(__dirname, 'release');
const EXE_NAME = 'MakeItEasy.exe';
const EXE = path.join(DIST, EXE_NAME);

function run(cmd, label) {
  console.log(`\n→ ${label}...`);
  execSync(cmd, { cwd: __dirname, stdio: 'inherit' });
}

function clean() {
  console.log('\n→ Cleaning dist/...');
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.rmSync(RELEASE, { recursive: true, force: true });
  fs.mkdirSync(RELEASE, { recursive: true });
}

function copyFiles() {
  console.log('\n→ Copying static files...');
  const copyDir = (src) => {
    const dest = path.join(DIST, src);
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(path.join(__dirname, src), dest, { recursive: true });
  };
  copyDir('public');
  copyDir('prompts');
  // Empty data dir for user's API config
  fs.mkdirSync(path.join(DIST, 'data'), { recursive: true });
}

function createZip() {
  console.log('\n→ Creating release zip...');
  const filename = `MakeItEasy-v1.0.1-windows-x64.zip`;
  const outPath = path.join(RELEASE, filename);
  // Use PowerShell to create zip
  const ps = `Compress-Archive -Path '${DIST}\\*' -DestinationPath '${outPath}' -Force`;
  execSync(`powershell -Command "${ps}"`, { stdio: 'inherit' });
  console.log(`\n✅ Release: ${outPath}`);
  // Also copy standalone exe folder for testing
  fs.cpSync(DIST, path.join(RELEASE, 'standalone'), { recursive: true });
  console.log('✅ Standalone folder: release/standalone/');
}

console.log('=== Build Release ===');

clean();
run('node build-bundle.js', 'Bundle JS');
run('node --experimental-sea-config sea-config.json', 'Generate SEA blob');
run(`node -e "require('fs').copyFileSync(process.execPath, '${EXE.replace(/\\/g, '\\\\')}')"`, 'Copy node.exe');
run(`npx --yes postject ${EXE} NODE_SEA_BLOB dist/sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, 'Inject SEA blob');
copyFiles();
createZip();

console.log('\n=== Done ===');
