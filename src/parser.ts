import { MAX_EXPONENT_ABS, ZERO_ONLY_PATTERN } from './constants';
import { assertMaxDigits, TerbilangError } from './errors';
import type { NumericInput, ParsedDecimal } from './types';

const DECIMAL_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)$/;
const EXPONENT_PATTERN = /^[+-]?\d+$/;

function normalizeDecimalSeparator(raw: string): string {
  if (raw.includes('.') && raw.includes(',')) {
    throw new TerbilangError('INVALID_INPUT', 'Pemisah titik dan koma bercampur.');
  }
  const normalized = raw.includes(',') ? raw.replace(/,/g, '.') : raw;
  if (!DECIMAL_PATTERN.test(normalized)) {
    throw new TerbilangError('INVALID_INPUT', `Format angka tidak valid: "${raw}".`);
  }
  return normalized;
}

function expandScientific(
  mantissa: string,
  exp: number
): { integer: string; fraction: string } {
  const dotIdx = mantissa.indexOf('.');
  const intPart = dotIdx === -1 ? mantissa : mantissa.slice(0, dotIdx);
  const fracPart = dotIdx === -1 ? '' : mantissa.slice(dotIdx + 1);
  const digits = intPart + fracPart;
  const newDotPos = intPart.length + exp;

  if (newDotPos <= 0) {
    return { integer: '0', fraction: '0'.repeat(-newDotPos) + digits };
  }
  if (newDotPos >= digits.length) {
    return {
      integer: digits + '0'.repeat(newDotPos - digits.length),
      fraction: '',
    };
  }
  return {
    integer: digits.slice(0, newDotPos),
    fraction: digits.slice(newDotPos),
  };
}

function splitStandardDecimal(normalized: string): {
  integer: string;
  fraction: string;
} {
  const dotIdx = normalized.indexOf('.');
  if (dotIdx === -1) {
    return { integer: normalized, fraction: '' };
  }
  const intPart = normalized.slice(0, dotIdx);
  return {
    integer: intPart === '' ? '0' : intPart,
    fraction: normalized.slice(dotIdx + 1),
  };
}

/**
 * Memvalidasi dan menormalisasi input `number | bigint | string` menjadi struktur desimal berbasis string.
 */
export function parseNumericInput(input: NumericInput): ParsedDecimal {
  let raw: string;

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new TerbilangError('NON_FINITE_NUMBER', 'Angka harus finite.');
    }
    if (input === 0) {
      return { isNegative: false, integer: '0', fraction: '' };
    }
    raw = String(input);
  } else if (typeof input === 'bigint') {
    const isNegative = input < 0n;
    const integer = (isNegative ? -input : input).toString();
    assertMaxDigits(integer);
    return { isNegative, integer, fraction: '' };
  } else if (typeof input === 'string') {
    raw = input.trim();
    if (raw === '') {
      throw new TerbilangError('INVALID_INPUT', 'Input kosong.');
    }
  } else {
    throw new TerbilangError('INVALID_INPUT', 'Tipe input tidak didukung.');
  }

  let isNegative = false;
  let body = raw;
  if (body.startsWith('-')) {
    isNegative = true;
    body = body.slice(1);
  } else if (body.startsWith('+')) {
    body = body.slice(1);
  }

  let integer: string;
  let fraction: string;
  const eIndex = body.search(/[eE]/);

  if (eIndex !== -1) {
    const mantissa = normalizeDecimalSeparator(body.slice(0, eIndex));
    const expRaw = body.slice(eIndex + 1);
    if (!EXPONENT_PATTERN.test(expRaw)) {
      throw new TerbilangError('INVALID_INPUT', 'Eksponen tidak valid.');
    }
    const exp = Number(expRaw);
    if (Math.abs(exp) > MAX_EXPONENT_ABS) {
      throw new TerbilangError('OUT_OF_RANGE', 'Eksponen melebihi batas.');
    }
    ({ integer, fraction } = expandScientific(mantissa, exp));
  } else {
    ({ integer, fraction } = splitStandardDecimal(
      normalizeDecimalSeparator(body)
    ));
  }

  const trimmedInteger = integer.replace(/^0+/, '') || '0';
  assertMaxDigits(trimmedInteger);

  const isZero = trimmedInteger === '0' && ZERO_ONLY_PATTERN.test(fraction);
  return {
    isNegative: isZero ? false : isNegative,
    integer: trimmedInteger,
    fraction,
  };
}
