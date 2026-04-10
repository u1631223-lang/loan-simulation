/**
 * ApplicationForm - 補助金申請フォームコンポーネント
 *
 * 顧客情報と申請内容を入力して申請を作成・管理する
 */

import { useState } from 'react';
import type { ApplicationStatus, DemolitionType } from '@/types/subsidy';
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from '@/types/subsidy';
import { calculateSubsidy, formatSubsidyAmount } from '@/utils/subsidyCalculator';

interface ApplicationFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  installationAddress: string;
  tankCapacity: number;
  conversionType: 'new' | 'conversion';
  hasDemolition: boolean;
  demolitionType: DemolitionType;
  hasPlumbing: boolean;
  estimatedCost: string;
  status: ApplicationStatus;
  notes: string;
}

interface ApplicationFormProps {
  onSubmit?: (data: ApplicationFormData) => void;
  initialData?: Partial<ApplicationFormData>;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [form, setForm] = useState<ApplicationFormData>({
    customerName: initialData?.customerName || '',
    customerPhone: initialData?.customerPhone || '',
    customerAddress: initialData?.customerAddress || '',
    installationAddress: initialData?.installationAddress || '',
    tankCapacity: initialData?.tankCapacity || 5,
    conversionType: initialData?.conversionType || 'new',
    hasDemolition: initialData?.hasDemolition || false,
    demolitionType: initialData?.demolitionType || 'single_tank',
    hasPlumbing: initialData?.hasPlumbing || false,
    estimatedCost: initialData?.estimatedCost || '',
    status: initialData?.status || 'draft',
    notes: initialData?.notes || '',
  });

  const [saved, setSaved] = useState(false);

  const subsidyResult = calculateSubsidy({
    municipality_id: '',
    tank_capacity: form.tankCapacity,
    has_demolition: form.hasDemolition,
    demolition_type: form.hasDemolition ? form.demolitionType : undefined,
    has_plumbing: form.hasPlumbing,
    conversion_type: form.conversionType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = <K extends keyof ApplicationFormData>(
    key: K,
    value: ApplicationFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const statusOptions: ApplicationStatus[] = [
    'draft', 'preparing', 'submitted', 'approved', 'rejected', 'completed',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 顧客情報 */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">1</span>
          顧客情報
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              お客様名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              placeholder="例: 梅村"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              電話番号
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => updateField('customerPhone', e.target.value)}
              placeholder="例: 0587-XX-XXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              住所
            </label>
            <input
              type="text"
              value={form.customerAddress}
              onChange={(e) => updateField('customerAddress', e.target.value)}
              placeholder="例: 愛知県稲沢市..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 設置情報 */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">2</span>
          浄化槽設置情報
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              設置場所
            </label>
            <input
              type="text"
              value={form.installationAddress}
              onChange={(e) => updateField('installationAddress', e.target.value)}
              placeholder="設置場所の住所"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* 設置タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">設置タイプ</label>
            <div className="grid grid-cols-2 gap-2">
              {(['new', 'conversion'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('conversionType', type)}
                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                    form.conversionType === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {type === 'new' ? '新規設置' : '転換（単独→合併）'}
                </button>
              ))}
            </div>
          </div>

          {/* 人槽 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">人槽</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 5, label: '5人槽' },
                { value: 7, label: '6〜7人槽' },
                { value: 10, label: '8〜10人槽' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('tankCapacity', opt.value)}
                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${
                    form.tankCapacity === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 解体 */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasDemolition}
                onChange={(e) => updateField('hasDemolition', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                既存槽の撤去（解体）あり
              </span>
            </label>

            {form.hasDemolition && (
              <div className="ml-8 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="demolition"
                    checked={form.demolitionType === 'single_tank'}
                    onChange={() => updateField('demolitionType', 'single_tank')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">単独処理浄化槽（上限12万円）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="demolition"
                    checked={form.demolitionType === 'cesspool'}
                    onChange={() => updateField('demolitionType', 'cesspool')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">くみ取り便槽（上限9万円）</span>
                </label>
              </div>
            )}
          </div>

          {/* 配管工事 */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.hasPlumbing}
              onChange={(e) => updateField('hasPlumbing', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              配管工事あり（上限30万円）
            </span>
          </label>

          {/* 工事見積額 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">工事見積額</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={form.estimatedCost}
                onChange={(e) => updateField('estimatedCost', e.target.value.replace(/[^\d]/g, ''))}
                placeholder="例: 1500000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">円</span>
            </div>
            {form.estimatedCost && (
              <p className="text-xs text-gray-500 mt-1">
                ({(Number(form.estimatedCost) / 10000).toFixed(1)}万円)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 補助金額（自動計算） */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm font-bold">$</span>
          補助金額（自動計算）
        </h3>

        <div className="space-y-2">
          {subsidyResult.breakdown.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-semibold">{formatSubsidyAmount(item.amount)}</span>
            </div>
          ))}
          <div className="border-t border-green-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-green-800">合計</span>
              <span className="text-xl font-bold text-green-600">
                {formatSubsidyAmount(subsidyResult.total_subsidy)}
              </span>
            </div>
          </div>
        </div>

        {form.estimatedCost && Number(form.estimatedCost) > 0 && (
          <div className="mt-3 p-3 bg-white/60 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">実質自己負担額（概算）</span>
              <span className="font-bold text-gray-800">
                {formatSubsidyAmount(
                  Math.max(0, Number(form.estimatedCost) - subsidyResult.total_subsidy)
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ステータス・メモ */}
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold">3</span>
          申請管理
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">ステータス</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateField('status', s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    form.status === s
                      ? APPLICATION_STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-blue-400'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {APPLICATION_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              placeholder="梅村様: 解体の補助金も追加申請が必要..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition active:scale-[0.98] shadow-lg shadow-blue-200"
      >
        {saved ? '保存しました！' : '申請データを保存'}
      </button>
    </form>
  );
};
