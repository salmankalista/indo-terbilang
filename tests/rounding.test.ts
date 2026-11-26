import { describe, expect, it } from 'vitest';
import { TerbilangError } from '../src/errors';
import { roundDecimal } from '../src/rounding';

describe('roundDecimal', () => {
  it('returns identical values when fraction length equals target decimals', () => {
    expect(roundDecimal('1500', '50', 2, 'half-up')).toEqual({
      integer: '1500',
      fraction: '50',
    });
  });

  it('pads zeros on the right when fraction is shorter than target decimals', () => {
    expect(roundDecimal('1500', '5', 2, 'half-up')).toEqual({
      integer: '1500',
      fraction: '50',
    });
    expect(roundDecimal('1500', '', 2, 'truncate')).toEqual({
      integer: '1500',
      fraction: '00',
    });
  });

  it('rounds half-up properly without carry and with multi-digit carry', () => {
    expect(roundDecimal('1250', '234', 2, 'half-up')).toEqual({
      integer: '1250',
      fraction: '23',
    });
    expect(roundDecimal('1250', '235', 2, 'half-up')).toEqual({
      integer: '1250',
      fraction: '24',
    });
    expect(roundDecimal('1250', '996', 2, 'half-up')).toEqual({
      integer: '1251',
      fraction: '00',
    });
    expect(roundDecimal('999', '995', 2, 'half-up')).toEqual({
      integer: '1000',
      fraction: '00',
    });
  });

  it('handles 0 target decimals with and without carry', () => {
    expect(roundDecimal('9', '4', 0, 'half-up')).toEqual({
      integer: '9',
      fraction: '',
    });
    expect(roundDecimal('9', '5', 0, 'half-up')).toEqual({
      integer: '10',
      fraction: '',
    });
  });

  it('truncates without rounding up when mode is truncate', () => {
    expect(roundDecimal('1250', '999', 2, 'truncate')).toEqual({
      integer: '1250',
      fraction: '99',
    });
    expect(roundDecimal('999', '9', 0, 'truncate')).toEqual({
      integer: '999',
      fraction: '',
    });
  });

  it('maintains full precision on 30+ digit strings', () => {
    const bigIntStr = '9'.repeat(30);
    expect(roundDecimal(bigIntStr, '995', 2, 'half-up')).toEqual({
      integer: '1' + '0'.repeat(30),
      fraction: '00',
    });
  });

  it('throws INVALID_INPUT when decimals is negative or non-integer', () => {
    for (const bad of [-1, 1.5, Number.NaN]) {
      expect(() => roundDecimal('10', '5', bad, 'half-up')).toThrowError(
        TerbilangError
      );
    }
  });
});
