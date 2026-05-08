const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const TARGET_URL = 'https://ezweystock.petrix.id/gpt/payment';

// MIME types untuk static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const PUBLIC_DIR = path.join(__dirname, 'public');

function serveStatic(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function handleProxy(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(body); } 
        catch { 
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
            return;
        }

        const payload = JSON.stringify({
            plan:     'plus',
            payment:  parsed.payment_method || 'shortlink',
            currency: 'Indonesia',
            session:  parsed.session_token
        });

        const options = {
            method:   'POST',
            hostname: 'ezweystock.petrix.id',
            path:     '/gpt/payment',
            headers: {
                'Content-Type':   'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Origin':         'https://ezweystock.petrix.id',
                'Referer':        'https://ezweystock.petrix.id/gpt/',
                'User-Agent':     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const proxyReq = https.request(options, proxyRes => {
            let data = '';
            proxyRes.on('data', chunk => { data += chunk; });
            proxyRes.on('end', () => {
                res.writeHead(200, {
                    'Content-Type':                'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        });

        proxyReq.on('error', err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err.message }));
        });

        proxyReq.write(payload);
        proxyReq.end();
    });
}

const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API proxy endpoint
    if (req.method === 'POST' && req.url === '/api/payment') {
        handleProxy(req, res);
        return;
    }

    // Static file serving
    let filePath = req.url === '/' ? '/index.html' : req.url;
    // remove query strings
    filePath = filePath.split('?')[0];
    const fullPath = path.join(PUBLIC_DIR, filePath);

    // Security: prevent path traversal
    if (!fullPath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    serveStatic(res, fullPath);
});

server.listen(PORT, () => {
    console.log(`\x1b[32m✓ Proxy server running → http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36m  API endpoint : POST /api/payment\x1b[0m`);
    console.log(`\x1b[36m  Static files : /public/\x1b[0m`);
});
