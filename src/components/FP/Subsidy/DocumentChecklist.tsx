/**
 * DocumentChecklist - 必要書類チェックリストコンポーネント
 *
 * 稲沢市の浄化槽補助金申請に必要な書類の管理
 * 3つの表示モード: お客様向け / 業者向け / 正式書類名
 * LINE・メール送信用のコピー機能、印刷機能付き
 */

import { useState, useCallback } from 'react';
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

type ViewMode = 'customer' | 'contractor' | 'checklist';

const WHO_PREPARES_BADGE = {
  customer: { label: 'お客様', className: 'bg-blue-100 text-blue-700' },
  contractor: { label: '業者', className: 'bg-amber-100 text-amber-700' },
  both: { label: 'お客様+業者', className: 'bg-purple-100 text-purple-700' },
} as const;

/**
 * お客様向けの共有テキストを生成（LINE・メール用）
 */
function generateCustomerText(
  documents: ReturnType<typeof getInazawaRequiredDocuments>,
  customerName: string,
  includeDemolition: boolean
): string {
  const lines: string[] = [];

  lines.push('【稲沢市】浄化槽補助金');
  lines.push('ご準備いただく書類のご案内');
  if (customerName) {
    lines.push('');
    lines.push(`${customerName}様`);
  }
  lines.push('');
  lines.push('ーーーーーーーーーーーーーーー');

  const customerDocs = documents.filter(
    (d) => d.order <= 13 && d.order !== 13 && (d.who_prepares === 'customer' || d.who_prepares === 'both')
  );
  const contractorDocs = documents.filter(
    (d) => d.order <= 13 && d.who_prepares === 'contractor'
  );

  lines.push('');
  lines.push('【お客様にご用意いただくもの】');
  lines.push('');
  customerDocs.forEach((doc) => {
    lines.push(`${doc.customer_guide || doc.name}`);
    if (doc.how_to_get) {
      lines.push(`  → ${doc.how_to_get}`);
    }
    if (doc.is_conditional && doc.condition_note) {
      lines.push(`  ※ ${doc.condition_note}`);
    }
    lines.push('');
  });

  lines.push('【工事業者が用意するもの】');
  lines.push('（以下はこちらで手配しますのでご安心ください）');
  lines.push('');
  contractorDocs.forEach((doc) => {
    lines.push(`・${doc.customer_guide || doc.name}`);
  });

  if (includeDemolition) {
    lines.push('');
    lines.push('【解体（撤去）がある場合の追加書類】');
    lines.push('');
    const demoDocs = documents.filter((d) => d.order >= 14);
    demoDocs.forEach((doc) => {
      lines.push(`・${doc.customer_guide || doc.name}`);
      if (doc.how_to_get) {
        lines.push(`  → ${doc.how_to_get}`);
      }
    });
  }

  lines.push('');
  lines.push('ーーーーーーーーーーーーーーー');
  lines.push('※ 書類はすべてA4サイズでお願いします');
  lines.push('※ ご不明な点はお気軽にお問い合わせください');

  return lines.join('\n');
}

/**
 * 業者向けの共有テキストを生成
 */
