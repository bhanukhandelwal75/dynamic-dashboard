// proxy_server.js
// ─────────────────────────────────────────────────────────────────
// Serves extractor.html  AND  acts as CORS proxy for Boss APIs
//
// SETUP (one time only):
//   Make sure Node.js is installed → node --version
//
// USAGE every time:
//   1. Put this file + extractor.html in the SAME folder
//   2. Open Terminal in that folder and run:
//        node proxy_server.js
//   3. Open browser:  http://localhost:3001
// ─────────────────────────────────────────────────────────────────

// const http  = require('http');
// const https = require('https');
// const fs    = require('fs');
// const path  = require('path');
// const url   = require('url');

// const PORT = 3001;

// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin',  '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

//   // ── Serve the HTML page ───────────────────────────────────────
//   if (req.method === 'GET' && ['/', '/index.html', '/extractor.html'].includes(req.url)) {
//     const filePath = path.join(__dirname, 'extractor.html');
//     fs.readFile(filePath, (err, data) => {
//       if (err) {
//         res.writeHead(404);
//         res.end('extractor.html not found. Make sure both files are in the same folder.');
//         return;
//       }
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     });
//     return;
//   }

//   // ── CORS proxy ────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/proxy') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { method = 'GET', url: targetUrl, headers: extraHeaders = {}, body: reqBody } = payload;
//       if (!targetUrl) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing url' })); return; }

//       const parsed  = url.parse(targetUrl);
//       const isHttps = parsed.protocol === 'https:';
//       const bodyStr = reqBody ? JSON.stringify(reqBody) : undefined;

//       const options = {
//         hostname: parsed.hostname,
//         port:     parsed.port || (isHttps ? 443 : 80),
//         path:     parsed.path,
//         method:   method,
//         headers: {
//           'accept':       'application/json, text/plain, */*',
//           'content-type': 'application/json',
//           'user-agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//           ...extraHeaders,
//         },
//       };

//       if (bodyStr) options.headers['content-length'] = Buffer.byteLength(bodyStr);

//       const lib      = isHttps ? https : http;
//       const proxyReq = lib.request(options, (proxyRes) => {
//         let data = '';
//         proxyRes.on('data', chunk => { data += chunk; });
//         proxyRes.on('end', () => {
//           res.writeHead(proxyRes.statusCode, {
//             'Content-Type': proxyRes.headers['content-type'] || 'application/json',
//           });
//           res.end(data);
//         });
//       });

//       proxyReq.on('error', (err) => {
//         console.error('[proxy error]', targetUrl, err.message);
//         res.writeHead(502);
//         res.end(JSON.stringify({ error: err.message }));
//       });

//       if (bodyStr) proxyReq.write(bodyStr);
//       proxyReq.end();
//     });
//     return;
//   }

//   res.writeHead(404); res.end('Not found');
// });

// server.listen(PORT, () => {
//   console.log('\n✅  Boss MID Extractor is ready!');
//   console.log('─────────────────────────────────');
//   console.log('   Open this in your browser:');
//   console.log('   → http://localhost:' + PORT);
//   console.log('\n   Keep this terminal open while using the tool.');
//   console.log('   Press Ctrl+C to stop.\n');
// });




// const http     = require('http');
// const https    = require('https');
// const fs       = require('fs');
// const path     = require('path');
// const url      = require('url');
// const nodemailer = require('nodemailer'); // ← ADD THIS

// const PORT = 3001;

// // ── Email Config ──────────────────────────────────────────────────────────────
// const EMAIL_USER = 'bhanu.khandelwal@paytmpayments.com';      // ← aapki Gmail ID
// const EMAIL_PASS = 'hgpconyalyqafdkm';        // ← 16 digit App Password

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
// });

// // OTP in-memory store: { email: { otp, expires } }
// const otpStore = new Map();

// // ─────────────────────────────────────────────────────────────────────────────

// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin',  '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

//   // ── Serve the HTML page ───────────────────────────────────────
//   if (req.method === 'GET' && ['/', '/index.html', '/extractor.html'].includes(req.url)) {
//     const filePath = path.join(__dirname, 'extractor.html');
//     fs.readFile(filePath, (err, data) => {
//       if (err) {
//         res.writeHead(404);
//         res.end('extractor.html not found. Make sure both files are in the same folder.');
//         return;
//       }
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     });
//     return;
//   }

//   // ── Send OTP endpoint ─────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/send-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', async () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { email } = payload;
//       if (!email) {
//         res.writeHead(400);
//         res.end(JSON.stringify({ error: 'Email required' }));
//         return;
//       }

//       // Generate 6-digit OTP
//       const otp     = Math.floor(100000 + Math.random() * 900000).toString();
//       const expires = Date.now() + 5 * 60 * 1000; // 5 min expiry
//       otpStore.set(email.toLowerCase(), { otp, expires });

