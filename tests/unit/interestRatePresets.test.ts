import { describe, it, expect } from 'vitest';
import { PRESET_RATES, roundRate } from '../../src/components/Input/InterestRatePresets';

describe('InterestRatePresets', () => {
  describe('PRESET_RATES', () => {
    it('should contain exactly the specified preset values', () => {
      expect(PRESET_RATES).toEqual([0.625, 0.700, 0.780, 0.800, 0.850, 0.880, 0.900]);
    });

    it('should have 7 preset values', () => {
      expect(PRESET_RATES).toHaveLength(7);
    });
  });

  describe('roundRate', () => {
    it('should round to 3 decimal places', () => {
      expect(roundRate(0.8001)).toBe(0.800);
      expect(roundRate(1.0499)).toBe(1.050);
      expect(roundRate(0.12345)).toBe(0.123);
    });
  });

  describe('+0.25 addition', () => {
    it('0.800 + 0.25 = 1.050', () => {
      expect(roundRate(0.800 + 0.25)).toBe(1.050);
    });

    it('0.780 + 0.25 = 1.030', () => {
      expect(roundRate(0.780 + 0.25)).toBe(1.030);
    });

    it('0.880 + 0.25 = 1.130', () => {
      expect(roundRate(0.880 + 0.25)).toBe(1.130);
    });

    it('should not apply additional rounding to snap to 0 or 5', () => {
      // 0.625 + 0.25 = 0.875 (not rounded to 0.880 or 0.900)
      expect(roundRate(0.625 + 0.25)).toBe(0.875);
    });
  });

  describe('highlight logic (exact match only)', () => {
    it('should match when current rate exactly equals a preset', () => {
      const currentRate = 0.800;
      const match = PRESET_RATES.find((r) => r === roundRate(currentRate));
      expect(match).toBe(0.800);
    });

    it('should NOT match 0.805 to any preset', () => {
      const currentRate = 0.805;
      const match = PRESET_RATES.find((r) => r === roundRate(currentRate));
      expect(match).toBeUndefined();
    });

    it('should NOT match 0.801 to 0.800 preset', () => {
      const currentRate = 0.801;
      const match = PRESET_RATES.find((r) => r === roundRate(currentRate));
      expect(match).toBeUndefined();
    });

    it('should match 0.625 exactly', () => {
      const currentRate = 0.625;
      const match = PRESET_RATES.find((r) => r === roundRate(currentRate));
      expect(match).toBe(0.625);
    });
  });
});
