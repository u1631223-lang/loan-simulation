/**
 * InstallHint - ホーム画面追加のヒント
 *
 * 「毎回1から始まる」と感じているユーザー向けに、
 * iOS Safari ではホーム画面に追加すれば PWA として独立永続化されることを案内する。
 * 一度閉じたら 30 日間は再表示しない。
 */

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'loan-calc-install-hint-dismissed-at';
const SUPPRESS_MS = 30 * 24 * 60 * 60 * 1000; // 30日

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};

const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
};

export const InstallHint: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (!isIOS()) return;

    try {
      const dismissedAt = Number(localStorage.getItem(STORAGE_KEY) || '0');
      if (dismissedAt && Date.now() - dismissedAt < SUPPRESS_MS) return;
    } catch {
      // localStorage 不可のときは黙って表示
    }

    setVisible(true);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(96vw,520px)]">
      <div className="bg-primary text-white shadow-2xl rounded-xl p-4 flex items-start gap-3">
        <span aria-hidden className="text-2xl leading-none">📲</span>
        <div className="flex-1 text-sm leading-relaxed">
          <p className="font-semibold mb-1">ホーム画面に追加すると毎回1から入力せずに済みます</p>
          <p className="text-white/80">
            Safari の <span className="inline-block px-1 rounded bg-white/15">共有ボタン</span> →
            「ホーム画面に追加」でアプリのように起動でき、最後に入力した値も復元されます。
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="text-white/80 hover:text-white text-lg leading-none px-2 -mt-0.5"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default InstallHint;