//       try {
//         await transporter.sendMail({
//           from:    `"AML Dashboard" <${EMAIL_USER}>`,
//           to:      email,
//           subject: 'Your OTP — AML Dashboard Login',
//           html: `
//             <div style="font-family:Inter,sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#f7f9fc;border-radius:12px;">
//               <div style="background:#1a73e8;color:#fff;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
//                 <h2 style="margin:0;font-size:18px;font-weight:700;">AML Dashboard — OTP Verification</h2>
//               </div>
//               <p style="color:#4a5568;font-size:14px;margin-bottom:8px;">Hello,</p>
//               <p style="color:#4a5568;font-size:14px;">Your one-time password for login is:</p>
//               <div style="background:#fff;border:2px solid #1a73e8;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
//                 <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1a73e8;">${otp}</span>
//               </div>
//               <p style="color:#8896ab;font-size:12px;">⏱ This OTP expires in <strong>5 minutes</strong>.</p>
//               <p style="color:#8896ab;font-size:12px;">🔒 Do not share this OTP with anyone.</p>
//               <hr style="border:none;border-top:1px solid #e4e7ed;margin:20px 0;"/>
//               <p style="color:#c0c9d6;font-size:11px;text-align:center;">AML Operations Dashboard · Internal Use Only</p>
//             </div>
//           `,
//         });

//         console.log(`[OTP] Sent to ${email} — OTP: ${otp}`);
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ success: true, message: 'OTP sent successfully' }));

//       } catch (err) {
//         console.error('[OTP Email Error]', err.message);
//         res.writeHead(500);
//         res.end(JSON.stringify({ error: 'Failed to send OTP email. Check email config.' }));
//       }
//     });
//     return;
//   }

//   // ── Verify OTP endpoint ───────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/verify-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { email, otp } = payload;
//       if (!email || !otp) {
//         res.writeHead(400);
//         res.end(JSON.stringify({ error: 'Email and OTP required' }));
//         return;
//       }

//       const stored = otpStore.get(email.toLowerCase());

//       if (!stored) {
//         res.writeHead(400);
//         res.end(JSON.stringify({ error: 'OTP not found. Please request a new one.' }));
//         return;
//       }

//       if (Date.now() > stored.expires) {
//         otpStore.delete(email.toLowerCase());
//         res.writeHead(400);
//         res.end(JSON.stringify({ error: 'OTP has expired. Please request a new one.' }));
//         return;
//       }

//       if (stored.otp !== otp.trim()) {
//         res.writeHead(400);
//         res.end(JSON.stringify({ error: 'Incorrect OTP. Please try again.' }));
//         return;
//       }

//       // ✅ OTP correct — delete it so it can't be reused
//       otpStore.delete(email.toLowerCase());
//       console.log(`[OTP] Verified successfully for ${email}`);
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ success: true }));
//     });
//     return;
//   }

//   // ── CORS proxy ────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/proxy') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { method = 'GET', url: targetUrl, headers: extraHeaders = {}, body: reqBody } = payload;
//       if (!targetUrl) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing url' })); return; }

//       const parsed  = url.parse(targetUrl);
//       const isHttps = parsed.protocol === 'https:';
//       const bodyStr = reqBody ? JSON.stringify(reqBody) : undefined;

//       const options = {
//         hostname: parsed.hostname,
//         port:     parsed.port || (isHttps ? 443 : 80),
//         path:     parsed.path,
//         method:   method,
//         headers: {
//           'accept':       'application/json, text/plain, */*',
//           'content-type': 'application/json',
//           'user-agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//           ...extraHeaders,
//         },
//       };

//       if (bodyStr) options.headers['content-length'] = Buffer.byteLength(bodyStr);

//       const lib      = isHttps ? https : http;
//       const proxyReq = lib.request(options, (proxyRes) => {
//         let data = '';
//         proxyRes.on('data', chunk => { data += chunk; });
//         proxyRes.on('end', () => {
//           res.writeHead(proxyRes.statusCode, {
//             'Content-Type': proxyRes.headers['content-type'] || 'application/json',
//           });
//           res.end(data);
//         });
//       });

//       proxyReq.on('error', (err) => {
//         console.error('[proxy error]', targetUrl, err.message);
//         res.writeHead(502);
//         res.end(JSON.stringify({ error: err.message }));
//       });

//       if (bodyStr) proxyReq.write(bodyStr);
//       proxyReq.end();
//     });
//     return;
//   }

//   res.writeHead(404); res.end('Not found');
// });

// server.listen(PORT, () => {
//   console.log('\n✅  Boss MID Extractor + AML Dashboard Server is ready!');
//   console.log('──────────────────────────────────────────────────────');
//   console.log('   Open this in your browser:');
//   console.log('   → http://localhost:' + PORT);
//   console.log('\n   OTP endpoints active:');
//   console.log('   → POST /api/send-otp');
//   console.log('   → POST /api/verify-otp');
//   console.log('\n   Keep this terminal open while using the tool.');
//   console.log('   Press Ctrl+C to stop.\n');
// });










