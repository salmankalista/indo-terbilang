import { describe, expect, it } from 'vitest';
import { TerbilangError } from '../src/errors';
import { formatRupiah } from '../src/format-rupiah';

describe('formatRupiah', () => {
  it('formats standard Rupiah deterministically with default options', () => {
    expect(formatRupiah(0)).toBe('Rp 0,00');
    expect(formatRupiah(-0)).toBe('Rp 0,00');
    expect(formatRupiah(500)).toBe('Rp 500,00');
    expect(formatRupiah(1500000)).toBe('Rp 1.500.000,00');
    expect(formatRupiah('1250.567')).toBe('Rp 1.250,57');
    expect(formatRupiah(1234567890123456789012345n)).toBe(
      'Rp 1.234.567.890.123.456.789.012.345,00'
    );
  });

  it('supports decimals: 0, auto, and custom separators/symbols', () => {
    expect(formatRupiah(1500000, { decimals: 0 })).toBe('Rp 1.500.000');
    expect(formatRupiah(1500000, { decimals: 'auto' })).toBe('Rp 1.500.000');
    expect(formatRupiah('1500.50', { decimals: 'auto' })).toBe('Rp 1.500,5');
    expect(
      formatRupiah(1500.25, {
        symbol: 'IDR',
        spaceAfterSymbol: false,
        thousandsSeparator: ',',
        decimalSeparator: '.',
      })
    ).toBe('IDR1,500.25');
    expect(formatRupiah(1500, { symbol: '', thousandsSeparator: '' })).toBe(
      '1500,00'
    );
  });

  it('handles negative values and normalizes -0.001 rounded to zero', () => {
    expect(formatRupiah(-1500000)).toBe('-Rp 1.500.000,00');
    expect(formatRupiah(-1500000, { negativeFormat: 'parentheses' })).toBe(
      '(Rp 1.500.000,00)'
    );
    expect(formatRupiah('-0.001')).toBe('Rp 0,00');
    expect(formatRupiah('-0.001', { negativeFormat: 'parentheses' })).toBe(
      'Rp 0,00'
    );
  });

  it('formats compact Indonesian currency notation accurately', () => {
    expect(formatRupiah(500, { compact: true })).toBe('Rp 500');
    expect(formatRupiah('500.5', { compact: true })).toBe('Rp 500,5');
    expect(formatRupiah('-0.01', { compact: true })).toBe('Rp 0');
    expect(formatRupiah(1500, { compact: true })).toBe('Rp 1,5 rb');
    expect(formatRupiah(1500000, { compact: true })).toBe('Rp 1,5 jt');
    expect(formatRupiah(2300000000, { compact: true })).toBe('Rp 2,3 M');
    expect(formatRupiah('1250000000000', { compact: true, compactDecimals: 2 })).toBe(
      'Rp 1,25 T'
    );
    expect(formatRupiah('1500000000000000', { compact: true })).toBe(
      'Rp 1.500 T'
    );
    expect(formatRupiah(-2500000, { compact: true })).toBe('-Rp 2,5 jt');
  });

  it('promotes scale cleanly when compact rounding overflows 1000', () => {
    expect(formatRupiah('999.96', { compact: true, compactDecimals: 1 })).toBe(
      'Rp 1 rb'
    );
    expect(formatRupiah(999990, { compact: true, compactDecimals: 1 })).toBe(
      'Rp 1 jt'
    );
  });

  it('throws INVALID_INPUT for invalid decimals or compactDecimals options', () => {
    for (const bad of [-1, 21, 1.5]) {
      expect(() => formatRupiah(1000, { decimals: bad })).toThrowError(
        TerbilangError
      );
    }
    for (const bad of [-1, 7, 1.5]) {
      expect(() =>
        formatRupiah(1000, { compact: true, compactDecimals: bad })
      ).toThrowError(TerbilangError);
    }
  });
});
