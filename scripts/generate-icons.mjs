/**
 * PNG アイコンと OG 画像を public/icon.svg から生成する。
 * 使い方: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

const sources = {
  icon: path.join(publicDir, 'icon.svg'),
};

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
];

const ogTemplate = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1E40AF"/>
      <stop offset="1" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(140 165)">
    <rect width="160" height="160" rx="32" fill="#FFFFFF" opacity="0.12"/>
    <path d="M80 30 L20 80 V140 H56 V104 H104 V140 H140 V80 Z"
          fill="#FFFFFF" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round"
          transform="translate(0 0)"/>
    <text x="80" y="158" font-family="'Noto Sans JP','Hiragino Sans',sans-serif"
          font-size="22" font-weight="800" text-anchor="middle" fill="#FBBF24">¥</text>
  </g>
  <text x="340" y="225" font-family="'Noto Sans JP','Hiragino Sans',sans-serif"
        font-size="64" font-weight="800" fill="#FFFFFF">住宅ローン電卓</text>
  <text x="340" y="295" font-family="'Noto Sans JP','Hiragino Sans',sans-serif"
        font-size="36" font-weight="600" fill="#E5E7EB">商談中の暗算をゼロに</text>
  <text x="340" y="380" font-family="'Noto Sans JP','Hiragino Sans',sans-serif"
        font-size="26" font-weight="500" fill="#FBBF24">無料・登録不要 / 元利均等・元金均等・逆算・繰上返済・NISA</text>
  <text x="340" y="430" font-family="'Noto Sans JP','Hiragino Sans',sans-serif"
        font-size="22" font-weight="400" fill="#94A3B8">ホーム画面に追加すれば前回入力を自動復元</text>
</svg>
`;

const svg = await readFile(sources.icon);

for (const target of targets) {
  const out = path.join(publicDir, target.name);
  await sharp(svg, { density: 384 })
    .resize(target.size, target.size, { fit: 'contain', background: { r: 30, g: 64, b: 175 } })
    .png()
    .toFile(out);
  console.log(`generated ${target.name} (${target.size}x${target.size})`);
}

const favOut = path.join(publicDir, 'favicon.ico');
await sharp(svg, { density: 256 })
  .resize(64, 64)
  .toFormat('png')
  .toFile(favOut);
console.log(`generated favicon.ico (64x64 PNG renamed)`);

const ogPath = path.join(publicDir, 'og-image.png');
await sharp(Buffer.from(ogTemplate)).png().toFile(ogPath);
console.log(`generated og-image.png (1200x630)`);

const maskableTemplate = await readFile(sources.icon, 'utf-8');
const maskable = maskableTemplate
  .replace('viewBox="0 0 512 512"', 'viewBox="-64 -64 640 640"')
  .replace('rx="96"', 'rx="0"');
await writeFile(path.join(publicDir, 'icon-maskable.svg'), maskable);
console.log('generated icon-maskable.svg');