// const http       = require('http');
// const https      = require('https');
// const fs         = require('fs');
// const path       = require('path');
// const url        = require('url');
// const nodemailer = require('nodemailer');
// const { spawn }  = require('child_process'); // ← FOR PYTHON

// const PORT = 3001;

// // ── Email Config ──────────────────────────────────────────────────────────────
// const EMAIL_USER = 'bhanu.khandelwal@paytmpayments.com';
// const EMAIL_PASS = 'hgpconyalyqafdkm';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: EMAIL_USER, pass: EMAIL_PASS },
// });

// // OTP in-memory store
// const otpStore = new Map();

// // Python job store: { jobId: { status, logs, result, error } }
// const jobStore = new Map();

// // ─────────────────────────────────────────────────────────────────────────────

// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin',  '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

//   // ── Serve the HTML page ───────────────────────────────────────────────────
//   if (req.method === 'GET' && ['/', '/index.html', '/extractor.html'].includes(req.url)) {
//     const filePath = path.join(__dirname, 'extractor.html');
//     fs.readFile(filePath, (err, data) => {
//       if (err) { res.writeHead(404); res.end('extractor.html not found.'); return; }
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     });
//     return;
//   }

//   // ── Send OTP endpoint ─────────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/send-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', async () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { email } = payload;
//       if (!email) { res.writeHead(400); res.end(JSON.stringify({ error: 'Email required' })); return; }

//       const otp     = Math.floor(100000 + Math.random() * 900000).toString();
//       const expires = Date.now() + 5 * 60 * 1000;
//       otpStore.set(email.toLowerCase(), { otp, expires });

//       try {
//         await transporter.sendMail({
//           from:    `"AML Dashboard" <${EMAIL_USER}>`,
//           to:      email,
//           subject: 'Your OTP — AML Dashboard Login',
//           html: `
//             <div style="font-family:Inter,sans-serif;max-width:420px;margin:0 auto;padding:32px;background:#f7f9fc;border-radius:12px;">
//               <div style="background:#1a73e8;color:#fff;padding:16px 24px;border-radius:8px;margin-bottom:24px;">
//                 <h2 style="margin:0;font-size:18px;font-weight:700;">AML Dashboard — OTP Verification</h2>
//               </div>
//               <p style="color:#4a5568;font-size:14px;margin-bottom:8px;">Hello,</p>
//               <p style="color:#4a5568;font-size:14px;">Your one-time password for login is:</p>
//               <div style="background:#fff;border:2px solid #1a73e8;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
//                 <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1a73e8;">${otp}</span>
//               </div>
//               <p style="color:#8896ab;font-size:12px;">⏱ This OTP expires in <strong>5 minutes</strong>.</p>
//               <p style="color:#8896ab;font-size:12px;">🔒 Do not share this OTP with anyone.</p>
//               <hr style="border:none;border-top:1px solid #e4e7ed;margin:20px 0;"/>
//               <p style="color:#c0c9d6;font-size:11px;text-align:center;">AML Operations Dashboard · Internal Use Only</p>
//             </div>
//           `,
//         });
//         console.log(`[OTP] Sent to ${email} — OTP: ${otp}`);
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ success: true, message: 'OTP sent successfully' }));
//       } catch (err) {
//         console.error('[OTP Email Error]', err.message);
//         res.writeHead(500);
//         res.end(JSON.stringify({ error: 'Failed to send OTP email. Check email config.' }));
//       }
//     });
//     return;
//   }

//   // ── Verify OTP endpoint ───────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/verify-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { email, otp } = payload;
//       if (!email || !otp) { res.writeHead(400); res.end(JSON.stringify({ error: 'Email and OTP required' })); return; }

//       const stored = otpStore.get(email.toLowerCase());
//       if (!stored) { res.writeHead(400); res.end(JSON.stringify({ error: 'OTP not found. Please request a new one.' })); return; }
//       if (Date.now() > stored.expires) {
//         otpStore.delete(email.toLowerCase());
//         res.writeHead(400); res.end(JSON.stringify({ error: 'OTP has expired. Please request a new one.' })); return;
//       }
//       if (stored.otp !== otp.trim()) { res.writeHead(400); res.end(JSON.stringify({ error: 'Incorrect OTP. Please try again.' })); return; }

//       otpStore.delete(email.toLowerCase());
//       console.log(`[OTP] Verified successfully for ${email}`);
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ success: true }));
//     });
//     return;
//   }

//   // ── Python: Start Job ─────────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/python/start') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { caseIds, startDate, endDate, cookie, csrfToken } = payload;

//       if (!caseIds || !caseIds.length) {
//         res.writeHead(400); res.end(JSON.stringify({ error: 'caseIds required' })); return;
//       }

