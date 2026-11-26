import { describe, expect, it } from 'vitest';
import { terbilangRupiah } from '../src/core';
import { TerbilangError } from '../src/errors';
import { parseRupiah } from '../src/parse-rupiah';

describe('parseRupiah', () => {
  it('parses standard formatted Rupiah strings into canonical numeric strings', () => {
    expect(parseRupiah('Rp 1.500.000,50')).toBe('1500000.50');
    expect(parseRupiah('Rp1.500.000')).toBe('1500000');
    expect(parseRupiah('IDR 2.500.000,75')).toBe('2500000.75');
    expect(parseRupiah('1.500.000')).toBe('1500000');
    expect(parseRupiah('1500000')).toBe('1500000');
    expect(parseRupiah('+Rp 500.000')).toBe('500000');
    expect(parseRupiah('Rp 001.500')).toBe('1500');
  });

  it('parses negative minus and accounting parentheses formats', () => {
    expect(parseRupiah('-Rp 500.000,25')).toBe('-500000.25');
    expect(parseRupiah('(Rp 500.000,25)')).toBe('-500000.25');
    expect(parseRupiah('(Rp 0,00)')).toBe('0.00');
    expect(parseRupiah('-Rp 0')).toBe('0');
  });

  it('composes seamlessly with terbilangRupiah', () => {
    expect(terbilangRupiah(parseRupiah('Rp 1.500.000,50'))).toBe(
      'satu juta lima ratus ribu rupiah lima puluh sen'
    );
  });

  it('throws INVALID_INPUT or OUT_OF_RANGE for invalid formatted strings', () => {
    const invalidInputs = [
      '',
      '   ',
      'Rp ',
      'Rp abc',
      'Rp 1.50.000',
      'Rp 1..000',
      'Rp 1.000,',
      'Rp 1,2,3',
      '(-Rp 500)',
      '(+Rp 500)',
      '(Rp 500',
    ];
    for (const bad of invalidInputs) {
      expect(() => parseRupiah(bad)).toThrowError(TerbilangError);
    }

    expect(() => parseRupiah(123 as never)).toThrowError(TerbilangError);

    try {
      parseRupiah('Rp ' + '1'.repeat(37));
      expect.unreachable('should throw OUT_OF_RANGE');
    } catch (err) {
      expect(err).toBeInstanceOf(TerbilangError);
      expect((err as TerbilangError).code).toBe('OUT_OF_RANGE');
    }
  });
});
