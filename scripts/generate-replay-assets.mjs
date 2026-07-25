import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const width = 160;
const height = 120;
const maxima = [34.2, 41.7, 49.8, 57.6, 62.4, 58.1];
const centers = [
  [42, 64],
  [54, 62],
  [68, 60],
  [82, 58],
  [96, 57],
  [108, 56],
];

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, '../public/replay');
mkdirSync(outputDirectory, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = buffer => {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
};

const palette = value => {
  const stops = [
    [0.00, [5, 4, 20]],
    [0.18, [42, 18, 92]],
    [0.38, [55, 48, 157]],
    [0.55, [166, 43, 119]],
    [0.72, [235, 72, 63]],
    [0.88, [255, 170, 51]],
    [1.00, [255, 249, 190]],
  ];

  const clamped = Math.max(0, Math.min(1, value));
  const upperIndex = stops.findIndex(([position]) => position >= clamped);
  if (upperIndex <= 0) return stops[0][1];
  const [lowerPosition, lowerColor] = stops[upperIndex - 1];
  const [upperPosition, upperColor] = stops[upperIndex];
  const amount = (clamped - lowerPosition) / (upperPosition - lowerPosition);
  return lowerColor.map((channel, index) =>
    Math.round(channel + (upperColor[index] - channel) * amount));
};

const pngForFrame = frameIndex => {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const [centerX, centerY] = centers[frameIndex];
  const peak = maxima[frameIndex];
  const radiusX = 17 + frameIndex * 2;
  const radiusY = 14 + frameIndex;

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const ellipse = ((x - centerX) ** 2) / (radiusX ** 2)
        + ((y - centerY) ** 2) / (radiusY ** 2);
      const hotspot = Math.exp(-ellipse * 2.15);
      const surface = 22 + 1.4 * Math.sin(x / 17) + 0.7 * Math.cos(y / 13);
      const temperature = surface + (peak - surface) * hotspot;
      const [red, green, blue] = palette((temperature - 18) / 46);
      const pixel = row + 1 + x * 4;
      raw[pixel] = red;
      raw[pixel + 1] = green;
      raw[pixel + 2] = blue;
      raw[pixel + 3] = 255;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

for (let index = 0; index < maxima.length; index += 1) {
  const name = `ember-frame-${String(index + 1).padStart(2, '0')}.png`;
  writeFileSync(resolve(outputDirectory, name), pngForFrame(index));
}

console.log(`Generated ${maxima.length} simulated ${width}×${height} replay frames.`);
