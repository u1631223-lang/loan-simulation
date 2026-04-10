/**
 * DocumentChecklist - 必要書類チェックリストコンポーネント
 *
 * 稲沢市の浄化槽補助金申請に必要な書類の管理
 */

import { useState } from 'react';
import { getInazawaRequiredDocuments } from '@/utils/subsidyCalculator';

interface DocumentChecklistProps {
  includeDemolition: boolean;
  customerName?: string;
}

interface DocumentState {
  order: number;
  checked: boolean;
  notes: string;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  includeDemolition,
  customerName = '',
}) => {
  const documents = getInazawaRequiredDocuments(includeDemolition);

  const [docStates, setDocStates] = useState<Record<number, DocumentState>>(() => {
    const initial: Record<number, DocumentState> = {};
    documents.forEach((doc) => {
      initial[doc.order] = { order: doc.order, checked: false, notes: '' };
    });
    return initial;
  });

  const toggleCheck = (order: number) => {
    setDocStates((prev) => ({
      ...prev,
      [order]: { ...prev[order], checked: !prev[order]?.checked },
    }));
  };

  const updateNotes = (order: number, notes: string) => {
    setDocStates((prev) => ({
      ...prev,
      [order]: { ...prev[order], notes },
    }));
  };

  const totalDocs = documents.length;
  const checkedDocs = Object.values(docStates).filter((d) => d.checked).length;
  const progress = totalDocs > 0 ? Math.round((checkedDocs / totalDocs) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 進捗バー */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            {customerName ? `${customerName}様 ` : ''}書類準備状況
          </h3>
          <span className="text-sm font-bold text-blue-600">
            {checkedDocs} / {totalDocs} 完了
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-sm text-green-600 font-semibold mt-2">
            全書類の準備が完了しました！
          </p>
        )}
      </div>

      {/* 書類リスト */}
      <div className="space-y-2">
        {documents.map((doc) => {
          const state = docStates[doc.order];
          const isChecked = state?.checked || false;
          const isDemolitionDoc = doc.order >= 14;

          return (
            <div
              key={doc.order}
              className={`rounded-lg border p-4 transition ${
                isChecked
                  ? 'bg-green-50 border-green-200'
                  : isDemolitionDoc
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleCheck(doc.order)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5 transition ${
                    isChecked
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {isChecked && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-gray-400 mt-0.5">
                      {doc.order}.
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isChecked ? 'text-green-700 line-through' : 'text-gray-800'
                      }`}>
                        {doc.name}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.description}
                        </p>
                      )}
                      {doc.is_conditional && doc.condition_note && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          * {doc.condition_note}
                        </p>
                      )}
                      {isDemolitionDoc && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded font-medium">
                          解体時のみ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* メモ入力 */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="メモ（任意）"
                      value={state?.notes || ''}
                      onChange={(e) => updateNotes(doc.order, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
