import { describe, expect, it } from 'vitest';
import { terbilangRupiah } from '../src/core';
import { TerbilangError } from '../src/errors';

describe('terbilangRupiah', () => {
  it('converts integer rupiah values including zero', () => {
    expect(terbilangRupiah(0)).toBe('nol rupiah');
    expect(terbilangRupiah(-0)).toBe('nol rupiah');
    expect(terbilangRupiah(1000)).toBe('seribu rupiah');
    expect(terbilangRupiah(1500000)).toBe('satu juta lima ratus ribu rupiah');
  });

  it('handles sen correctly for 1-digit, 2-digit, and zero-sen decimals', () => {
    expect(terbilangRupiah(1250.5)).toBe(
      'seribu dua ratus lima puluh rupiah lima puluh sen'
    );
    expect(terbilangRupiah('1250.05')).toBe(
      'seribu dua ratus lima puluh rupiah lima sen'
    );
    expect(terbilangRupiah('1250.00')).toBe('seribu dua ratus lima puluh rupiah');
    expect(terbilangRupiah('0.50')).toBe('nol rupiah lima puluh sen');
  });

  it('rounds >2 decimal digits exactly with half-up and truncate modes', () => {
    expect(terbilangRupiah('1250.567')).toBe(
      'seribu dua ratus lima puluh rupiah lima puluh tujuh sen'
    );
    expect(terbilangRupiah('1250.996')).toBe(
      'seribu dua ratus lima puluh satu rupiah'
    );
    expect(terbilangRupiah('1250.996', { rounding: 'truncate' })).toBe(
      'seribu dua ratus lima puluh rupiah sembilan puluh sembilan sen'
    );
  });

  it('normalizes negative values that round to zero', () => {
    expect(terbilangRupiah('-0.001')).toBe('nol rupiah');
    expect(terbilangRupiah(-1500.5)).toBe(
      'minus seribu lima ratus rupiah lima puluh sen'
    );
    expect(
      terbilangRupiah(-1500, { negativePrefix: 'negatif', style: 'sentence' })
    ).toBe('Negatif seribu lima ratus rupiah');
  });

  it('supports includeSen: false and custom currency/sen units and styles', () => {
    expect(terbilangRupiah(1250.6, { includeSen: false })).toBe(
      'seribu dua ratus lima puluh satu rupiah'
    );
    expect(terbilangRupiah(1250.6, { includeSen: false, rounding: 'truncate' })).toBe(
      'seribu dua ratus lima puluh rupiah'
    );
    expect(
      terbilangRupiah('2500.25', {
        style: 'title',
        currencyUnit: 'IDR',
        senUnit: 'Sen',
        prefix: 'Jumlah:',
        suffix: 'sah',
      })
    ).toBe('Jumlah: Dua Ribu Lima Ratus Idr Dua Puluh Lima Sen Sah');
  });

  it('throws OUT_OF_RANGE when rounding pushes 36 digits to 37 digits', () => {
    const max36 = '9'.repeat(36) + '.999';
    expect(() => terbilangRupiah(max36)).toThrowError(TerbilangError);
    try {
      terbilangRupiah(max36);
    } catch (err) {
      expect((err as TerbilangError).code).toBe('OUT_OF_RANGE');
    }
  });
});
