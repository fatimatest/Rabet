var fs = require('fs');
var c = fs.readFileSync('src/mm.tsx', 'utf8');
var opens = 0, closes = 0;
for (var i = 0; i < c.length; i++) {
  if (c[i] == '{') opens++;
  if (c[i] == '}') closes++;
}
console.log('opens:', opens, 'closes:', closes, 'diff:', opens - closes);