//       // Generate unique job ID
//       const jobId = `job_${Date.now()}`;
//       jobStore.set(jobId, { status: 'running', logs: [], result: null, error: null });

//       // Write a temp Python script with injected params
//       const scriptContent = generatePythonScript(caseIds, startDate, endDate, cookie, csrfToken);
//       const scriptPath    = path.join(__dirname, `_temp_${jobId}.py`);
//       const outputPath    = path.join(__dirname, `_output_${jobId}.csv`);

//       fs.writeFileSync(scriptPath, scriptContent, 'utf8');

//       // Spawn Python process
//       const py = spawn('python3', [scriptPath], { cwd: __dirname });

//       py.stdout.on('data', (data) => {
//         const lines = data.toString().split('\n').filter(l => l.trim());
//         lines.forEach(line => {
//           console.log(`[PY] ${line}`);
//           jobStore.get(jobId).logs.push(line);
//         });
//       });

//       py.stderr.on('data', (data) => {
//         const line = data.toString().trim();
//         if (line) {
//           console.error(`[PY ERR] ${line}`);
//           jobStore.get(jobId).logs.push(`⚠ ${line}`);
//         }
//       });

//       py.on('close', (code) => {
//         const job = jobStore.get(jobId);
//         // Cleanup temp script
//         try { fs.unlinkSync(scriptPath); } catch {}

//         if (code === 0 && fs.existsSync(outputPath)) {
//           // Read CSV output
//           const csvData = fs.readFileSync(outputPath, 'utf8');
//           job.status = 'done';
//           job.result = csvData;
//           try { fs.unlinkSync(outputPath); } catch {}
//           console.log(`[PY] Job ${jobId} completed successfully.`);
//         } else {
//           job.status = 'error';
//           job.error  = `Python exited with code ${code}`;
//           console.error(`[PY] Job ${jobId} failed with code ${code}`);
//         }
//       });

//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ success: true, jobId }));
//     });
//     return;
//   }

//   // ── Python: Poll Job Status ───────────────────────────────────────────────
//   if (req.method === 'GET' && req.url.startsWith('/api/python/status/')) {
//     const jobId = req.url.replace('/api/python/status/', '');
//     const job   = jobStore.get(jobId);

//     if (!job) {
//       res.writeHead(404); res.end(JSON.stringify({ error: 'Job not found' })); return;
//     }

//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({
//       status: job.status,
//       logs:   job.logs,
//       result: job.result,
//       error:  job.error,
//     }));
//     return;
//   }

//   // ── CORS proxy ────────────────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/proxy') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload;
//       try { payload = JSON.parse(body); }
//       catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad JSON' })); return; }

//       const { method = 'GET', url: targetUrl, headers: extraHeaders = {}, body: reqBody } = payload;
//       if (!targetUrl) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing url' })); return; }

//       const parsed  = url.parse(targetUrl);
//       const isHttps = parsed.protocol === 'https:';
//       const bodyStr = reqBody ? JSON.stringify(reqBody) : undefined;

//       const options = {
//         hostname: parsed.hostname,
//         port:     parsed.port || (isHttps ? 443 : 80),
//         path:     parsed.path,
//         method:   method,
//         headers: {
//           'accept':       'application/json, text/plain, */*',
//           'content-type': 'application/json',
//           'user-agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//           ...extraHeaders,
//         },
//       };

//       if (bodyStr) options.headers['content-length'] = Buffer.byteLength(bodyStr);

//       const lib      = isHttps ? https : http;
//       const proxyReq = lib.request(options, (proxyRes) => {
//         let data = '';
//         proxyRes.on('data', chunk => { data += chunk; });
//         proxyRes.on('end', () => {
//           res.writeHead(proxyRes.statusCode, {
//             'Content-Type': proxyRes.headers['content-type'] || 'application/json',
//           });
//           res.end(data);
//         });
//       });

//       proxyReq.on('error', (err) => {
//         console.error('[proxy error]', targetUrl, err.message);
//         res.writeHead(502);
//         res.end(JSON.stringify({ error: err.message }));
//       });

//       if (bodyStr) proxyReq.write(bodyStr);
//       proxyReq.end();
//     });
//     return;
//   }

//   res.writeHead(404); res.end('Not found');
// });

// // ── Python Script Generator ───────────────────────────────────────────────────
// function generatePythonScript(caseIds, startDate, endDate, cookie, csrfToken) {
//   const caseIdsStr  = JSON.stringify(caseIds);
//   const outputFile  = `_output_job_${Date.now()}.csv`;

//   return `
// import requests
// from bs4 import BeautifulSoup
// import time
// import datetime
// import csv
// import io
// import pandas as pd
// import json

