/**
 * データエクスポートユーティリティ（CSV/Excel）
 */

import * as XLSX from 'xlsx';
import type { PaymentSchedule } from '@/types';

export const exportToCSV = (data: unknown[], filename: string): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  const headers = Object.keys(data[0] as object);
  // CSV Formula Injection (CWE-1236) を防ぐため、=, +, -, @, |, タブ で
  // 始まる文字列の前に ' を挿入して Excel での式評価を抑止する。
  const FORMULA_PREFIX = /^[=+\-@|\t\r]/;
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const raw = String(value);
    const safe = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
    if (/[",\r\n]/.test(safe)) {
      return `"${safe.replace(/"/g, '""')}"`;
    }
    return safe;
  };
  const csvContent = [
    headers.map(escape).join(','),
    ...data.map((row) =>
      headers
        .map((header) => escape((row as Record<string, unknown>)[header]))
        .join(',')
    ),
  ].join('\r\n');

  // UTF-8 BOM 付きでダウンロード（Excel での文字化けを防止）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (
  data: unknown[],
  filename: string,
  sheetName: string = 'Sheet1'
): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

const scheduleToRows = (schedule: PaymentSchedule[]) =>
  schedule.map((item) => ({
    '返済回数': item.month,
    '返済額': item.payment,
    '元金': item.principal,
    '利息': item.interest,
    '残高': item.balance,
    'ボーナス月': item.isBonus ? 'はい' : 'いいえ',
  }));

export const exportLoanScheduleCSV = (schedule: PaymentSchedule[]): void => {
  exportToCSV(scheduleToRows(schedule), `loan-schedule-${Date.now()}.csv`);
};

export const exportLoanScheduleExcel = (schedule: PaymentSchedule[]): void => {
  exportToExcel(scheduleToRows(schedule), `loan-schedule-${Date.now()}.xlsx`, '返済予定表');
};
