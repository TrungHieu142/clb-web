import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

export function createAppServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Định tuyến API
    if (url.pathname.startsWith('/api/')) {
      return handleApi(req, res, url);
    }

    // Phục vụ file tĩnh trong thư mục public
    try {
      let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch {
      // Fallback về index.html nếu không tìm thấy file
      try {
        const fallback = await readFile(path.join(PUBLIC_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallback);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
    }
  });
}

