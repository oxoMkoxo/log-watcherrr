const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'log');

const messages = [
  'User logged in',
  'Error: Connection lost',
  'Reconnected successfully',
  'Cache refreshed',
  'Process restarted',
  'New session started',
  'API limit reached',
  'Payment received',
  'Request timed out',
  'Backup completed'
];

function appendRandomLog() {
  const message = messages[Math.floor(Math.random() * messages.length)];
  const timestamp = new Date().toLocaleString('en-US', { hour12: true });
  const logLine = `[LOG] ${timestamp} - ${message}\n`;

  fs.appendFile(filePath, logLine, 'utf8', (err) => {
    if (err) return console.error('❌ Write error:', err);
    console.log('🟢 Appended:', logLine.trim());
  });
}

// Append every 2 seconds
setInterval(appendRandomLog, 2000);