// url_row_expansion  = "https://aml.paytm.in/star/showCasesRowExpansion"
// url_case_context   = "https://aml.paytm.in/star/showCurrentActivityView"
// url_filter_popup   = "https://aml.paytm.in/star/getAcctTurnoverFilterPopup"
// url_init           = "https://aml.paytm.in/star/getAccountTurnover"
// url_records        = "https://aml.paytm.in/star/getAccountTurnoverRecords"
// url_prep_excel     = "https://aml.paytm.in/star/getAcctTurnoverSummaryInExcel"
// url_download_excel = "https://aml.paytm.in/star/openSelectedExcelReport"

// raw_cookie_string = """${cookie || ''}"""
// csrf_token        = "${csrfToken || ''}"

// base_headers = {
//     'accept': '*/*',
//     'accept-encoding': 'gzip, deflate, br, zstd',
//     'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
//     'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
//     'origin': 'https://aml.paytm.in',
//     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
//     'x-csrf-token': csrf_token,
//     'x-requested-with': 'XMLHttpRequest'
// }

// case_ids       = ${caseIdsStr}
// start_date     = "${startDate || '01-Apr-2026'}"
// end_date       = "${endDate   || '30-Apr-2026'}"
// combined_results = {}

// session = requests.Session()
// session.headers.update(base_headers)

// for part in raw_cookie_string.split(';'):
//     part = part.strip()
//     if '=' in part:
//         k, v = part.split('=', 1)
//         session.cookies.set(k.strip(), v.strip(), domain='aml.paytm.in', path='/')

// def format_time(seconds):
//     return str(datetime.timedelta(seconds=int(seconds)))

// total_cases      = len(case_ids)
// script_start_time = time.time()

// for idx, case_id in enumerate(case_ids, 1):
//     print(f"Processing Case ID: {case_id} ({idx}/{total_cases})", flush=True)
//     current_rules    = "Rule Not Found"
//     current_mid      = "Not Found / Error"
//     current_turnover = 0.0

//     try:
//         session.headers['referer'] = f"https://aml.paytm.in/star/showCurrentActivityView?caseId={case_id}"
//         session.post(url_row_expansion, data={'caseId': case_id})
//         time.sleep(0.01)

//         ctx_resp = session.post(url_case_context, data={'caseId': case_id})

//         if "<html" in ctx_resp.text.lower() and "login" in ctx_resp.text.lower():
//             print("SESSION EXPIRED - Please update tokens", flush=True)
//             combined_results[case_id] = {'Rules': 'Session Expired', 'MID': 'Session Expired', 'Turnover': 0.0}
//             break

//         soup = BeautifulSoup(ctx_resp.text, 'html.parser')
//         rows_html = soup.find_all('tr')
//         rules_for_case = set()

//         for row in rows_html:
//             columns = row.find_all('td')
//             if len(columns) >= 5:
//                 raw_text = columns[4].get_text(separator=" ", strip=True)
//                 if raw_text:
//                     clean_rule = raw_text.split("Event Id")[0].strip()
//                     if clean_rule.endswith("+"):
//                         clean_rule = clean_rule[:-1].strip()
//                     if clean_rule and clean_rule != "Rule / Rule Group / Pattern":
//                         rules_for_case.add(clean_rule)

//         if rules_for_case:
//             current_rules = ", ".join(list(rules_for_case))
//             print(f"  Extracted {len(rules_for_case)} rule(s)", flush=True)

//         time.sleep(0.01)
//         session.post(url_filter_popup, data={'caseId': case_id})
//         time.sleep(0.01)

//         payload_init = {'caseId': case_id, 'startDate': start_date, 'endDate': end_date}
//         session.post(url_init, data=payload_init)
//         time.sleep(0.01)

//         dc_timestamp = int(time.time() * 1000)
//         url_records_busted = f"{url_records}?_dc={dc_timestamp}"
//         payload_records = {
//             'totalCount': '0', 'page': '1', 'start': '0', 'limit': '10',
//             'sort': '[{"property":"","direction":""}]'
//         }
//         rec_resp = session.post(url_records_busted, data=payload_records)
//         time.sleep(0.01)

//         mid_found = False
//         try:
//             json_data = rec_resp.json()
//             if 'acctTurnoverreports' in json_data and len(json_data['acctTurnoverreports']) > 0:
//                 max_turnover = -1.0
//                 best_mid     = None
//                 for report in json_data['acctTurnoverreports']:
//                     account_no    = str(report.get('accountNumber', '')).strip()
//                     credit_amount = float(report.get('totalCashDepAmount', 0.0))
//                     if credit_amount > max_turnover and account_no:
//                         max_turnover = credit_amount
//                         best_mid     = account_no
//                 if best_mid:
//                     current_mid      = best_mid
//                     current_turnover = max_turnover
//                     mid_found        = True
//                     print(f"  MID found (JSON): {current_mid} | Turnover: {current_turnover}", flush=True)
//         except ValueError:
//             pass

//         time.sleep(0.01)

