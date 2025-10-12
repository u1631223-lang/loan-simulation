/**
 * useKeyboard - キーボードショートカット用カスタムフック
 */

import { useEffect, useCallback } from 'react';

/**
 * キーボードイベントハンドラの型
 */
export interface KeyboardHandlers {
  onNumberKey?: (num: string) => void;
  onEnterKey?: () => void;
  onEscapeKey?: () => void;
  onBackspaceKey?: () => void;
  onDecimalKey?: () => void;
}

/**
 * キーボードショートカットフック
 *
 * @param handlers キーボードイベントハンドラ
 * @param enabled フックを有効化するかどうか（デフォルト: true）
 */
export const useKeyboard = (handlers: KeyboardHandlers, enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 入力フィールドにフォーカスがある場合はスキップ
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // 数字キー（0-9）
      if (/^[0-9]$/.test(event.key) && handlers.onNumberKey) {
        event.preventDefault();
        handlers.onNumberKey(event.key);
        return;
      }

      // テンキー（Numpad）
      if (/^Numpad[0-9]$/.test(event.code) && handlers.onNumberKey) {
        event.preventDefault();
        const num = event.code.replace('Numpad', '');
        handlers.onNumberKey(num);
        return;
      }

      // 小数点キー
      if ((event.key === '.' || event.key === 'Decimal') && handlers.onDecimalKey) {
        event.preventDefault();
        handlers.onDecimalKey();
        return;
      }

      // Enterキー（計算実行）
      if (event.key === 'Enter' && handlers.onEnterKey) {
        event.preventDefault();
        handlers.onEnterKey();
        return;
      }

      // Escapeキー（クリア）
      if (event.key === 'Escape' && handlers.onEscapeKey) {
        event.preventDefault();
        handlers.onEscapeKey();
        return;
      }

      // Backspaceキー（削除）
      if (event.key === 'Backspace' && handlers.onBackspaceKey) {
        event.preventDefault();
        handlers.onBackspaceKey();
        return;
      }
    },
    [handlers]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};
