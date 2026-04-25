/**
 * dist/sw.js のキャッシュ名プレースホルダーをビルドハッシュ（=Date.now()）で置換する。
 * これによりデプロイのたびに Service Worker のキャッシュが切り替わり、
 * 古いアセットが使い続けられることを防ぐ。
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swPath = path.resolve(__dirname, '../dist/sw.js');

try {
  await access(swPath);
} catch {
  console.warn(`[postbuild] sw.js not found at ${swPath}, skipping.`);
  process.exit(0);
}

const version = `${Date.now()}`;
const original = await readFile(swPath, 'utf8');
const replaced = original.replace(/__CACHE_VERSION__/g, version);

if (original === replaced) {
  console.warn('[postbuild] no __CACHE_VERSION__ placeholder found in sw.js');
  process.exit(0);
}

await writeFile(swPath, replaced);
console.log(`[postbuild] sw.js cache version stamped: loan-calc-${version}`);
