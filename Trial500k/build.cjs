// Copy only this project's browser files. server.cjs remains local development only.
const { cpSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const frontendFiles = [
  "index.html",
  "styles.css",
  "data.js",
  "booking-core.js",
  "app.js",
  "assets"
];
const output = join(__dirname, 'dist');

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const file of frontendFiles) {
  cpSync(join(__dirname, file), join(output, file), { recursive: true });
}
console.log('Static frontend built in dist/');
