import { ZERO_ONLY_PATTERN } from './constants';
import { assertMaxDigits, TerbilangError } from './errors';

const CURRENCY_PREFIX_PATTERN = /^(?:rp|idr)\s*/i;
const GROUPED_THOUSANDS_PATTERN = /^\d{1,3}(?:\.\d{3})+$/;
const PLAIN_DIGITS_PATTERN = /^\d+$/;

/**
 * Mengekstrak string terformat Rupiah (mis. `"Rp 1.500.000,50"` atau `"(Rp 500.000)"`)
 * menjadi string numerik kanonik yang aman diteruskan ke `terbilang()` atau `BigInt`.
 */
export function parseRupiah(value: string): string {
  if (typeof value !== 'string') {
    throw new TerbilangError('INVALID_INPUT', 'Input harus string.');
  }

  let raw = value.trim();
  if (raw === '') {
    throw new TerbilangError('INVALID_INPUT', 'Input kosong.');
  }

  let isNegative = false;
  if (raw.startsWith('(') && raw.endsWith(')')) {
    isNegative = true;
    raw = raw.slice(1, -1).trim();
    if (raw.startsWith('-') || raw.startsWith('+')) {
      throw new TerbilangError('INVALID_INPUT', 'Tanda negatif ganda tidak valid.');
    }
  } else if (raw.startsWith('-')) {
    isNegative = true;
    raw = raw.slice(1).trim();
  } else if (raw.startsWith('+')) {
    raw = raw.slice(1).trim();
  }

  raw = raw.replace(CURRENCY_PREFIX_PATTERN, '').trim();

  const commaIdx = raw.indexOf(',');
  let intRaw: string;
  let fracRaw = '';

  if (commaIdx !== -1) {
    intRaw = raw.slice(0, commaIdx);
    fracRaw = raw.slice(commaIdx + 1);
    if (!PLAIN_DIGITS_PATTERN.test(fracRaw)) {
      throw new TerbilangError('INVALID_INPUT', 'Bagian desimal Rupiah tidak valid.');
    }
  } else {
    intRaw = raw;
  }

  let cleanInt: string;
  if (intRaw.includes('.')) {
    if (!GROUPED_THOUSANDS_PATTERN.test(intRaw)) {
      throw new TerbilangError('INVALID_INPUT', 'Pemisah ribuan tidak valid.');
    }
    cleanInt = intRaw.replace(/\./g, '');
  } else {
    if (!PLAIN_DIGITS_PATTERN.test(intRaw)) {
      throw new TerbilangError('INVALID_INPUT', 'Format Rupiah tidak valid.');
    }
    cleanInt = intRaw;
  }

  const normalizedInt = cleanInt.replace(/^0+/, '') || '0';
  assertMaxDigits(normalizedInt);

  const isZero = normalizedInt === '0' && ZERO_ONLY_PATTERN.test(fracRaw);
  const sign = isNegative && !isZero ? '-' : '';

  return fracRaw.length > 0
    ? `${sign}${normalizedInt}.${fracRaw}`
    : `${sign}${normalizedInt}`;
}
