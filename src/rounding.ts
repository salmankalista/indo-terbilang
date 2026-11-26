import { TerbilangError } from './errors';
import type { RoundingMode } from './types';

/**
 * Membulatkan angka desimal secara eksak berbasis string tanpa floating-point arithmetic.
 */
export function roundDecimal(
  integer: string,
  fraction: string,
  decimals: number,
  mode: RoundingMode
): { integer: string; fraction: string } {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new TerbilangError('INVALID_INPUT', 'Desimal pembulatan tidak valid.');
  }

  if (fraction.length === decimals) {
    return { integer, fraction };
  }

  if (fraction.length < decimals) {
    return { integer, fraction: fraction.padEnd(decimals, '0') };
  }

  const keptFraction = fraction.slice(0, decimals);
  const nextDigit = fraction.charCodeAt(decimals) - 48;

  if (mode === 'truncate' || nextDigit < 5) {
    return { integer, fraction: keptFraction };
  }

  const digits = (integer + keptFraction).split('');
  let carry = 1;

  for (let i = digits.length - 1; i >= 0 && carry > 0; i--) {
    const sum = Number(digits[i]) + carry;
    if (sum >= 10) {
      digits[i] = String(sum - 10);
    } else {
      digits[i] = String(sum);
      carry = 0;
    }
  }

  if (carry > 0) {
    digits.unshift('1');
  }

  const merged = digits.join('');
  if (decimals === 0) {
    return { integer: merged, fraction: '' };
  }

  const splitIdx = merged.length - decimals;
  return {
    integer: merged.slice(0, splitIdx),
    fraction: merged.slice(splitIdx),
  };
}
