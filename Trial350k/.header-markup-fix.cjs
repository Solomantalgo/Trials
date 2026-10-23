const fs = require('node:fs');
const file = 'index.html';
const html = fs.readFileSync(file, 'utf8');
const before = '<span class="book-label">Book appointment</span> <span>';
if (!html.includes(before)) throw new Error('Book arrow markup not found');
fs.writeFileSync(file, html.replace(before, '<span class="book-label">Book appointment</span><span aria-hidden="true">'), 'utf8');
