import { describe, expect, it } from 'vitest';
import { terbilang } from '../src/core';

describe('terbilang', () => {
  it('handles zero and negative zero', () => {
    expect(terbilang(0)).toBe('nol');
    expect(terbilang(-0)).toBe('nol');
    expect(terbilang('0')).toBe('nol');
    expect(terbilang('-0')).toBe('nol');
    expect(terbilang('-0.00', { trimTrailingDecimalZeros: true })).toBe('nol');
  });

  it('converts units, teens (sepuluh/sebelas), and tens accurately', () => {
    expect(terbilang(1)).toBe('satu');
    expect(terbilang(9)).toBe('sembilan');
    expect(terbilang(10)).toBe('sepuluh');
    expect(terbilang(11)).toBe('sebelas');
    expect(terbilang(12)).toBe('dua belas');
    expect(terbilang(19)).toBe('sembilan belas');
    expect(terbilang(20)).toBe('dua puluh');
    expect(terbilang(21)).toBe('dua puluh satu');
    expect(terbilang(99)).toBe('sembilan puluh sembilan');
  });

  it('converts hundreds and applies seratus rule properly', () => {
    expect(terbilang(100)).toBe('seratus');
    expect(terbilang(101)).toBe('seratus satu');
    expect(terbilang(111)).toBe('seratus sebelas');
    expect(terbilang(199)).toBe('seratus sembilan puluh sembilan');
    expect(terbilang(200)).toBe('dua ratus');
    expect(terbilang(905)).toBe('sembilan ratus lima');
  });

  it('applies seribu vs satu ribu and besar scale rules per KBBI', () => {
    expect(terbilang(1000)).toBe('seribu');
    expect(terbilang(1001)).toBe('seribu satu');
    expect(terbilang(1999)).toBe('seribu sembilan ratus sembilan puluh sembilan');
    expect(terbilang(2000)).toBe('dua ribu');
    expect(terbilang(11000)).toBe('sebelas ribu');
    expect(terbilang(21000)).toBe('dua puluh satu ribu');
    expect(terbilang(101000)).toBe('seratus satu ribu');
    expect(terbilang(1000000)).toBe('satu juta');
    expect(terbilang(1001000)).toBe('satu juta seribu');
    expect(terbilang(1000000000)).toBe('satu miliar');
    expect(terbilang(1000000000000)).toBe('satu triliun');
  });

  it('supports bigint and large scales up to desiliun (36 digits)', () => {
    expect(terbilang(10n ** 15n)).toBe('satu kuadriliun');
    expect(terbilang(10n ** 18n)).toBe('satu kuintiliun');
    expect(terbilang(10n ** 21n)).toBe('satu sekstiliun');
    expect(terbilang(10n ** 24n)).toBe('satu septiliun');
    expect(terbilang(10n ** 27n)).toBe('satu oktiliun');
    expect(terbilang(10n ** 30n)).toBe('satu noniliun');
    expect(terbilang(10n ** 33n)).toBe('satu desiliun');
    expect(terbilang('1' + '0'.repeat(35))).toBe('seratus desiliun');
  });

  it('handles negative values and custom negativePrefix', () => {
    expect(terbilang(-1500)).toBe('minus seribu lima ratus');
    expect(terbilang(-1500, { negativePrefix: 'negatif' })).toBe(
      'negatif seribu lima ratus'
    );
  });

  it('reads decimals digit-by-digit and supports trailing zero trimming', () => {
    expect(terbilang(3.14)).toBe('tiga koma satu empat');
    expect(terbilang('12.05')).toBe('dua belas koma nol lima');
    expect(terbilang('12.50')).toBe('dua belas koma lima nol');
    expect(terbilang('.5')).toBe('nol koma lima');
    expect(terbilang('12.50', { trimTrailingDecimalZeros: true })).toBe(
      'dua belas koma lima'
    );
    expect(terbilang('12.00', { trimTrailingDecimalZeros: true })).toBe(
      'dua belas'
    );
    expect(terbilang('3.14', { decimalWord: 'titik' })).toBe(
      'tiga titik satu empat'
    );
  });

  it('applies style, prefix, and suffix options cleanly', () => {
    expect(
      terbilang(1500000, {
        style: 'title',
        prefix: 'Terbilang:',
        suffix: 'rupiah',
      })
    ).toBe('Terbilang: Satu Juta Lima Ratus Ribu Rupiah');
    expect(terbilang(25, { style: 'upper' })).toBe('DUA PULUH LIMA');
    expect(terbilang(25, { style: 'sentence' })).toBe('Dua puluh lima');
  });
});
