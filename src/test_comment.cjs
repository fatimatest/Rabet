var fs = require('fs');
var c = fs.readFileSync('D:\\opencode\\projectend\\my-react-app\\src\\mm.tsx', 'utf8');
var lines = c.split('\n');

// Replace InstructorsPage with a stub
var startLine = -1;
var endLine = -1;
for (var i = 0; i < lines.length; i++) {
  if (lines[i].includes('const InstructorsPage')) startLine = i;
  if (startLine > 0 && lines[i].includes('const SemestersPage')) {
    endLine = i - 1;
    break;
  }
}
console.log('InstructorsPage from line ' + (startLine+1) + ' to ' + (endLine+1));

if (startLine > 0 && endLine > startLine) {
  var stub = [
    'const InstructorsPage: React.FC = () => {',
    '  return <div><p>Stub</p></div>;',
    '};',
    ''
  ];
  var newLines = [].concat(
    lines.slice(0, startLine),
    stub,
    lines.slice(endLine + 1)
  );
  fs.writeFileSync('D:\\opencode\\projectend\\my-react-app\\src\\mm.tsx', newLines.join('\n'), 'utf8');
  console.log('Replaced InstructorsPage with stub');
}
