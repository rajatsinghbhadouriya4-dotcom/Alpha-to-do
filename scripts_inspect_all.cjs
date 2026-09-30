const fs = require('fs');
const c = fs.readFileSync('original/bundle.js', 'utf8');
console.log('Router code:\n', c.substring(336500, 337700));
