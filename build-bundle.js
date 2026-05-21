#!/usr/bin/env node
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['server.js'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  outfile: 'dist/server.bundle.js',
  external: [],
  minify: false,
  sourcemap: false,
}).then(() => {
  console.log('Bundle done → dist/server.bundle.js');
}).catch(() => process.exit(1));
