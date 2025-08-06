const fs = require('fs');
const http = require('http');
const path = require('path');
const { getLastNLines } = require('./utils');

const clients = [];
const filePath = path.join(__dirname, 'log');
let lastSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;

const server = http.createServer((req, res) => {
  if (req.url === '/log') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
  }

  else if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // ✅ Send last 10 lines immediately
    const lastLines = getLastNLines(filePath, 10);
    lastLines.forEach(line => {
      const cleanLine = line.replace(/[\r\n]+/g, '').trim();
      res.write(`data: ${cleanLine}\n\n`);
    });

    clients.push(res);

    req.on('close', () => {
      const index = clients.indexOf(res);
      if (index !== -1) clients.splice(index, 1);
    });
  }

  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// 🔁 Watch file and stream only new content
let buffer = '';
fs.watchFile(filePath, { interval: 500 }, (curr, prev) => {
  if (curr.size > prev.size) {
    const stream = fs.createReadStream(filePath, {
      start: prev.size,
      end: curr.size,
      encoding: 'utf8'
    });

    let chunk = buffer + '';

    stream.on('data', (data) => {
      // buffer += data;

      const lines = data.split('\n');
      lines.pop(); // Save incomplete line for next round

      console.log('🔄 New lines detected:');
      lines.forEach((line, idx) => {
        const cleanLine = line.trim();
        if (cleanLine.length > 0) {
          const message = `data: ${cleanLine}\n\n`;
          clients.forEach(client => {
            client.write(message);
            // client.flush?.(); // optional flush for older browsers
          });
        }
      });
    });

    stream.on('end', () => {
      // lastSize = curr.size;
    });
  }
});

server.listen(3000, () => {
  console.log('✅ SSE server running at http://localhost:3000/log');
});