//         if not mid_found:
//             prep_resp = session.post(url_prep_excel)
//             if "fileName" in prep_resp.text:
//                 dl_url    = f"{url_download_excel}?_dc={int(time.time() * 1000)}"
//                 down_resp = session.get(dl_url)
//                 try:
//                     excel_stream = io.BytesIO(down_resp.content)
//                     try:
//                         df = pd.read_excel(excel_stream)
//                     except Exception:
//                         excel_stream.seek(0)
//                         df_list = pd.read_html(excel_stream)
//                         df      = df_list[0]
//                     df.fillna('', inplace=True)
//                     df.columns = [str(col).strip() for col in df.columns]
//                     max_turnover = -1.0
//                     best_mid     = None
//                     for index, row in df.iterrows():
//                         account_no        = str(row.get('Account No', '')).strip()
//                         total_credit_str  = str(row.get('Total Credit', '0')).strip().replace(',','').replace('"','')
//                         total_credit_str  = total_credit_str if total_credit_str else '0'
//                         try:    total_credit = float(total_credit_str)
//                         except: total_credit = 0.0
//                         if total_credit > max_turnover and account_no:
//                             max_turnover = total_credit
//                             best_mid     = account_no
//                     if best_mid:
//                         current_mid      = best_mid
//                         current_turnover = max_turnover
//                         print(f"  MID found (Excel): {current_mid} | Turnover: {current_turnover}", flush=True)
//                     else:
//                         current_mid = 'No MID found'
//                 except Exception as e:
//                     current_mid = f'Excel Parse Error: {e}'
//             else:
//                 current_mid = 'No Data/Error'

//     except Exception as e:
//         current_mid = f'Error: {e}'
//         print(f"  ERROR for {case_id}: {e}", flush=True)

//     combined_results[case_id] = {
//         'Rules':    current_rules,
//         'MID':      current_mid,
//         'Turnover': current_turnover
//     }

//     elapsed     = time.time() - script_start_time
//     avg_time    = elapsed / idx
//     eta_seconds = avg_time * (total_cases - idx)
//     pct         = (idx / total_cases) * 100
//     print(f"PROGRESS:{idx}:{total_cases}:{pct:.1f}:{format_time(int(eta_seconds))}", flush=True)

// # Write output CSV
// import os
// output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_output_${Date.now()}.csv")
// with open(output_path, mode='w', newline='', encoding='utf-8') as csv_file:
//     writer = csv.writer(csv_file)
//     writer.writerow(['Case ID', 'Rules/Alerts', 'Top MID', 'Turnover (INR)'])
//     for cid, data in combined_results.items():
//         writer.writerow([cid, data['Rules'], data['MID'], data['Turnover']])

// print(f"DONE:{output_path}", flush=True)
// `;
// }

// server.listen(PORT, () => {
//   console.log('\n✅  AML Dashboard Server is ready!');
//   console.log('────────────────────────────────────────────────────');
//   console.log('   → http://localhost:' + PORT);
//   console.log('\n   Active endpoints:');
//   console.log('   → POST /api/send-otp');
//   console.log('   → POST /api/verify-otp');
//   console.log('   → POST /api/python/start');
//   console.log('   → GET  /api/python/status/:jobId');
//   console.log('   → POST /proxy');
//   console.log('\n   Keep this terminal open.');
//   console.log('   Press Ctrl+C to stop.\n');
// });







// const http = require('http');
// const https = require('https');
// const fs = require('fs');
// const path = require('path');
// const url = require('url');
// const nodemailer = require('nodemailer');
// const cheerio = require('cheerio'); // Added for HTML parsing
// const axios = require('axios');    // Added for easier multi-step requests

// const PORT = 3001;

// // ── Email Config ──────────────────────────────────────────────────────────────
// const EMAIL_USER = 'bhanu.khandelwal@paytmpayments.com';
// const EMAIL_PASS = 'hgpconyalyqafdkm';

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: EMAIL_USER, pass: EMAIL_PASS },
// });

// const otpStore = new Map();

// // ─────────────────────────────────────────────────────────────────────────────

// const server = http.createServer((req, res) => {
//   // CORS Headers
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');

//   if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

//   // ── Serve HTML ───────────────────────────────────────────────
//   if (req.method === 'GET' && ['/', '/index.html', '/extractor.html'].includes(req.url)) {
//     const filePath = path.join(__dirname, 'extractor.html');
//     fs.readFile(filePath, (err, data) => {
//       if (err) {
//         res.writeHead(404);
//         res.end('File not found.');
//         return;
//       }
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     });
//     return;
//   }

//   // ── OTP: Send ────────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/send-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', async () => {
//       let payload = JSON.parse(body || '{}');
//       const { email } = payload;
//       if (!email) { res.writeHead(400); res.end(JSON.stringify({ error: 'Email required' })); return; }

//       const otp = Math.floor(100000 + Math.random() * 900000).toString();
//       const expires = Date.now() + 5 * 60 * 1000;
//       otpStore.set(email.toLowerCase(), { otp, expires });

