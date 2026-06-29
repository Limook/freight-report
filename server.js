const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Route /api/config specifically to execute the serverless function locally (Ver 2.19)
  if (req.url.split('?')[0] === '/api/config') {
    try {
      // Clear cache to allow local development edits
      delete require.cache[require.resolve('./api/config.js')];
      const configHandler = require('./api/config.js');
      const mockRes = {
        status: (statusCode) => {
          res.statusCode = statusCode;
          return mockRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return mockRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(data));
        }
      };
      configHandler(req, mockRes);
    } catch (err) {
      console.error("Local server /api/config execution error:", err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
    return;
  }

  // Safe path resolution
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Strip query strings or hash parameters
  filePath = filePath.split('?')[0].split('#')[0];
  
  const absolutePath = path.join(__dirname, filePath);
  
  // Check if file is outside of project directory for security
  if (!absolutePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Access Denied');
    return;
  }

  fs.stat(absolutePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File Not Found');
      return;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    
    const stream = fs.createReadStream(absolutePath);
    stream.on('error', (streamErr) => {
      console.error(streamErr);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n==================================================');
  console.log('   로지로그 스마트폰 테스트용 로컬 서버 구동 시작');
  console.log('==================================================\n');
  console.log(`[PC 로컬 접속 주소]: http://localhost:${PORT}\n`);
  console.log('--------------------------------------------------');
  console.log(' 스마트폰에서 접속하려면 아래 단계를 수행하세요:');
  console.log(' 1. 스마트폰과 PC를 동일한 공유기(Wi-Fi)에 연결합니다.');
  console.log(' 2. 스마트폰 브라우저를 열고 아래 주소 중 하나를 입력해 접속합니다:');
  console.log('--------------------------------------------------');
  
  const nets = os.networkInterfaces();
  let foundIp = false;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   👉 http://${net.address}:${PORT}`);
        foundIp = true;
      }
    }
  }

  if (!foundIp) {
    console.log('   ⚠️ 활성화된 로컬 네트워크 IP를 찾지 못했습니다.');
    console.log('   PC가 네트워크에 정상 연결되어 있는지 확인해 주세요.');
  }

  console.log('\n==================================================');
  console.log(' 서버를 종료하려면 터미널에서 Ctrl + C 를 누르세요.');
  console.log('==================================================\n');
});
