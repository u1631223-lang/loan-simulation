/**
 * LifeEventForm - ライフイベント作成・編集フォーム
 */

import React, { useState, useEffect } from 'react';
import type {
  LifeEventType,
  CreateLifeEventParams,
  UpdateLifeEventParams,
  LifeEvent,
} from '@/types/lifePlan';
import { LIFE_EVENT_CATEGORIES } from '@/types/lifePlan';

interface LifeEventFormProps {
  lifePlanId: string;
  event?: LifeEvent;
  onSubmit: (params: CreateLifeEventParams | UpdateLifeEventParams) => Promise<void>;
  onCancel: () => void;
}

const LifeEventForm: React.FC<LifeEventFormProps> = ({
  lifePlanId,
  event,
  onSubmit,
  onCancel,
}) => {
  const [eventType, setEventType] = useState<LifeEventType>(event?.eventType || 'marriage');
  const [eventName, setEventName] = useState(event?.eventName || '');
  const [year, setYear] = useState(event?.year || new Date().getFullYear());
  const [amount, setAmount] = useState(event?.amount || 0);
  const [notes, setNotes] = useState(event?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // イベントタイプ変更時にデフォルト値を設定
  useEffect(() => {
    if (!event) {
      const category = LIFE_EVENT_CATEGORIES[eventType];
      setAmount(category.defaultAmount || 0);
      if (!eventName) {
        setEventName(category.label);
      }
    }
  }, [eventType, event, eventName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const params = event
        ? ({
            eventType,
            eventName,
            year,
            amount: amount || undefined,
            notes: notes || undefined,
          } as UpdateLifeEventParams)
        : ({
            lifePlanId,
            eventType,
            eventName,
            year,
            amount: amount || undefined,
            notes: notes || undefined,
          } as CreateLifeEventParams);

      await onSubmit(params);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* イベントタイプ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          イベント種類
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(LIFE_EVENT_CATEGORIES) as LifeEventType[]).map((type) => {
            const category = LIFE_EVENT_CATEGORIES[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setEventType(type)}
                className={`p-3 border-2 rounded-lg transition ${
                  eventType === type
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.label}</div>
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {LIFE_EVENT_CATEGORIES[eventType].description}
        </p>
      </div>

      {/* イベント名 */}
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
          イベント名 *
        </label>
        <input
          type="text"
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例：長男の小学校入学"
        />
      </div>

      {/* 年 */}
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
          発生年 *
        </label>
        <input
          type="number"
          id="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          required
          min={2000}
          max={2100}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 金額 */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          金額（円）
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
          min={0}
          step={10000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="mt-1 text-xs text-gray-500">
          {amount > 0 ? `${(amount / 10000).toLocaleString()}万円` : '金額なし'}
        </p>
      </div>

      {/* メモ */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          メモ
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="このイベントに関する詳細やメモ..."
        />
      </div>

      {/* ボタン */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !eventName}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? '保存中...' : event ? '更新' : '追加'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default LifeEventForm;
