/**
 * PDF出力回数制限管理
 *
 * Tier 2（登録ユーザー）は1日3回まで
 * Tier 3（プレミアムユーザー）は無制限
 */

const STORAGE_KEY = 'pdf-quota';

/**
 * PDF出力履歴
 */
interface PDFQuotaData {
  date: string; // YYYY-MM-DD
  count: number;
}

/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
};

/**
 * 今日のPDF出力回数を取得
 *
 * @returns 今日の出力回数
 */
export const getTodayPDFCount = (): number => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) {
      return 0;
    }

    const data: PDFQuotaData = JSON.parse(json);
    const today = getTodayString();

    // 日付が異なる場合はリセット
    if (data.date !== today) {
      return 0;
    }

    return data.count;
  } catch (error) {
    console.error('Failed to get PDF quota:', error);
    return 0;
  }
};

/**
 * PDF出力回数をインクリメント
 *
 * @returns 更新後の出力回数
 */
export const incrementPDFCount = (): number => {
  try {
    const today = getTodayString();
    const currentCount = getTodayPDFCount();

    const newData: PDFQuotaData = {
      date: today,
      count: currentCount + 1,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return newData.count;
  } catch (error) {
    console.error('Failed to increment PDF quota:', error);
    return 0;
  }
};

/**
 * PDF出力可能かチェック
 *
 * @param userTier ユーザーのTier
 * @returns 出力可能な場合はtrue
 */
export const canExportPDF = (userTier: 'anonymous' | 'authenticated' | 'premium'): boolean => {
  // 匿名ユーザーはPDF出力不可
  if (userTier === 'anonymous') {
    return false;
  }

  // プレミアムユーザーは無制限
  if (userTier === 'premium') {
    return true;
  }

  // 登録ユーザー（Tier 2）は1日3回まで
  const count = getTodayPDFCount();
  return count < 3;
};

/**
 * 残りPDF出力回数を取得
 *
 * @param userTier ユーザーのTier
 * @returns 残り回数（プレミアムは-1 = 無制限）
 */
export const getRemainingPDFCount = (userTier: 'anonymous' | 'authenticated' | 'premium'): number => {
  // 匿名ユーザーは0回
  if (userTier === 'anonymous') {
    return 0;
  }

  // プレミアムユーザーは無制限（-1で表現）
  if (userTier === 'premium') {
    return -1;
  }

  // 登録ユーザー（Tier 2）
  const count = getTodayPDFCount();
  return Math.max(0, 3 - count);
};

/**
 * PDF出力回数をリセット（デバッグ用）
 */
export const resetPDFCount = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset PDF quota:', error);
  }
};
