/**
 * PDF出力ユーティリティ
 *
 * jsPDF と html2canvas を使ってローン計算結果の PDF を生成する。
 * 無料版では制限なしで誰でも出力可能。
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { LoanParams, LoanResult } from '@/types';
import { formatCurrency } from './loanCalculator';

export interface PDFOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
}

/**
 * HTML テンプレートに数値・文字列を埋め込む際の XSS 対策。
 * 現状は数値のみだが、将来メモ等のユーザー入力を載せる場合に備えて
 * すべての動的値をエスケープ経由で埋め込む。
 */
const escapeHtml = (value: unknown): string => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const getCurrentDateTime = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}年${mm}月${dd}日 ${hh}:${mi}`;
};

const generatePDFFromHTML = async (
  htmlContent: string,
  filename: string
): Promise<void> => {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '40px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";
  tempDiv.innerHTML = htmlContent;
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = pdfWidth / (canvas.width / 2);
    const scaledHeight = (canvas.height / 2) * ratio;

    let heightLeft = scaledHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(tempDiv);
  }
};

export const generateLoanPDF = async (
  result: LoanResult,
  params: LoanParams,
  _options: PDFOptions = {}
): Promise<void> => {
  const firstYear = result.schedule.slice(0, 12);
  const lastYear = result.schedule.slice(-12);

  const renderRows = (rows: typeof firstYear, useIndex: boolean) =>
    rows
      .map(
        (payment, index) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${escapeHtml(useIndex ? index + 1 : payment.month)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${escapeHtml(formatCurrency(payment.payment))}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${escapeHtml(formatCurrency(payment.principal))}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${escapeHtml(formatCurrency(payment.interest))}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${escapeHtml(formatCurrency(payment.balance))}</td>
        </tr>`
      )
      .join('');

  const htmlContent = `
    <div style="font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; padding: 20px;">
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 10px; color: #1E40AF;">
        住宅ローンシミュレーション結果
      </h1>
      <p style="text-align: right; font-size: 12px; color: #666; margin-bottom: 20px;">
        生成日時: ${escapeHtml(getCurrentDateTime())}
      </p>
      <hr style="border: none; border-top: 2px solid #1E40AF; margin-bottom: 30px;">

      <h2 style="font-size: 18px; color: #1E40AF; margin-bottom: 15px; border-left: 4px solid #1E40AF; padding-left: 10px;">
        ローン条件
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold; width: 35%;">借入金額</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(formatCurrency(params.principal))}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">金利</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(params.interestRate.toFixed(2))}%</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">返済期間</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(params.years)}年${escapeHtml(params.months)}ヶ月</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">返済方式</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${params.repaymentType === 'equal-payment' ? '元利均等返済' : '元金均等返済'}</td>
        </tr>
        ${params.bonusPayment?.enabled ? `
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">ボーナス払い</td>
          <td style="padding: 10px; border: 1px solid #ddd;">年${escapeHtml(params.bonusPayment.months.length)}回 ${escapeHtml(formatCurrency(params.bonusPayment.amount))}</td>
        </tr>
        ` : ''}
      </table>

      <h2 style="font-size: 18px; color: #1E40AF; margin-bottom: 15px; border-left: 4px solid #1E40AF; padding-left: 10px;">
        計算結果
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold; width: 35%;">月々返済額</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #10B981;">${escapeHtml(formatCurrency(result.monthlyPayment))}</td>
        </tr>
        ${result.bonusPayment ? `
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">ボーナス返済額</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #10B981;">${escapeHtml(formatCurrency(result.bonusPayment))}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">総返済額</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(formatCurrency(result.totalPayment))}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">元金総額</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(formatCurrency(result.totalPrincipal))}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background-color: #f3f4f6; border: 1px solid #ddd; font-weight: bold;">利息総額</td>
          <td style="padding: 10px; border: 1px solid #ddd; color: #EF4444;">${escapeHtml(formatCurrency(result.totalInterest))}</td>
        </tr>
      </table>

      <h2 style="font-size: 18px; color: #1E40AF; margin-bottom: 15px; border-left: 4px solid #1E40AF; padding-left: 10px;">
        返済計画表（抜粋）
      </h2>
      <p style="font-size: 12px; color: #666; margin-bottom: 10px;">最初の12ヶ月と最後の12ヶ月を表示</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #1E40AF; color: white;">
            <th style="padding: 10px; border: 1px solid #ddd;">回数</th>
            <th style="padding: 10px; border: 1px solid #ddd;">返済額</th>
            <th style="padding: 10px; border: 1px solid #ddd;">元金</th>
            <th style="padding: 10px; border: 1px solid #ddd;">利息</th>
            <th style="padding: 10px; border: 1px solid #ddd;">残高</th>
          </tr>
        </thead>
        <tbody>
          ${renderRows(firstYear, true)}
          <tr>
            <td colspan="5" style="padding: 10px; text-align: center; background-color: #f9fafb; color: #666;">...</td>
          </tr>
          ${renderRows(lastYear, false)}
        </tbody>
      </table>

      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 10px;">
      <p style="text-align: center; font-size: 10px; color: #999;">
        Generated by 住宅ローン電卓 (${escapeHtml(getCurrentDateTime())})
      </p>
    </div>
  `;

  await generatePDFFromHTML(htmlContent, `loan-simulation-${Date.now()}.pdf`);
};

export const generatePDFFromElement = async (
  elementId: string,
  filename: string = 'report.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
  const imgX = (pdfWidth - canvas.width * ratio) / 2;
  const imgY = 10;

  pdf.addImage(imgData, 'PNG', imgX, imgY, canvas.width * ratio, canvas.height * ratio);
  pdf.save(filename);
};
