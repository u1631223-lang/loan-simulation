/**
 * AI Advice Parser Tests
 *
 * Tests for parseAIAdvice, validateAIAdvice, and error formatting
 */

import { describe, it, expect } from 'vitest';
import {
  parseAIAdvice,
  isAIAdviceError,
  formatAIAdviceError,
  createMockAIAdvice,
} from '@/utils/aiAdviceParser';
import type { RiskLevel } from '@/types/aiAdvice';

describe('parseAIAdvice', () => {
  it('should parse valid JSON with markdown code block', () => {
    const response = `
\`\`\`json
{
  "riskLevel": "medium",
  "analysis": "This is a test analysis with more than 50 characters to satisfy validation requirements.",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "warnings": ["Warning 1"]
}
\`\`\`
    `;

    const result = parseAIAdvice(response);
    expect(isAIAdviceError(result)).toBe(false);

    if (!isAIAdviceError(result)) {
      expect(result.riskLevel).toBe('medium');
      expect(result.analysis).toContain('test analysis');
      expect(result.recommendations).toHaveLength(2);
      expect(result.warnings).toHaveLength(1);
      expect(result.generatedAt).toBeDefined();
    }
  });

  it('should parse valid JSON without code block', () => {
    const response = `
{
  "riskLevel": "low",
  "analysis": "Another test analysis that has enough characters to pass validation checks.",
  "recommendations": ["Test recommendation"],
  "warnings": []
}
    `;

    const result = parseAIAdvice(response);
    expect(isAIAdviceError(result)).toBe(false);

    if (!isAIAdviceError(result)) {
      expect(result.riskLevel).toBe('low');
      expect(result.warnings).toHaveLength(0);
    }
  });

  it('should handle high risk level', () => {
    const response = JSON.stringify({
      riskLevel: 'high',
      analysis: 'This loan carries significant risks that need immediate attention and careful consideration.',
      recommendations: ['Reduce loan amount', 'Extend repayment period'],
      warnings: ['High debt ratio', 'Limited savings'],
    });

    const result = parseAIAdvice(response);
    expect(isAIAdviceError(result)).toBe(false);

    if (!isAIAdviceError(result)) {
      expect(result.riskLevel).toBe('high');
      expect(result.warnings.length).toBeGreaterThan(0);
    }
  });

  it('should return error for invalid JSON', () => {
    const response = 'This is not JSON';
    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('parse_error');
      expect(result.message).toContain('JSON');
    }
  });

  it('should return error for missing required field', () => {
    const response = JSON.stringify({
      riskLevel: 'medium',
      // Missing 'analysis'
      recommendations: ['Test'],
      warnings: [],
    });

    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('validation_error');
      expect(result.message).toContain('analysis');
    }
  });

  it('should return error for invalid risk level', () => {
    const response = JSON.stringify({
      riskLevel: 'invalid',
      analysis: 'Test analysis with enough characters to pass the minimum length requirement.',
      recommendations: ['Test'],
      warnings: [],
    });

    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('validation_error');
      expect(result.message).toContain('riskLevel');
    }
  });

  it('should return error for analysis too short', () => {
    const response = JSON.stringify({
      riskLevel: 'low',
      analysis: 'Too short',
      recommendations: ['Test'],
      warnings: [],
    });

    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('validation_error');
      expect(result.message).toContain('50文字');
    }
  });

  it('should return error for empty recommendations', () => {
    const response = JSON.stringify({
      riskLevel: 'low',
      analysis: 'This is a valid analysis with sufficient length to pass validation requirements.',
      recommendations: [],
      warnings: [],
    });

    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('validation_error');
      expect(result.message).toContain('recommendations');
    }
  });

  it('should return error for non-array recommendations', () => {
    const response = JSON.stringify({
      riskLevel: 'low',
      analysis: 'Valid analysis text that meets the minimum character length requirement for testing purposes.',
      recommendations: 'Not an array',
      warnings: [],
    });

    const result = parseAIAdvice(response);

    expect(isAIAdviceError(result)).toBe(true);

    if (isAIAdviceError(result)) {
      expect(result.type).toBe('validation_error');
    }
  });
});

describe('formatAIAdviceError', () => {
  it('should format parse error', () => {
    const error = {
      type: 'parse_error' as const,
      message: 'Test parse error',
    };

    const formatted = formatAIAdviceError(error);
    expect(formatted).toContain('解析に失敗');
    expect(formatted).toContain('Test parse error');
  });

  it('should format validation error', () => {
    const error = {
      type: 'validation_error' as const,
      message: 'Test validation error',
    };

    const formatted = formatAIAdviceError(error);
    expect(formatted).toContain('検証に失敗');
    expect(formatted).toContain('Test validation error');
  });

  it('should format API error', () => {
    const error = {
      type: 'api_error' as const,
      message: 'Test API error',
    };

    const formatted = formatAIAdviceError(error);
    expect(formatted).toContain('APIエラー');
    expect(formatted).toContain('Test API error');
  });

  it('should format network error', () => {
    const error = {
      type: 'network_error' as const,
      message: 'Test network error',
    };

    const formatted = formatAIAdviceError(error);
    expect(formatted).toContain('ネットワークエラー');
    expect(formatted).toContain('Test network error');
  });
});

describe('createMockAIAdvice', () => {
  it('should create mock advice with default risk level', () => {
    const mock = createMockAIAdvice();

    expect(mock.riskLevel).toBe('medium');
    expect(mock.analysis).toBeDefined();
    expect(mock.recommendations.length).toBeGreaterThan(0);
    expect(mock.warnings.length).toBeGreaterThan(0);
    expect(mock.generatedAt).toBeDefined();
  });

  it('should create mock advice with custom risk level', () => {
    const riskLevels: RiskLevel[] = ['low', 'medium', 'high'];

    riskLevels.forEach((level) => {
      const mock = createMockAIAdvice(level);
      expect(mock.riskLevel).toBe(level);
    });
  });

  it('should generate valid ISO date', () => {
    const mock = createMockAIAdvice();
    const date = new Date(mock.generatedAt);

    expect(date.toString()).not.toBe('Invalid Date');
  });
});

describe('isAIAdviceError', () => {
  it('should return true for error objects', () => {
    const error = {
      type: 'api_error' as const,
      message: 'Test error',
    };

    expect(isAIAdviceError(error)).toBe(true);
  });

  it('should return false for advice objects', () => {
    const advice = {
      riskLevel: 'low' as const,
      analysis: 'Test analysis',
      recommendations: ['Test'],
      warnings: [],
      generatedAt: new Date().toISOString(),
    };

    expect(isAIAdviceError(advice)).toBe(false);
  });
});
