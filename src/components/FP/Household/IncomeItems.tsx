/**
 * IncomeItems - 収入項目管理UI
 *
 * 収入項目の一覧表示・追加・編集・削除機能を提供
 */

import React, { useState } from 'react';
import {
  useIncomeItems,
  type IncomeCategory,
  type Frequency,
  type IncomeItem,
  type CreateIncomeItemParams,
  type UpdateIncomeItemParams,
} from '@/hooks/useIncomeItems';

interface IncomeItemsProps {
  budgetId: string;
}

// 収入カテゴリのメタデータ
const INCOME_CATEGORIES: Record<IncomeCategory, { label: string; icon: string }> = {
  salary: { label: '給与', icon: '💼' },
  bonus: { label: '賞与', icon: '🎁' },
  side_income: { label: '副収入', icon: '💡' },
  pension: { label: '年金', icon: '🏦' },
  investment: { label: '投資収益', icon: '📈' },
  other: { label: 'その他', icon: '💰' },
};

// 頻度のラベル
const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: '毎月',
  annual: '年1回',
  one_time: '単発',
};

const IncomeItems: React.FC<IncomeItemsProps> = ({ budgetId }) => {
  const { incomeItems, loading, error, createIncomeItem, updateIncomeItem, deleteIncomeItem } =
    useIncomeItems(budgetId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);
  const [formData, setFormData] = useState<{
    category: IncomeCategory;
    itemName: string;
    amount: number;
    frequency: Frequency;
  }>({
    category: 'salary',
    itemName: '',
    amount: 0,
    frequency: 'monthly',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォームを開く
  const openForm = (item?: IncomeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        itemName: item.itemName,
        amount: item.amount,
        frequency: item.frequency,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: 'salary',
        itemName: '',
        amount: 0,
        frequency: 'monthly',
      });
    }
    setIsFormOpen(true);
  };

  // フォームを閉じる
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingItem) {
        // 更新
        const params: UpdateIncomeItemParams = {
          category: formData.category,
          itemName: formData.itemName,
          amount: formData.amount,
          frequency: formData.frequency,
        };
        await updateIncomeItem(editingItem.id, params);
      } else {
        // 作成
        const params: CreateIncomeItemParams = {
          budgetId,
          category: formData.category,
          itemName: formData.itemName,
          amount: formData.amount,
          frequency: formData.frequency,
        };
        await createIncomeItem(params);
      }
      closeForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除確認
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`「${name}」を削除してもよろしいですか？`)) {
      await deleteIncomeItem(id);
    }
  };

  // 月次金額の計算（年次→月次換算）
  const getMonthlyAmount = (item: IncomeItem): number => {
    if (item.frequency === 'monthly') return item.amount;
    if (item.frequency === 'annual') return item.amount / 12;
    return 0; // one_time は月次換算しない
  };

  // 月次合計
  const totalMonthly = incomeItems.reduce((sum, item) => sum + getMonthlyAmount(item), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">収入項目</h3>
          <p className="text-sm text-gray-600">
            月次合計: <span className="font-semibold text-blue-600">{totalMonthly.toLocaleString()}円</span>
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          + 収入を追加
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 収入項目一覧 */}
      {incomeItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          収入項目がありません。「+ 収入を追加」から追加してください。
        </div>
      ) : (
        <div className="space-y-2">
          {incomeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{INCOME_CATEGORIES[item.category].icon}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {INCOME_CATEGORIES[item.category].label}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {FREQUENCY_LABELS[item.frequency]}
                    </span>
                  </div>
                  <div className="font-medium text-gray-800">{item.itemName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.frequency === 'monthly' && `月額: ${item.amount.toLocaleString()}円`}
                    {item.frequency === 'annual' && (
                      <>
                        年額: {item.amount.toLocaleString()}円{' '}
                        <span className="text-gray-500">
                          (月換算: {Math.round(item.amount / 12).toLocaleString()}円)
                        </span>
                      </>
                    )}
                    {item.frequency === 'one_time' && `金額: ${item.amount.toLocaleString()}円`}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openForm(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.itemName)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* フォームモーダル */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingItem ? '収入項目を編集' : '収入項目を追加'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* カテゴリ選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(INCOME_CATEGORIES) as IncomeCategory[]).map((category) => {
                    const cat = INCOME_CATEGORIES[category];
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setFormData({ ...formData, category })}
                        className={`p-2 border-2 rounded-lg transition ${
                          formData.category === category
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-xl">{cat.icon}</div>
                        <div className="text-xs mt-1">{cat.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 項目名 */}
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                  項目名 *
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：基本給"
                />
              </div>

              {/* 頻度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  頻度 *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((frequency) => (
                    <button
                      key={frequency}
                      type="button"
                      onClick={() => setFormData({ ...formData, frequency })}
                      className={`px-3 py-2 border-2 rounded-lg transition text-sm ${
                        formData.frequency === frequency
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {FREQUENCY_LABELS[frequency]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 金額 */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  金額（円） *
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value, 10) || 0 })}
                  required
                  min={0}
                  step={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {formData.frequency === 'annual' && formData.amount > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    月換算: {Math.round(formData.amount / 12).toLocaleString()}円
                  </p>
                )}
              </div>

              {/* ボタン */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.itemName}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? '保存中...' : editingItem ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeItems;
