// Generates the app icon, splash image and success chime without any external tools.
// Run: node scripts/make-assets.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const out = path.join(__dirname, '..', 'assets');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const S = 3; // supersampling
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const p = pixel((x + (sx + 0.5) / S) / size, (y + (sy + 0.5) / S) / size);
        r += p[0] * p[3]; g += p[1] * p[3]; b += p[2] * p[3]; a += p[3];
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = a ? r / a : 0; raw[o + 1] = a ? g / a : 0; raw[o + 2] = a ? b / a : 0; raw[o + 3] = (a / (S * S)) * 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const BLUE = [26, 115, 232, 1], WHITE = [255, 255, 255, 1], NONE = [0, 0, 0, 0];
const COLORS = [[66, 133, 244, 1], [52, 168, 83, 1], [251, 188, 4, 1], [234, 67, 53, 1]];

// Two forward chevrons ("send money") centred in the unit square, scaled by s.
function segDist(px, py, ax, ay, bx, by) {
  const t = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
}
function isP(x, y, s = 1) {
  x = (x - 0.5) / s + 0.5; y = (y - 0.5) / s + 0.5;
  const w = 0.06;
  const chev = (ox) => segDist(x, y, 0.26 + ox, 0.28, 0.46 + ox, 0.48) <= w || segDist(x, y, 0.46 + ox, 0.48, 0.26 + ox, 0.68) <= w;
  return chev(0) || chev(0.22);
}
// Four coloured dots under the P.
function dot(x, y, s = 1) {
  x = (x - 0.5) / s + 0.5; y = (y - 0.5) / s + 0.5;
  for (let i = 0; i < 4; i++) if (Math.hypot(x - (0.56 + i * 0.07), y - 0.8) < 0.026) return COLORS[i];
  return null;
}

const icon = (x, y) => {
  const d = dot(x, y);
  if (d) return d;
  return isP(x, y) ? WHITE : BLUE;
};
const foreground = (x, y) => {
  const d = dot(x, y, 0.62);
  if (d) return d;
  return isP(x, y, 0.62) ? WHITE : NONE;
};
// Same rounded square as the in-app logo, so the native splash and the JS splash match.
const splash = (x, y) => {
  const r = 0.24;
  const dx = Math.max(Math.abs(x - 0.5) - (0.5 - r), 0);
  const dy = Math.max(Math.abs(y - 0.5) - (0.5 - r), 0);
  if (Math.hypot(dx, dy) > r) return NONE;
  return icon(x, y);
};

fs.writeFileSync(path.join(out, 'icon.png'), png(1024, icon));
fs.writeFileSync(path.join(out, 'android-icon-foreground.png'), png(1024, foreground));
fs.writeFileSync(path.join(out, 'android-icon-background.png'), png(256, () => BLUE));
fs.writeFileSync(path.join(out, 'android-icon-monochrome.png'), png(1024, (x, y) => (isP(x, y, 0.62) ? WHITE : NONE)));
fs.writeFileSync(path.join(out, 'splash-icon.png'), png(512, splash));
fs.writeFileSync(path.join(out, 'favicon.png'), png(64, icon));

// Two-note "ting" chime, 16-bit mono WAV.
const rate = 44100, dur = 0.9;
const n = Math.floor(rate * dur);
const pcm = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) {
  const t = i / rate;
  const note = (f, start) => (t < start ? 0 : Math.sin(2 * Math.PI * f * (t - start)) * Math.exp(-(t - start) * 5) + 0.3 * Math.sin(4 * Math.PI * f * (t - start)) * Math.exp(-(t - start) * 8));
  const v = 0.35 * (note(1318.5, 0) + note(1760, 0.12));
  pcm.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32767, i * 2);
}
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(1, 22); hdr.writeUInt32LE(rate, 24);
hdr.writeUInt32LE(rate * 2, 28); hdr.writeUInt16LE(2, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.mkdirSync(path.join(out, 'sounds'), { recursive: true });
fs.writeFileSync(path.join(out, 'sounds', 'success.wav'), Buffer.concat([hdr, pcm]));
console.log('Assets written to', out);
