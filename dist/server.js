import http from 'node:http';
import { exec } from 'node:child_process';

const PORT = parseInt(process.env.PORT || '0', 10);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  exec('npx antigravity-usage', { encoding: 'utf-8', env: process.env }, (err, stdout) => {
    const lines = (stdout || '').split('\n');
    let account = 'darewangog@gmail.com';
    const models = [];

    for (const line of lines) {
      if (line.includes('@')) {
        const match = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (match) account = match[1];
      }
      if (line.includes('%')) {
        const parts = line.split('│').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
          models.push({ name: parts[0], remaining: parts[1], resetsIn: parts[2] });
        }
      }
    }

    res.end(JSON.stringify({ account, models, raw: stdout }));
  });
});

if (PORT) {
  server.listen(PORT, '127.0.0.1');
}
