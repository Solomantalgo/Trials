// Static deployment only. Node runs this build, never the deployed frontend.
const { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } = require('node:fs');
const { extname, join, relative, resolve, sep } = require('node:path');

const root = __dirname;
const output = join(root, 'dist');
// All root-level JS files in these projects are browser scripts. Development,
// build and test scripts use .cjs and are deliberately excluded.
const browserFile = /\.(?:html|css|js|mjs|jpe?g|png|webp|svg|gif|avif|ico|woff2?|ttf|otf|webmanifest|pdf|mp4|webm)$/i;
const frontendFiles = readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isFile() && browserFile.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name))
  .map(entry => entry.name);

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const file of frontendFiles) cpSync(join(root, file), join(output, file));
cpSync(join(root, 'assets'), join(output, 'assets'), { recursive: true });

// Fail the build if an HTML/CSS dependency or a runtime asset was omitted.
function verifyReference(value, from = 'index.html') {
  if (!value || /^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(value) || value.includes('${')) return;
  const pathname = decodeURIComponent(value.split(/[?#]/)[0]);
  const target = pathname.startsWith('/')
    ? resolve(output, '.' + pathname)
    : resolve(output, from, '..', pathname);
  if (!target.startsWith(output + sep) || !existsSync(target) || !statSync(target).isFile()) {
    throw new Error(`Missing static dependency: ${value} (from ${from})`);
  }
}
for (const file of frontendFiles) {
  if (!['.html', '.css', '.js', '.mjs'].includes(extname(file))) continue;
  const source = readFileSync(join(output, file), 'utf8');
  if (file.endsWith('.html')) {
    for (const match of source.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) verifyReference(match[1], file);
  }
  if (file.endsWith('.css')) {
    for (const match of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) verifyReference(match[1], file);
  }
  if (/\.m?js$/.test(file)) {
    // Includes data-driven images and lazily loaded PDF scripts/font data.
    for (const match of source.matchAll(/["'`]((?:assets\/[^"'`\s]+|[\w./-]+\.(?:jpe?g|png|webp|svg|gif|avif|ico)))["'`]/g)) verifyReference(match[1], file);
  }
}
for (const required of ['index.html', 'app.js']) verifyReference(required);
if (existsSync(join(output, 'server.cjs'))) throw new Error('Development server must not be deployed.');
function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce((total, entry) =>
    total + (entry.isDirectory() ? countFiles(join(directory, entry.name)) : 1), 0);
}
console.log(`STATIC BUILD COMPLETE: ${relative(root, output)}/ — ${countFiles(output)} files; index.html and app.js verified.`);
