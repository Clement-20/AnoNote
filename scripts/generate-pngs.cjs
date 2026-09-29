const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 calculation table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function makePng(width, height, isMaskable = false) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw pixel rows with filter byte 0 (None)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = (width / 2) * (isMaskable ? 0.72 : 0.88);
  const rBubble = (width / 2) * (isMaskable ? 0.55 : 0.65);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0b141a
      let r = 11, g = 20, b = 26, a = 255;

      // Outer squircle / border
      if (dist < rOuter && dist >= rBubble) {
        // Gradient between dark cyan and vibrant AnoNote blue
        const t = (x + y) / (width + height);
        r = Math.round(11 + (2 - 11) * t);
        g = Math.round(20 + (132 - 20) * t);
        b = Math.round(26 + (199 - 26) * t);
        a = 255;
      }

      // Chat bubble body: AnoNote blue gradient #0284c7 -> #38bdf8
      if (dist < rBubble) {
        const factor = (y / height);
        r = Math.round(56 - factor * 54);   // 56 -> 2
        g = Math.round(189 - factor * 57);  // 189 -> 132
        b = Math.round(248 - factor * 49);  // 248 -> 199
        a = 255;

        // Inner shield dark motif
        if (Math.abs(dx) < rBubble * 0.45 && dy > -rBubble * 0.4 && dy < rBubble * 0.45) {
          // Inner shield cutout
          r = 11;
          g = 20;
          b = 26;
          // Lock shackle and core
          if (Math.abs(dx) < rBubble * 0.18 && Math.abs(dy - rBubble * 0.05) < rBubble * 0.22) {
            r = 56;
            g = 189;
            b = 248;
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve(__dirname, '../public');

console.log('Generating PWA icons...');
const png192 = makePng(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = makePng(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const pngMaskable512 = makePng(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);

const appleTouchIcon = makePng(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

const favicon = makePng(64, 64, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);

console.log('Successfully generated all PWA icons in /public!');
