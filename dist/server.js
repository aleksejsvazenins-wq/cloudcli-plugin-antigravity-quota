import http from 'node:http';
import { exec } from 'node:child_process';

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (url.pathname === '/quota' || url.pathname === '/') {
    exec('npx antigravity-usage', { encoding: 'utf-8', env: process.env }, (err, stdout) => {
      const lines = (stdout || '').split('\n');
      let account = 'Google Account';
      const models = [];

      for (const line of lines) {
        if (line.includes('@')) {
          const match = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (match) account = match[1];
        }
        if (line.includes('%')) {
          const parts = line.split('│').map(s => s.trim()).filter(Boolean);
          if (parts.length >= 3) {
            const rawPct = parts[1];
            const numMatch = rawPct.match(/\d+/);
            const pct = numMatch ? parseInt(numMatch[0], 10) : 0;
            models.push({
              name: parts[0],
              remaining: rawPct,
              pct: pct,
              resetsIn: parts[2]
            });
          }
        }
      }

      res.writeHead(200);
      res.end(JSON.stringify({ account, models, raw: stdout }));
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(0, '127.0.0.1', () => {
  const addr = server.address();
  if (addr && typeof addr !== 'string') {
    console.log(JSON.stringify({ ready: true, port: addr.port }));
  }
});
