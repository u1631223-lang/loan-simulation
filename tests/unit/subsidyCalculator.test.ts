/**
 * 浄化槽補助金計算のテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSubsidy,
  formatSubsidyAmount,
  formatSubsidyAmountMan,
  getInazawaRequiredDocuments,
} from '../../src/utils/subsidyCalculator';

describe('浄化槽補助金計算', () => {
  describe('calculateSubsidy', () => {
    it('5人槽・新規設置のみの場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 5,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'new',
      });

      expect(result.installation_subsidy).toBe(332000);
      expect(result.removal_subsidy).toBe(0);
      expect(result.plumbing_subsidy).toBe(0);
      expect(result.total_subsidy).toBe(332000);
      expect(result.breakdown).toHaveLength(1);
    });

    it('7人槽・転換の場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 7,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'conversion',
      });

      expect(result.installation_subsidy).toBe(414000);
      expect(result.total_subsidy).toBe(414000);
      expect(result.breakdown[0].category).toBe('septic_tank_conversion');
    });

    it('10人槽の場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 10,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'new',
      });

      expect(result.installation_subsidy).toBe(548000);
      expect(result.total_subsidy).toBe(548000);
    });

    it('6人槽は6〜7人槽の金額（414,000円）', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 6,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'new',
      });

      expect(result.installation_subsidy).toBe(414000);
    });

    it('8人槽は8〜10人槽の金額（548,000円）', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 8,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'new',
      });

      expect(result.installation_subsidy).toBe(548000);
    });

    it('単独処理浄化槽撤去（解体）ありの場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 5,
        has_demolition: true,
        demolition_type: 'single_tank',
        has_plumbing: false,
        conversion_type: 'conversion',
      });

      expect(result.installation_subsidy).toBe(332000);
      expect(result.removal_subsidy).toBe(120000);
      expect(result.total_subsidy).toBe(452000);
      expect(result.breakdown).toHaveLength(2);
    });

    it('くみ取り便槽撤去の場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 5,
        has_demolition: true,
        demolition_type: 'cesspool',
        has_plumbing: false,
        conversion_type: 'conversion',
      });

      expect(result.removal_subsidy).toBe(90000);
      expect(result.total_subsidy).toBe(422000); // 332000 + 90000
    });

    it('配管工事ありの場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 7,
        has_demolition: false,
        has_plumbing: true,
        conversion_type: 'new',
      });

      expect(result.plumbing_subsidy).toBe(300000);
      expect(result.total_subsidy).toBe(714000); // 414000 + 300000
    });

    it('全部入り（7人槽・転換・解体・配管工事）の場合', () => {
      const result = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 7,
        has_demolition: true,
        demolition_type: 'single_tank',
        has_plumbing: true,
        conversion_type: 'conversion',
      });

      expect(result.installation_subsidy).toBe(414000);
      expect(result.removal_subsidy).toBe(120000);
      expect(result.plumbing_subsidy).toBe(300000);
      expect(result.total_subsidy).toBe(834000); // 414000 + 120000 + 300000
      expect(result.breakdown).toHaveLength(3);
    });

    it('梅村様のケース（解体忘れ→追加）', () => {
      // 解体なしの場合
      const withoutDemolition = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 5,
        has_demolition: false,
        has_plumbing: false,
        conversion_type: 'conversion',
      });

      // 解体ありの場合
      const withDemolition = calculateSubsidy({
        municipality_id: '',
        tank_capacity: 5,
        has_demolition: true,
        demolition_type: 'single_tank',
        has_plumbing: false,
        conversion_type: 'conversion',
      });

      // 解体を追加すると12万円多く受け取れる
      expect(withDemolition.total_subsidy - withoutDemolition.total_subsidy).toBe(120000);
    });
  });

  describe('formatSubsidyAmount', () => {
    it('円表示のフォーマット', () => {
      expect(formatSubsidyAmount(332000)).toBe('¥332,000');
      expect(formatSubsidyAmount(120000)).toBe('¥120,000');
      expect(formatSubsidyAmount(0)).toBe('¥0');
    });
  });

  describe('formatSubsidyAmountMan', () => {
    it('万円表示のフォーマット', () => {
      expect(formatSubsidyAmountMan(330000)).toBe('33万円');
      expect(formatSubsidyAmountMan(120000)).toBe('12万円');
      expect(formatSubsidyAmountMan(332000)).toBe('33.2万円');
    });
  });

  describe('getInazawaRequiredDocuments', () => {
    it('基本書類のみ（13件）', () => {
      const docs = getInazawaRequiredDocuments(false);
      expect(docs).toHaveLength(13);
      expect(docs[0].order).toBe(1);
      expect(docs[0].name).toContain('浄化槽設置届出書');
    });

    it('解体書類を含む場合（16件）', () => {
      const docs = getInazawaRequiredDocuments(true);
      expect(docs).toHaveLength(16);
      // 解体関連書類が含まれている
      const demolitionDocs = docs.filter((d) => d.order >= 14);
      expect(demolitionDocs).toHaveLength(3);
      expect(demolitionDocs[0].name).toContain('撤去');
    });

    it('書類は番号順にソートされている', () => {
      const docs = getInazawaRequiredDocuments(true);
      for (let i = 1; i < docs.length; i++) {
        expect(docs[i].order).toBeGreaterThanOrEqual(docs[i - 1].order);
      }
    });

    it('条件付き書類が正しくマークされている', () => {
      const docs = getInazawaRequiredDocuments(false);
      const conditionalDocs = docs.filter((d) => d.is_conditional);
      expect(conditionalDocs.length).toBeGreaterThan(0);
      // 賃貸人の承諾書は条件付き
      const rentalDoc = docs.find((d) => d.name.includes('賃貸人'));
      expect(rentalDoc?.is_conditional).toBe(true);
      expect(rentalDoc?.condition_note).toContain('借りている場合');
    });
  });
});
