/**
 * dist/sw.js のキャッシュ名プレースホルダーをビルドハッシュ（=Date.now()）で置換する。
 * これによりデプロイのたびに Service Worker のキャッシュが切り替わり、
 * 古いアセットが使い続けられることを防ぐ。
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const swPath = path.join(root, 'dist/sw.js');
const indexPath = path.join(root, 'dist/index.html');
const vercelPath = path.join(root, 'vercel.json');

// 1) Service Worker のキャッシュ名にビルド時刻をスタンプ
try {
  await access(swPath);
  const version = `${Date.now()}`;
  const original = await readFile(swPath, 'utf8');
  const replaced = original.replace(/__CACHE_VERSION__/g, version);
  if (original !== replaced) {
    await writeFile(swPath, replaced);
    console.log(`[postbuild] sw.js cache version stamped: loan-calc-${version}`);
  } else {
    console.warn('[postbuild] no __CACHE_VERSION__ placeholder found in sw.js');
  }
} catch {
  console.warn(`[postbuild] sw.js not found at ${swPath}, skipping cache stamp.`);
}

// 2) JSON-LD ブロックの SHA-256 を計算し、vercel.json の CSP と一致しているか検査
try {
  const html = await readFile(indexPath, 'utf8');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (match) {
    const hash = crypto.createHash('sha256').update(match[1]).digest('base64');
    const expected = `sha256-${hash}`;
    const vercelText = await readFile(vercelPath, 'utf8');
    if (!vercelText.includes(expected)) {
      console.error(
        `\n[postbuild] CSP hash mismatch! JSON-LD content has changed.\n` +
          `  Expected to find in vercel.json: '${expected}'\n` +
          `  Update the script-src directive in vercel.json before deploying.\n`
      );
      process.exit(1);
    }
    console.log(`[postbuild] CSP JSON-LD hash verified: ${expected}`);
  }
} catch (err) {
  console.warn(`[postbuild] CSP hash check skipped: ${err.message}`);
}
