/**
 * データエクスポートユーティリティ
 *
 * CSV/Excel形式でのデータエクスポート機能を提供します。
 */

import * as XLSX from 'xlsx';
import type { PaymentSchedule } from '@/types';

/**
 * CSV形式でデータをエクスポート
 *
 * @param data データ配列
 * @param filename ファイル名
 */
export const exportToCSV = (data: unknown[], filename: string): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  // データをCSV形式に変換
  const headers = Object.keys(data[0] as object);
  const csvContent = [
    headers.join(','), // ヘッダー行
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header];
          // 値にカンマや改行が含まれる場合はダブルクォートで囲む
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  // UTF-8 BOM付きでダウンロード（Excelで文字化け防止）
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Excel形式でデータをエクスポート
 *
 * @param data データ配列
 * @param filename ファイル名
 * @param sheetName シート名
 */
export const exportToExcel = (
  data: unknown[],
  filename: string,
  sheetName: string = 'Sheet1'
): void => {
  if (data.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  // ワークブックを作成
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Excelファイルとして保存
  XLSX.writeFile(workbook, filename);
};

/**
 * 住宅ローン返済予定表をCSV出力
 *
 * @param schedule 返済計画表
 */
export const exportLoanScheduleCSV = (schedule: PaymentSchedule[]): void => {
  const data = schedule.map((item) => ({
    '返済回数': item.month,
    '返済額': item.payment,
    '元金': item.principal,
    '利息': item.interest,
    '残高': item.balance,
    'ボーナス月': item.isBonus ? 'はい' : 'いいえ',
  }));

  exportToCSV(data, `loan-schedule-${Date.now()}.csv`);
};

/**
 * 住宅ローン返済予定表をExcel出力
 *
 * @param schedule 返済計画表
 */
export const exportLoanScheduleExcel = (schedule: PaymentSchedule[]): void => {
  const data = schedule.map((item) => ({
    '返済回数': item.month,
    '返済額': item.payment,
    '元金': item.principal,
    '利息': item.interest,
    '残高': item.balance,
    'ボーナス月': item.isBonus ? 'はい' : 'いいえ',
  }));

  exportToExcel(data, `loan-schedule-${Date.now()}.xlsx`, '返済予定表');
};

/**
 * ライフイベント一覧をCSV出力（仮実装）
 *
 * 注: Phase 13のライフプラン機能完成後に詳細実装予定
 */
export const exportLifeEventsCSV = (events: unknown[]): void => {
  if (events.length === 0) {
    throw new Error('エクスポートするライフイベントがありません');
  }

  const data = events.map((event: any) => ({
    '年': event.year || '',
    'イベント': event.name || '',
    '費用': event.cost || 0,
    'カテゴリ': event.category || '',
  }));

  exportToCSV(data, `life-events-${Date.now()}.csv`);
};

/**
 * 家計収支をCSV出力（仮実装）
 *
 * 注: Phase 14の家計収支機能完成後に詳細実装予定
 */
export const exportBudgetCSV = (incomes: unknown[], expenses: unknown[]): void => {
  const incomeData = incomes.map((item: any) => ({
    '種別': '収入',
    '項目': item.name || '',
    '金額': item.amount || 0,
    'カテゴリ': item.category || '',
  }));

  const expenseData = expenses.map((item: any) => ({
    '種別': '支出',
    '項目': item.name || '',
    '金額': item.amount || 0,
    'カテゴリ': item.category || '',
  }));

  const data = [...incomeData, ...expenseData];
  exportToCSV(data, `budget-${Date.now()}.csv`);
};

/**
 * キャッシュフロー表をExcel出力（仮実装）
 *
 * 注: Phase 13のライフプラン機能完成後に詳細実装予定
 */
export const exportCashFlowExcel = (cashFlows: unknown[]): void => {
  if (cashFlows.length === 0) {
    throw new Error('エクスポートするキャッシュフローがありません');
  }

  const data = cashFlows.map((cf: any) => ({
    '年': cf.year || '',
    '収入': cf.income || 0,
    '支出': cf.expense || 0,
    '貯蓄': cf.savings || 0,
    '資産残高': cf.balance || 0,
  }));

  exportToExcel(data, `cashflow-${Date.now()}.xlsx`, 'キャッシュフロー表');
};

/**
 * 複数シートのExcelワークブックを作成
 *
 * @param sheets シート定義の配列 { name: string, data: unknown[] }[]
 * @param filename ファイル名
 */
export const exportMultiSheetExcel = (
  sheets: { name: string; data: unknown[] }[],
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    if (sheet.data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
  });

  XLSX.writeFile(workbook, filename);
};

/**
 * 統合レポートをExcel出力（複数シート）
 *
 * 注: Phase 10-18完了後に全機能のデータをまとめて出力
 */
export const exportComprehensiveExcel = (allData: {
  loanSchedule?: PaymentSchedule[];
  lifeEvents?: unknown[];
  budget?: { incomes: unknown[]; expenses: unknown[] };
  cashFlows?: unknown[];
}): void => {
  const sheets: { name: string; data: unknown[] }[] = [];

  // 返済予定表
  if (allData.loanSchedule && allData.loanSchedule.length > 0) {
    const loanData = allData.loanSchedule.map((item) => ({
      '返済回数': item.month,
      '返済額': item.payment,
      '元金': item.principal,
      '利息': item.interest,
      '残高': item.balance,
    }));
    sheets.push({ name: '返済予定表', data: loanData });
  }

  // ライフイベント
  if (allData.lifeEvents && allData.lifeEvents.length > 0) {
    sheets.push({ name: 'ライフイベント', data: allData.lifeEvents });
  }

  // 家計収支
  if (allData.budget) {
    const budgetData = [
      ...(allData.budget.incomes || []).map((item: any) => ({
        '種別': '収入',
        '項目': item.name || '',
        '金額': item.amount || 0,
      })),
      ...(allData.budget.expenses || []).map((item: any) => ({
        '種別': '支出',
        '項目': item.name || '',
        '金額': item.amount || 0,
      })),
    ];
    if (budgetData.length > 0) {
      sheets.push({ name: '家計収支', data: budgetData });
    }
  }

  // キャッシュフロー
  if (allData.cashFlows && allData.cashFlows.length > 0) {
    sheets.push({ name: 'キャッシュフロー', data: allData.cashFlows });
  }

  if (sheets.length === 0) {
    throw new Error('エクスポートするデータがありません');
  }

  exportMultiSheetExcel(sheets, `comprehensive-report-${Date.now()}.xlsx`);
};