//       try {
//         await transporter.sendMail({
//           from: `"AML Dashboard" <${EMAIL_USER}>`,
//           to: email,
//           subject: 'Your OTP — AML Dashboard Login',
//           html: `<div style="font-family:sans-serif;padding:20px;background:#f4f4f4;">
//                   <h2>OTP: ${otp}</h2>
//                   <p>Expires in 5 minutes.</p>
//                 </div>`,
//         });
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ success: true }));
//       } catch (err) {
//         res.writeHead(500); res.end(JSON.stringify({ error: 'Mail error' }));
//       }
//     });
//     return;
//   }

//   // ── OTP: Verify ──────────────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/verify-otp') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload = JSON.parse(body || '{}');
//       const { email, otp } = payload;
//       const stored = otpStore.get(email?.toLowerCase());
//       if (stored && stored.otp === otp?.trim() && Date.now() < stored.expires) {
//         otpStore.delete(email.toLowerCase());
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ success: true }));
//       } else {
//         res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid or expired OTP' }));
//       }
//     });
//     return;
//   }

//   // ── NEW: AML Case Scraper Logic ──────────────────────────────
//   if (req.method === 'POST' && req.url === '/api/scrape-cases') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', async () => {
//       let payload = JSON.parse(body || '{}');
//       const { caseIds, startDate, endDate, cookies, csrfToken } = payload;
//       const results = [];

//       const baseHeaders = {
//         'cookie': cookies,
//         'x-csrf-token': csrfToken,
//         'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
//         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//       };

//       for (let id of caseIds) {
//         try {
//           console.log(`[Scraper] Processing Case: ${id}`);
          
//           // 1. Row Expansion
//           await axios.post('https://aml.paytm.in/star/showCasesRowExpansion', `caseId=${id}`, { headers: baseHeaders });

//           // 2. Get Rules (HTML parsing)
//           const ctxResp = await axios.post('https://aml.paytm.in/star/showCurrentActivityView', `caseId=${id}`, { 
//             headers: { ...baseHeaders, 'referer': `https://aml.paytm.in/star/showCurrentActivityView?caseId=${id}` } 
//           });
          
//           const $ = cheerio.load(ctxResp.data);
//           let rules = [];
//           $('tr').each((i, el) => {
//             const cols = $(el).find('td');
//             if (cols.length >= 5) {
//                 let txt = $(cols[4]).text().split("Event Id")[0].trim();
//                 if (txt && txt !== "Rule / Rule Group / Pattern") rules.push(txt);
//             }
//           });

//           // 3. Initialize Turnover Dates
//           await axios.post('https://aml.paytm.in/star/getAccountTurnover', `caseId=${id}&startDate=${startDate}&endDate=${endDate}`, { headers: baseHeaders });

//           // 4. Fetch Turnover Records (JSON)
//           const recResp = await axios.post('https://aml.paytm.in/star/getAccountTurnoverRecords', 
//             `totalCount=0&page=1&start=0&limit=10`, { headers: baseHeaders });

//           const topMid = recResp.data.acctTurnoverreports?.[0]?.accountNumber || "Not Found";
//           const turnover = recResp.data.acctTurnoverreports?.[0]?.totalCashDepAmount || 0;

//           results.push({ id, rules: [...new Set(rules)].join(", ") || "No Rules Found", topMid, turnover, status: 'Success' });
//         } catch (err) {
//           console.error(`[Scraper Error] Case ${id}:`, err.message);
//           results.push({ id, rules: 'N/A', topMid: 'N/A', turnover: 0, status: 'Failed' });
//         }
//       }
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(results));
//     });
//     return;
//   }

//   // ── Existing CORS Proxy ──────────────────────────────────────
//   if (req.method === 'POST' && req.url === '/proxy') {
//     let body = '';
//     req.on('data', chunk => { body += chunk; });
//     req.on('end', () => {
//       let payload = JSON.parse(body || '{}');
//       const { method = 'GET', url: targetUrl, headers: extraHeaders = {}, body: reqBody } = payload;
//       if (!targetUrl) { res.writeHead(400); res.end(); return; }

//       const parsed = url.parse(targetUrl);
//       const isHttps = parsed.protocol === 'https:';
//       const options = {
//         hostname: parsed.hostname,
//         port: parsed.port || (isHttps ? 443 : 80),
//         path: parsed.path,
//         method: method,
//         headers: { 'content-type': 'application/json', ...extraHeaders },
//       };

//       const lib = isHttps ? https : http;
//       const proxyReq = lib.request(options, (proxyRes) => {
//         let data = '';
//         proxyRes.on('data', chunk => { data += chunk; });
//         proxyRes.on('end', () => {
//           res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
//           res.end(data);
//         });
//       });
//       if (reqBody) proxyReq.write(JSON.stringify(reqBody));
//       proxyReq.end();
//     });
//     return;
//   }

