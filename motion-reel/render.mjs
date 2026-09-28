// Renders index.html frame-by-frame at 60 fps and encodes an H.264 MP4.
// Usage: node render.mjs [out.mp4] [--frames 0,120,240]  (frames flag writes PNG stills instead)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stillsIdx = args.indexOf('--frames');
const out = args[0] && !args[0].startsWith('--') ? args[0] : path.join(here, 'motion-reel.mp4');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
// Fetch Google Fonts with curl (respects system proxy settings) and hand them to the page.
await page.route(/fonts\.(googleapis|gstatic)\.com/, route => {
  const body = execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/140 Safari/537.36', route.request().url()]);
  const type = route.request().url().includes('googleapis') ? 'text/css' : 'font/woff2';
  route.fulfill({ body, contentType: type, headers: { 'access-control-allow-origin': '*' } });
});
await page.goto('file://' + path.join(here, 'index.html') + '#capture');
const fontsOk = await page.evaluate(async () => (await document.fonts.load('400 100px Anton')).length > 0 && (await document.fonts.load("500 20px 'DM Mono'")).length > 0);
if (!fontsOk) throw new Error('Fonts failed to load');
console.log('Anton loaded:', fontsOk);

async function grab(i) {
  await page.evaluate(i => window.renderFrame(i), i);
  const url = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  return Buffer.from(url.split(',')[1], 'base64');
}

if (stillsIdx >= 0) {
  for (const f of args[stillsIdx + 1].split(',').map(Number)) writeFileSync(path.join(process.env.STILLS || here, `frame_${String(f).padStart(3, '0')}.png`), await grab(f));
} else {
  const ff = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', '60', '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-r', '60', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < 900; i++) {
    const buf = await grab(i);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) console.log('frame', i);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();
