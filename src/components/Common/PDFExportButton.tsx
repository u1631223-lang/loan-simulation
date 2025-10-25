/**
 * PDF出力ボタンコンポーネント
 */

import { useState } from 'react';
import type { LoanParams, LoanResult } from '@/types';
import { generateLoanPDF } from '@/utils/pdfGenerator';

export interface PDFExportButtonProps {
  result: LoanResult;
  params: LoanParams;
  className?: string;
}

export const PDFExportButton = ({ result, params, className = '' }: PDFExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError('');

      await generateLoanPDF(result, params, {
        title: '住宅ローンシミュレーション結果',
        author: '住宅ローン電卓',
      });

      // 成功メッセージは自動的にダウンロードされるため不要
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF出力に失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200 shadow-md"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>PDF出力中...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>PDF出力</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