//   res.writeHead(404); res.end('Not found');
// });


// server.listen(PORT, () => {
//   console.log(`\n✅ Server Running on http://localhost:${PORT}`);
//   console.log(`🚀 Scraper Endpoint: http://localhost:${PORT}/api/scrape-cases\n`);
// });  



const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const nodemailer = require('nodemailer');
const cheerio = require('cheerio'); 
const axios = require('axios');    

const PORT = 3001;

// ── Email Config ──────────────────────────────────────────────────────────────
const EMAIL_USER = 'bhanu.khandelwal@paytmpayments.com';
const EMAIL_PASS = 'hgpconyalyqafdkm';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

const otpStore = new Map();
const jobs = new Map(); // Store job status and results

// ─────────────────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-csrf-token');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── OTP Endpoints ───────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/send-otp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let payload = JSON.parse(body || '{}');
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(payload.email?.toLowerCase(), { otp, expires: Date.now() + 300000 });
      try {
        await transporter.sendMail({
          from: EMAIL_USER, to: payload.email,
          subject: 'OTP Verification', html: `<h2>${otp}</h2>`
        });
        res.end(JSON.stringify({ success: true }));
      } catch (e) { res.end(JSON.stringify({ error: 'Mail failed' })); }
    });
    return;
  }

  // ── AUTH/VERIFY OTP ────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/verify-otp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let { email, otp } = JSON.parse(body || '{}');
      const stored = otpStore.get(email?.toLowerCase());
      if (stored && stored.otp === otp) {
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid OTP' }));
      }
    });
    return;
  }

  // ── START SCRAPER (This matches your React Frontend) ────────
  if (req.method === 'POST' && req.url === '/api/python/start') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      const { caseIds, startDate, endDate, cookie, csrfToken } = JSON.parse(body || '{}');
      const jobId = Date.now().toString();
      
      // Initialize Job
      jobs.set(jobId, { status: 'running', logs: ['Starting extraction...'], result: null });

      // Run background task
      (async () => {
        const results = [];
        const baseHeaders = {
          'cookie': cookie,
          'x-csrf-token': csrfToken,
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'user-agent': 'Mozilla/5.0'
        };

        for (let i = 0; i < caseIds.length; i++) {
          const id = caseIds[i];
          const job = jobs.get(jobId);
          const pct = ((i / caseIds.length) * 100).toFixed(1);
          job.logs.push(`PROGRESS:${i}:${caseIds.length}:${pct}:Calculating...`);
          job.logs.push(`Processing Case: ${id}`);

          try {
            await axios.post('https://aml.paytm.in/star/showCasesRowExpansion', `caseId=${id}`, { headers: baseHeaders });
            const ctx = await axios.post('https://aml.paytm.in/star/showCurrentActivityView', `caseId=${id}`, { headers: baseHeaders });
            const $ = cheerio.load(ctx.data);
            let rules = [];
            $('tr').each((_, el) => {
                const txt = $(el).find('td').eq(4).text().split("Event Id")[0].trim();
                if (txt && txt !== "Rule / Rule Group / Pattern") rules.push(txt);
            });

            await axios.post('https://aml.paytm.in/star/getAccountTurnover', `caseId=${id}&startDate=${startDate}&endDate=${endDate}`, { headers: baseHeaders });
            const recs = await axios.post('https://aml.paytm.in/star/getAccountTurnoverRecords', `totalCount=0&page=1&start=0&limit=10`, { headers: baseHeaders });

            results.push({
              'Case ID': id,
              'Rules/Alerts': [...new Set(rules)].join(" | "),
              'Top MID': recs.data.acctTurnoverreports?.[0]?.accountNumber || 'Not Found',
              'Turnover (INR)': recs.data.acctTurnoverreports?.[0]?.totalCashDepAmount || 0
            });
          } catch (e) {
            job.logs.push(`⚠ Error processing ${id}`);
          }
        }

        // Generate CSV string for frontend
        const csvHeader = "Case ID,Rules/Alerts,Top MID,Turnover (INR)\n";
        const csvRows = results.map(r => `${r['Case ID']},"${r['Rules/Alerts']}",${r['Top MID']},${r['Turnover (INR)']}`).join("\n");
        const finalJob = jobs.get(jobId);
        finalJob.status = 'done';
        finalJob.result = csvHeader + csvRows;
      })();

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, jobId }));
    });
    return;
  }

  // ── STATUS POLLING (This matches your React Frontend) ───────
  if (req.method === 'GET' && req.url.startsWith('/api/python/status/')) {
    const id = req.url.split('/').pop();
    const job = jobs.get(id);
    if (!job) {
      res.writeHead(404); res.end(JSON.stringify({ error: 'Job not found' }));
    } else {
      res.end(JSON.stringify(job));
    }
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`✅ Server Running on http://localhost:${PORT}`);
});