function generateContractorText(
  documents: ReturnType<typeof getInazawaRequiredDocuments>,
  customerName: string,
  includeDemolition: boolean
): string {
  const lines: string[] = [];

  lines.push('【稲沢市】浄化槽補助金申請');
  lines.push('書類準備チェックリスト（業者用）');
  if (customerName) {
    lines.push(`お客様: ${customerName}様`);
  }
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━');

  // 業者が用意する書類
  const contractorDocs = documents.filter(
    (d) => d.who_prepares === 'contractor' || d.who_prepares === 'both'
  );
  const customerOnlyDocs = documents.filter(
    (d) => d.who_prepares === 'customer' && d.order !== 13
  );

  lines.push('');
  lines.push('■ 業者側で手配する書類');
  lines.push('');
  contractorDocs.forEach((doc) => {
    const isDemolition = doc.order >= 14;
    const prefix = isDemolition ? '【解体】' : '';
    lines.push(`□ ${prefix}${doc.name}`);
    if (doc.contractor_guide) {
      lines.push(`  内容: ${doc.contractor_guide}`);
    }
    if (doc.contractor_timing) {
      lines.push(`  時期: ${doc.contractor_timing}`);
    }
    lines.push('');
  });

  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push('■ お客様に依頼する書類（声がけ忘れ注意）');
  lines.push('');
  customerOnlyDocs.forEach((doc) => {
    lines.push(`□ ${doc.name}`);
    if (doc.contractor_guide) {
      lines.push(`  → ${doc.contractor_guide}`);
    }
    lines.push('');
  });

  lines.push('━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push('■ 注意事項');
  lines.push('・全書類A4サイズ');
  lines.push('・登記事項証明書と住民票は発行後3ヶ月以内');
  lines.push('・下水道計画区域内は補助対象外（12番で確認必須）');
  if (includeDemolition) {
    lines.push('・撤去前写真は工事着手前に必ず撮影（日付入り推奨）');
  }
  lines.push('');
  lines.push('問合せ先: 稲沢市 経済環境部 環境保全課');

  return lines.join('\n');
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  includeDemolition,
  customerName = '',
}) => {
  const documents = getInazawaRequiredDocuments(includeDemolition);

  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [docStates, setDocStates] = useState<Record<number, DocumentState>>(() => {
    const initial: Record<number, DocumentState> = {};
    documents.forEach((doc) => {
      initial[doc.order] = { order: doc.order, checked: false, notes: '' };
    });
    return initial;
  });

  const [copied, setCopied] = useState<'customer' | 'contractor' | null>(null);

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

  const doCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, []);

  const handleCopyCustomer = useCallback(async () => {
    const text = generateCustomerText(documents, customerName, includeDemolition);
    await doCopy(text);
    setCopied('customer');
    setTimeout(() => setCopied(null), 2000);
  }, [documents, customerName, includeDemolition, doCopy]);

  const handleCopyContractor = useCallback(async () => {
    const text = generateContractorText(documents, customerName, includeDemolition);
    await doCopy(text);
    setCopied('contractor');
    setTimeout(() => setCopied(null), 2000);
  }, [documents, customerName, includeDemolition, doCopy]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const totalDocs = documents.length;
  const checkedDocs = Object.values(docStates).filter((d) => d.checked).length;
  const progress = totalDocs > 0 ? Math.round((checkedDocs / totalDocs) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* コピーボタン2つ + 印刷 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopyCustomer}
          className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-medium text-sm transition active:scale-[0.98] ${
            copied === 'customer'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {copied === 'customer' ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>コピー済み！</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>お客様向けコピー</span>
            </>
          )}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleCopyContractor}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl font-medium text-sm transition active:scale-[0.98] ${
              copied === 'contractor'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {copied === 'contractor' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>コピー済み！</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>業者向けコピー</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-3 rounded-xl font-medium text-sm bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition active:scale-[0.98] print:hidden"
            title="印刷"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 表示切替: お客様向け / 業者向け / 正式名 */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('customer')}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
            viewMode === 'customer' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          お客様向け
        </button>
        <button
          onClick={() => setViewMode('contractor')}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
            viewMode === 'contractor' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          業者向け
        </button>
        <button
          onClick={() => setViewMode('checklist')}
          className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
            viewMode === 'checklist' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
          }`}
        >
          正式書類名
        </button>
      </div>

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
          const prepBadge = doc.who_prepares ? WHO_PREPARES_BADGE[doc.who_prepares] : null;

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
                      {viewMode === 'customer' && (
                        <>
                          <p className={`text-sm font-medium ${
                            isChecked ? 'text-green-700 line-through' : 'text-gray-800'
                          }`}>
                            {doc.customer_guide || doc.name}
                          </p>
                          {doc.how_to_get && (
                            <p className="text-xs text-blue-600 mt-1 flex items-start gap-1">
                              <span className="flex-shrink-0 mt-0.5">→</span>
                              <span>{doc.how_to_get}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            正式名: {doc.name}
                          </p>
                        </>
                      )}

                      {viewMode === 'contractor' && (
                        <>
                          <p className={`text-sm font-medium ${
                            isChecked ? 'text-green-700 line-through' : 'text-gray-800'
                          }`}>
                            {doc.name}
                          </p>
                          {doc.contractor_guide && (
                            <div className="mt-1.5 p-2 bg-amber-50 rounded-md border border-amber-100">
                              <p className="text-xs text-amber-800">
                                {doc.contractor_guide}
                              </p>
                            </div>
                          )}
                          {doc.contractor_timing && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{doc.contractor_timing}</span>
                            </p>
                          )}
                        </>
                      )}

                      {viewMode === 'checklist' && (
                        <>
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
                        </>
                      )}

                      {/* バッジ行 */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {prepBadge && (
                          <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${prepBadge.className}`}>
                            {prepBadge.label}が用意
                          </span>
                        )}
                        {doc.is_conditional && doc.condition_note && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded font-medium border border-amber-200">
                            条件: {doc.condition_note}
                          </span>
                        )}
                        {isDemolitionDoc && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded font-medium">
                            解体時のみ
                          </span>
                        )}
                      </div>
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
