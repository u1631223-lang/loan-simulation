/**
 * データエクスポートボタンコンポーネント
 */

import { useState } from 'react';
import type { PaymentSchedule } from '@/types';
import { exportLoanScheduleCSV, exportLoanScheduleExcel } from '@/utils/dataExporter';

export type ExportFormat = 'csv' | 'excel';

export interface ExportButtonProps {
  schedule: PaymentSchedule[];
  className?: string;
  defaultFormat?: ExportFormat;
}

export const ExportButton = ({
  schedule,
  className = '',
  defaultFormat = 'csv',
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [format, setFormat] = useState<ExportFormat>(defaultFormat);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError('');

      if (format === 'csv') {
        exportLoanScheduleCSV(schedule);
      } else {
        exportLoanScheduleExcel(schedule);
      }

      setShowDropdown(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition duration-200 shadow-md"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>エクスポート中...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{format === 'csv' ? 'CSV出力' : 'Excel出力'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 shadow-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          <button
            onClick={() => {
              setFormat('csv');
              setShowDropdown(false);
            }}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
              format === 'csv' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
            }`}
          >
            CSV形式
          </button>
          <button
            onClick={() => {
              setFormat('excel');
              setShowDropdown(false);
            }}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
              format === 'excel' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
            }`}
          >
            Excel形式
          </button>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
