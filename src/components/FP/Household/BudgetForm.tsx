/**
 * BudgetForm - 家計収支入力フォーム
 *
 * 収入/支出項目の作成・編集フォーム
 */

import React, { useState, useEffect } from 'react';
import type { IncomeCategory, CreateIncomeItemParams, IncomeItem } from '@/hooks/useIncomeItems';
import type { ExpenseCategory, CreateExpenseItemParams, ExpenseItem } from '@/hooks/useExpenseItems';
import type { Frequency } from '@/hooks/useIncomeItems';

// フォームタイプ
type FormType = 'income' | 'expense';

// 収入カテゴリのメタデータ
export const INCOME_CATEGORIES: Record<IncomeCategory, { label: string; icon: string }> = {
  salary: { label: '給与', icon: '💼' },
  bonus: { label: 'ボーナス', icon: '🎁' },
  side_income: { label: '副業収入', icon: '💻' },
  pension: { label: '年金', icon: '🏦' },
  investment: { label: '投資収入', icon: '📈' },
  other: { label: 'その他', icon: '📌' },
};

// 支出カテゴリのメタデータ
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string }> = {
  food: { label: '食費', icon: '🍽️' },
  housing: { label: '住居費', icon: '🏠' },
  utilities: { label: '光熱費', icon: '⚡' },
  transportation: { label: '交通費', icon: '🚗' },
  communication: { label: '通信費', icon: '📱' },
  insurance: { label: '保険料', icon: '🛡️' },
  education: { label: '教育費', icon: '🎓' },
  entertainment: { label: '娯楽費', icon: '🎮' },
  medical: { label: '医療費', icon: '🏥' },
  other: { label: 'その他', icon: '📌' },
};

// 頻度のメタデータ
export const FREQUENCY_OPTIONS: Record<Frequency, string> = {
  monthly: '月次',
  annual: '年次',
  one_time: '単発',
};

interface BudgetFormProps {
  budgetId: string;
  type: FormType;
  editItem?: IncomeItem | ExpenseItem;
  onSubmit: (params: CreateIncomeItemParams | CreateExpenseItemParams) => Promise<void>;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  budgetId,
  type,
  editItem,
  onSubmit,
  onCancel,
}) => {
  // フォーム状態
  const [category, setCategory] = useState<IncomeCategory | ExpenseCategory>(
    editItem?.category || (type === 'income' ? 'salary' : 'food')
  );
  const [itemName, setItemName] = useState(editItem?.itemName || '');
  const [amount, setAmount] = useState(editItem?.amount.toString() || '');
  const [frequency, setFrequency] = useState<Frequency>(editItem?.frequency || 'monthly');
  const [isFixed, setIsFixed] = useState<boolean>(() => {
    if (type !== 'expense') {
      return true;
    }

    if (editItem && 'isFixed' in editItem) {
      return editItem.isFixed;
    }

    return true;
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モード検出
  const isEditMode = !!editItem;

  // カテゴリ変更時にデフォルト名を設定
  useEffect(() => {
    if (!isEditMode && !itemName) {
      if (type === 'income') {
        setItemName(INCOME_CATEGORIES[category as IncomeCategory].label);
      } else {
        setItemName(EXPENSE_CATEGORIES[category as ExpenseCategory].label);
      }
    }
  }, [category, type, isEditMode, itemName]);

  // バリデーション
  const validate = (): boolean => {
    if (!itemName.trim()) {
      setError('項目名を入力してください');
      return false;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('有効な金額を入力してください');
      return false;
    }
    return true;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);

      if (type === 'income') {
        const params: CreateIncomeItemParams = {
          budgetId,
          category: category as IncomeCategory,
          itemName: itemName.trim(),
          amount: parseFloat(amount),
          frequency,
        };
        await onSubmit(params);
      } else {
        const params: CreateExpenseItemParams = {
          budgetId,
          category: category as ExpenseCategory,
          itemName: itemName.trim(),
          amount: parseFloat(amount),
          frequency,
          isFixed,
        };
        await onSubmit(params);
      }

      // フォームリセット
      setItemName('');
      setAmount('');
      setNotes('');
      setError(null);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : '送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // カテゴリリスト取得
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // 月次換算金額の計算
  const calculateMonthlyAmount = (): number => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return 0;

    switch (frequency) {
      case 'monthly':
        return amountNum;
      case 'annual':
        return amountNum / 12;
      case 'one_time':
        return 0;
      default:
        return 0;
    }
  };

  const monthlyAmount = calculateMonthlyAmount();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditMode ? '編集' : '新規追加'} - {type === 'income' ? '収入' : '支出'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IncomeCategory | ExpenseCategory)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {Object.entries(categories).map(([key, { label, icon }]) => (
            <option key={key} value={key}>
              {icon} {label}
            </option>
          ))}
        </select>
      </div>

      {/* 項目名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          項目名
        </label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="例: 基本給、食費など"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          金額（円）
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {amount && !isNaN(parseFloat(amount))
            ? `¥${parseFloat(amount).toLocaleString('ja-JP')}`
            : '金額を入力してください'}
        </p>
      </div>

      {/* 頻度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          頻度
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(FREQUENCY_OPTIONS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFrequency(key as Frequency)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                frequency === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 月次換算金額表示 */}
      {frequency !== 'monthly' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">
            <strong>月次換算:</strong>{' '}
            {frequency === 'annual'
              ? `¥${monthlyAmount.toLocaleString('ja-JP', { maximumFractionDigits: 0 })} / 月`
              : '単発のため月次換算なし'}
          </div>
        </div>
      )}

      {/* 固定費・変動費フラグ（支出のみ） */}
      {type === 'expense' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            費用タイプ
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsFixed(true)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                isFixed
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              固定費
            </button>
            <button
              type="button"
              onClick={() => setIsFixed(false)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                !isFixed
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              変動費
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            固定費: 家賃、保険料など毎月一定の支出 / 変動費: 食費、娯楽費など月により変動する支出
          </p>
        </div>
      )}

      {/* メモ欄 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メモ（任意）
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="補足情報やメモ"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={submitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting}
        >
          {submitting ? '送信中...' : isEditMode ? '更新' : '追加'}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;
