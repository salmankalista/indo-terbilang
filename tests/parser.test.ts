import { describe, expect, it } from 'vitest';
import { TerbilangError } from '../src/errors';
import { parseNumericInput } from '../src/parser';

describe('parseNumericInput', () => {
  describe('number inputs', () => {
    it('parses zero and negative zero cleanly', () => {
      expect(parseNumericInput(0)).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '',
      });
      expect(parseNumericInput(-0)).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '',
      });
    });

    it('parses integers and decimals', () => {
      expect(parseNumericInput(1500)).toEqual({
        isNegative: false,
        integer: '1500',
        fraction: '',
      });
      expect(parseNumericInput(-1250.75)).toEqual({
        isNegative: true,
        integer: '1250',
        fraction: '75',
      });
    });

    it('expands JS scientific notation for very large and very small numbers', () => {
      expect(parseNumericInput(1e21)).toEqual({
        isNegative: false,
        integer: '1' + '0'.repeat(21),
        fraction: '',
      });
      expect(parseNumericInput(1e-7)).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '0000001',
      });
    });

    it('throws NON_FINITE_NUMBER for NaN and Infinity', () => {
      for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
        expect(() => parseNumericInput(bad)).toThrowError(TerbilangError);
        try {
          parseNumericInput(bad);
        } catch (err) {
          expect(err).toBeInstanceOf(TerbilangError);
          expect((err as TerbilangError).code).toBe('NON_FINITE_NUMBER');
        }
      }
    });
  });

  describe('bigint inputs', () => {
    it('parses positive, negative, zero, and 36-digit bigint values', () => {
      expect(parseNumericInput(0n)).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '',
      });
      expect(parseNumericInput(-9007199254740993n)).toEqual({
        isNegative: true,
        integer: '9007199254740993',
        fraction: '',
      });
      expect(parseNumericInput(10n ** 35n)).toEqual({
        isNegative: false,
        integer: '1' + '0'.repeat(35),
        fraction: '',
      });
    });

    it('throws OUT_OF_RANGE for bigint exceeding 36 digits', () => {
      expect(() => parseNumericInput(10n ** 36n)).toThrowError(TerbilangError);
      try {
        parseNumericInput(10n ** 36n);
      } catch (err) {
        expect((err as TerbilangError).code).toBe('OUT_OF_RANGE');
      }
    });
  });

  describe('string inputs', () => {
    it('handles whitespace, signs, leading zeros, and both dot/comma decimals', () => {
      expect(parseNumericInput('  +0001500  ')).toEqual({
        isNegative: false,
        integer: '1500',
        fraction: '',
      });
      expect(parseNumericInput('-1250,05')).toEqual({
        isNegative: true,
        integer: '1250',
        fraction: '05',
      });
      expect(parseNumericInput('.5')).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '5',
      });
      expect(parseNumericInput(',25')).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '25',
      });
      expect(parseNumericInput('-0.00')).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '00',
      });
    });

    it('expands valid scientific notation strings', () => {
      expect(parseNumericInput('1.5e6')).toEqual({
        isNegative: false,
        integer: '1500000',
        fraction: '',
      });
      expect(parseNumericInput('1,5E-2')).toEqual({
        isNegative: false,
        integer: '0',
        fraction: '015',
      });
      expect(parseNumericInput('12.34e-1')).toEqual({
        isNegative: false,
        integer: '1',
        fraction: '234',
      });
      expect(parseNumericInput('.5e3')).toEqual({
        isNegative: false,
        integer: '500',
        fraction: '',
      });
    });

    it('throws INVALID_INPUT for empty, malformed, mixed-separator, or non-numeric strings', () => {
      const invalidInputs = [
        '',
        '   ',
        '-',
        '+',
        '--5',
        'abc',
        '12.',
        '1.500.000',
        '1,500,000',
        '1.500,00',
        '1.5e',
        '1e2e3',
        '1eabc',
      ];
      for (const bad of invalidInputs) {
        expect(() => parseNumericInput(bad)).toThrowError(TerbilangError);
        try {
          parseNumericInput(bad);
        } catch (err) {
          expect((err as TerbilangError).code).toBe('INVALID_INPUT');
        }
      }
    });

    it('throws OUT_OF_RANGE for >36 integer digits or extreme exponents', () => {
      for (const bad of ['1' + '0'.repeat(36), '1e101', '1e-101']) {
        expect(() => parseNumericInput(bad)).toThrowError(TerbilangError);
        try {
          parseNumericInput(bad);
        } catch (err) {
          expect((err as TerbilangError).code).toBe('OUT_OF_RANGE');
        }
      }
    });
  });

  describe('non-supported runtime types', () => {
    it('throws INVALID_INPUT for null, undefined, boolean, and object', () => {
      for (const bad of [null, undefined, true, {}]) {
        expect(() => parseNumericInput(bad as never)).toThrowError(TerbilangError);
      }
    });
  });
});
