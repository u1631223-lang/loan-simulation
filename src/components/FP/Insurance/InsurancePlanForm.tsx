/**
 * 保険プラン入力フォーム
 *
 * 3ステップ形式で保険プランの基本情報を入力
 */

import { useState } from 'react';
import type { InsurancePlanParams, ChildInfo, CurrentInsurance } from '@/types/insurance';

interface InsurancePlanFormProps {
  initialParams?: Partial<InsurancePlanParams>;
  onSubmit: (params: InsurancePlanParams) => void;
  onCancel?: () => void;
}

type Step = 1 | 2 | 3;

export function InsurancePlanForm({ initialParams, onSubmit, onCancel }: InsurancePlanFormProps) {
  const [step, setStep] = useState<Step>(1);

  // Step 1: 基本情報
  const [householdHeadAge, setHouseholdHeadAge] = useState(initialParams?.householdHeadAge ?? 40);
  const [spouseAge, setSpouseAge] = useState(initialParams?.spouseAge ?? 38);
  const [children, setChildren] = useState<ChildInfo[]>(initialParams?.children ?? []);
  const [monthlyExpense, setMonthlyExpense] = useState(initialParams?.monthlyExpense ?? 300000);
  const [housingCost, setHousingCost] = useState(initialParams?.housingCost ?? 100000);

  // Step 2: 収入・資産情報
  const [spouseIncome, setSpouseIncome] = useState(initialParams?.spouseIncome ?? 0);
  const [otherIncome, setOtherIncome] = useState(initialParams?.otherIncome ?? 0);
  const [savings, setSavings] = useState(initialParams?.savings ?? 0);
  const [securities, setSecurities] = useState(initialParams?.securities ?? 0);
  const [realEstate, setRealEstate] = useState(initialParams?.realEstate ?? 0);

  // Step 3: 遺族年金情報・現在の保険
  const [averageSalary, setAverageSalary] = useState(initialParams?.averageSalary ?? 350000);
  const [insuredMonths, setInsuredMonths] = useState(initialParams?.insuredMonths ?? 300);
  const [currentInsurance, setCurrentInsurance] = useState<CurrentInsurance[]>(
    initialParams?.currentInsurance ?? []
  );

  const handleAddChild = () => {
    setChildren([
      ...children,
      {
        age: 6,
        educationPlan: {
          elementary: 'public',
          juniorHigh: 'public',
          highSchool: 'public',
          university: 'national',
        },
      },
    ]);
  };

  const handleRemoveChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const handleUpdateChild = (index: number, field: keyof ChildInfo, value: any) => {
    const updated = [...children];
    if (field === 'age') {
      updated[index] = { ...updated[index], age: value };
    } else if (field === 'educationPlan') {
      updated[index] = { ...updated[index], educationPlan: value };
    }
    setChildren(updated);
  };

  const handleAddInsurance = () => {
    setCurrentInsurance([
      ...currentInsurance,
      {
        id: crypto.randomUUID(),
        type: 'life',
        name: '',
        coverage: 0,
        monthlyPremium: 0,
      },
    ]);
  };

  const handleRemoveInsurance = (index: number) => {
    setCurrentInsurance(currentInsurance.filter((_, i) => i !== index));
  };

  const handleUpdateInsurance = (index: number, field: keyof CurrentInsurance, value: any) => {
    const updated = [...currentInsurance];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentInsurance(updated);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = () => {
    const params: InsurancePlanParams = {
      householdHeadAge,
      spouseAge,
      children,
      monthlyExpense,
      housingCost,
      spouseIncome,
      otherIncome,
      savings,
      securities,
      realEstate,
      averageSalary,
      insuredMonths,
      currentInsurance,
    };
    onSubmit(params);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* ステップインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            基本情報
          </span>
          <span className={step >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            収入・資産
          </span>
          <span className={step >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-600'}>
            年金・保険
          </span>
        </div>
      </div>

      {/* Step 1: 基本情報 */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">基本情報</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                世帯主年齢
              </label>
              <input
                type="number"
                value={householdHeadAge}
                onChange={(e) => setHouseholdHeadAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="20"
                max="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配偶者年齢
              </label>
              <input
                type="number"
                value={spouseAge}
                onChange={(e) => setSpouseAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="20"
                max="70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                月間生活費（円）
              </label>
              <input
                type="number"
                value={monthlyExpense}
                onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住居費（円/年）
                <span className="text-xs text-gray-500 ml-2">
                  ※住宅ローン残債 or 年間家賃
                </span>
              </label>
              <input
                type="number"
                value={housingCost}
                onChange={(e) => setHousingCost(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="10000"
              />
            </div>
          </div>

          {/* 子供情報 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                子供の情報
              </label>
              <button
                type="button"
                onClick={handleAddChild}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + 子供を追加
              </button>
            </div>

            {children.map((child, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">子供 {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveChild(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      年齢
                    </label>
                    <input
                      type="number"
                      value={child.age}
                      onChange={(e) => handleUpdateChild(index, 'age', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="22"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">小学校</label>
                      <select
                        value={child.educationPlan.elementary}
                        onChange={(e) =>
                          handleUpdateChild(index, 'educationPlan', {
                            ...child.educationPlan,
                            elementary: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">中学校</label>
                      <select
                        value={child.educationPlan.juniorHigh}
                        onChange={(e) =>
                          handleUpdateChild(index, 'educationPlan', {
                            ...child.educationPlan,
                            juniorHigh: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">高校</label>
                      <select
                        value={child.educationPlan.highSchool}
                        onChange={(e) =>
                          handleUpdateChild(index, 'educationPlan', {
                            ...child.educationPlan,
                            highSchool: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">公立</option>
                        <option value="private">私立</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 mb-1">大学</label>
                      <select
                        value={child.educationPlan.university}
                        onChange={(e) =>
                          handleUpdateChild(index, 'educationPlan', {
                            ...child.educationPlan,
                            university: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="none">進学なし</option>
                        <option value="national">国立</option>
                        <option value="private">私立文系</option>
                        <option value="science">私立理系</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {children.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                子供の情報がありません。「+ 子供を追加」ボタンから追加してください。
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: 収入・資産情報 */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">収入・資産情報</h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">収入情報</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                配偶者の年収（円）
              </label>
              <input
                type="number"
                value={spouseIncome}
                onChange={(e) => setSpouseIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他の収入（円/年）
                <span className="text-xs text-gray-500 ml-2">
                  ※不動産収入、配当など
                </span>
              </label>
              <input
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">資産情報</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                預貯金（円）
              </label>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                有価証券（円）
                <span className="text-xs text-gray-500 ml-2">
                  ※株式、投資信託など
                </span>
              </label>
              <input
                type="number"
                value={securities}
                onChange={(e) => setSecurities(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                不動産（円）
                <span className="text-xs text-gray-500 ml-2">
                  ※自宅以外の不動産評価額
                </span>
              </label>
              <input
                type="number"
                value={realEstate}
                onChange={(e) => setRealEstate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="100000"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <p className="text-sm text-blue-900">
                <strong>資産合計:</strong> {(savings + securities + realEstate).toLocaleString()}円
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 遺族年金情報・現在の保険 */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">遺族年金情報・現在の保険</h2>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">遺族年金情報（簡易計算用）</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                平均標準報酬月額（円）
                <span className="text-xs text-gray-500 ml-2">
                  ※世帯主の平均月収（社会保険料計算用）
                </span>
              </label>
              <input
                type="number"
                value={averageSalary}
                onChange={(e) => setAverageSalary(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                厚生年金加入月数
                <span className="text-xs text-gray-500 ml-2">
                  ※22歳から現在まで = {(householdHeadAge - 22) * 12}ヶ月
                </span>
              </label>
              <input
                type="number"
                value={insuredMonths}
                onChange={(e) => setInsuredMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="12"
              />
            </div>
          </div>

          {/* 現在の保険 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">現在加入中の保険</h3>
              <button
                type="button"
                onClick={handleAddInsurance}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                + 保険を追加
              </button>
            </div>

            {currentInsurance.map((insurance, index) => (
              <div key={insurance.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900">保険 {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveInsurance(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    削除
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">保険の種類</label>
                    <select
                      value={insurance.type}
                      onChange={(e) => handleUpdateInsurance(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="life">生命保険</option>
                      <option value="medical">医療保険</option>
                      <option value="cancer">がん保険</option>
                      <option value="income">収入保障保険</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">保険名</label>
                    <input
                      type="text"
                      value={insurance.name}
                      onChange={(e) => handleUpdateInsurance(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="保険商品名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">保障額（円）</label>
                    <input
                      type="number"
                      value={insurance.coverage}
                      onChange={(e) =>
                        handleUpdateInsurance(index, 'coverage', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">月額保険料（円）</label>
                    <input
                      type="number"
                      value={insurance.monthlyPremium}
                      onChange={(e) =>
                        handleUpdateInsurance(index, 'monthlyPremium', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="1000"
                    />
                  </div>
                </div>
              </div>
            ))}

            {currentInsurance.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                現在加入中の保険がありません。「+ 保険を追加」ボタンから追加してください。
              </p>
            )}

            {currentInsurance.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900">
                  <strong>保障合計:</strong>{' '}
                  {currentInsurance
                    .reduce((sum, ins) => sum + ins.coverage, 0)
                    .toLocaleString()}
                  円
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>月額保険料合計:</strong>{' '}
                  {currentInsurance
                    .reduce((sum, ins) => sum + ins.monthlyPremium, 0)
                    .toLocaleString()}
                  円
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
          )}
          {onCancel && step === 1 && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>

        <div>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              分析を実行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
