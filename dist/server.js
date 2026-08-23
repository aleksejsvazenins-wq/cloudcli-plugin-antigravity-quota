import http from 'node:http';
import { exec } from 'node:child_process';

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (url.pathname === '/quota' || url.pathname === '/') {
    exec('npx antigravity-usage --json', { encoding: 'utf-8', env: process.env }, (err, stdout) => {
      let result = null;
      try {
        result = JSON.parse(stdout);
      } catch (e) {
        // fallback regex parsing
      }

      if (result && result.models) {
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }

      // Если --json не дал объект, парсим текст таблицы
      exec('npx antigravity-usage', { encoding: 'utf-8', env: process.env }, (err2, stdout2) => {
        const lines = (stdout2 || '').split('\n');
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

        res.writeHead(200);
        res.end(JSON.stringify({ account, models }));
      });
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
