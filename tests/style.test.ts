import { describe, expect, it } from 'vitest';
import { TerbilangError } from '../src/errors';
import { applyStyleAndAffixes } from '../src/style';

describe('applyStyleAndAffixes', () => {
  it('applies lower, upper, title, and sentence styles accurately', () => {
    const sample = 'satu juta dua ratus ribu';
    expect(applyStyleAndAffixes(sample, {})).toBe('satu juta dua ratus ribu');
    expect(applyStyleAndAffixes(sample, { style: 'lower' })).toBe(
      'satu juta dua ratus ribu'
    );
    expect(applyStyleAndAffixes(sample, { style: 'upper' })).toBe(
      'SATU JUTA DUA RATUS RIBU'
    );
    expect(applyStyleAndAffixes(sample, { style: 'title' })).toBe(
      'Satu Juta Dua Ratus Ribu'
    );
    expect(applyStyleAndAffixes(sample, { style: 'sentence' })).toBe(
      'Satu juta dua ratus ribu'
    );
  });

  it('trims and joins prefix and suffix while ignoring blank affixes', () => {
    expect(
      applyStyleAndAffixes('seribu', {
        style: 'title',
        prefix: '  sejumlah  ',
        suffix: '  rupiah  ',
      })
    ).toBe('Sejumlah Seribu Rupiah');

    expect(
      applyStyleAndAffixes('seribu', {
        style: 'lower',
        prefix: '   ',
        suffix: '',
      })
    ).toBe('seribu');
  });

  it('throws INVALID_INPUT when an unsupported style is passed at runtime', () => {
    expect(() =>
      applyStyleAndAffixes('seribu', { style: 'camel' as never })
    ).toThrowError(TerbilangError);
  });
});
