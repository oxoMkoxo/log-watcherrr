const fs = require('fs');

function getLastNLines(filePath, n) {
  if (!fs.existsSync(filePath)) return [];

  const fd = fs.openSync(filePath, 'r');
  const stats = fs.fstatSync(fd);
  const buffer = Buffer.alloc(1);
  const lines = [];
  let line = '';
  let pos = stats.size - 1;

  while (pos >= 0 && lines.length < n) {
    fs.readSync(fd, buffer, 0, 1, pos--);
    if (buffer[0] === 0x0a) {
      if (line) lines.unshift(line);
      line = '';
    } else {
      line = String.fromCharCode(buffer[0]) + line;
    }
  }
  if (line) lines.unshift(line);
  fs.closeSync(fd);

  return lines;
}

module.exports = { getLastNLines };
