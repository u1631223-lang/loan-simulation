/**
 * 浄化槽補助金計算ユーティリティ
 * Septic Tank Subsidy Calculator
 */

import type {
  SubsidyCalculationParams,
  SubsidyCalculationResult,
  SubsidyBreakdownItem,
  SubsidyCategoryType,
} from '@/types/subsidy';
import { INAZAWA_SUBSIDY_DATA, SUBSIDY_CATEGORY_LABELS } from '@/types/subsidy';

/**
 * 人槽から補助金額を取得
 */
function getInstallationAmount(tankCapacity: number): number {
  if (tankCapacity <= 5) return 332000;
  if (tankCapacity <= 7) return 414000;
  if (tankCapacity <= 10) return 548000;
  // 10人槽超は個別対応（10人槽の金額をデフォルトとする）
  return 548000;
}

/**
 * 人槽のラベルを取得
 */
function getCapacityLabel(tankCapacity: number): string {
  if (tankCapacity <= 5) return '5人槽';
  if (tankCapacity <= 7) return '6〜7人槽';
  if (tankCapacity <= 10) return '8〜10人槽';
  return `${tankCapacity}人槽（要確認）`;
}

/**
 * 撤去タイプの補助金額を取得
 */
function getRemovalAmount(demolitionType?: string): number {
  if (demolitionType === 'cesspool') return 90000;
  // single_tank or default
  return 120000;
}

/**
 * 撤去タイプのラベルを取得
 */
function getRemovalLabel(demolitionType?: string): string {
  if (demolitionType === 'cesspool') return 'くみ取り便槽撤去';
  return '単独処理浄化槽撤去（解体）';
}

/**
 * 稲沢市の浄化槽補助金を計算
 *
 * @param params - 計算パラメータ
 * @returns 補助金計算結果
 */
export function calculateSubsidy(
  params: SubsidyCalculationParams
): SubsidyCalculationResult {
  const breakdown: SubsidyBreakdownItem[] = [];

  // 1. 浄化槽設置補助金
  const installationAmount = getInstallationAmount(params.tank_capacity);
  const installCategory: SubsidyCategoryType =
    params.conversion_type === 'conversion'
      ? 'septic_tank_conversion'
      : 'septic_tank_installation';

  breakdown.push({
    category: installCategory,
    label: `${SUBSIDY_CATEGORY_LABELS[installCategory]}（${getCapacityLabel(params.tank_capacity)}）`,
    amount: installationAmount,
    note: `${params.tank_capacity}人槽`,
  });

  // 2. 撤去（解体）補助金
  let removalAmount = 0;
  if (params.has_demolition) {
    removalAmount = getRemovalAmount(params.demolition_type);
    const removalCategory: SubsidyCategoryType =
      params.demolition_type === 'cesspool' ? 'cesspool_removal' : 'tank_removal';

    breakdown.push({
      category: removalCategory,
      label: getRemovalLabel(params.demolition_type),
      amount: removalAmount,
      note: params.demolition_type === 'cesspool'
        ? '上限 90,000円'
        : '上限 120,000円',
    });
  }

  // 3. 配管工事補助金
  let plumbingAmount = 0;
  if (params.has_plumbing) {
    plumbingAmount = 300000;
    breakdown.push({
      category: 'plumbing_work',
      label: SUBSIDY_CATEGORY_LABELS['plumbing_work'],
      amount: plumbingAmount,
      note: '上限 300,000円',
    });
  }

  const totalSubsidy = installationAmount + removalAmount + plumbingAmount;

  return {
    installation_subsidy: installationAmount,
    removal_subsidy: removalAmount,
    plumbing_subsidy: plumbingAmount,
    total_subsidy: totalSubsidy,
    breakdown,
  };
}

/**
 * 補助金額をフォーマット（円表示）
 */
export function formatSubsidyAmount(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * 補助金額をフォーマット（万円表示）
 */
export function formatSubsidyAmountMan(amount: number): string {
  const man = amount / 10000;
  if (Number.isInteger(man)) {
    return `${man}万円`;
  }
  return `${man.toFixed(1)}万円`;
}

/**
 * 稲沢市のデータからプログラム一覧を取得
 */
export function getInazawaPrograms() {
  return INAZAWA_SUBSIDY_DATA.programs;
}

/**
 * 稲沢市の必要書類リストを取得
 * @param includeDemolition - 解体書類を含むか
 */
export function getInazawaRequiredDocuments(includeDemolition: boolean = false) {
  const docs = [...INAZAWA_SUBSIDY_DATA.required_documents];
  if (includeDemolition) {
    docs.push(...INAZAWA_SUBSIDY_DATA.demolition_documents);
  }
  return docs.sort((a, b) => a.order - b.order);
}
