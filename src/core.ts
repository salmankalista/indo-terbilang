import { SCALES, UNITS } from './constants';
import { assertMaxDigits } from './errors';
import { parseNumericInput } from './parser';
import { roundDecimal } from './rounding';
import { applyStyleAndAffixes } from './style';
import type {
  NumericInput,
  TerbilangOptions,
  TerbilangRupiahOptions,
} from './types';

function convertTriplet(n: number): string {
  const words: string[] = [];
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds === 1) {
    words.push('seratus');
  } else if (hundreds > 1) {
    words.push(UNITS[hundreds] as string, 'ratus');
  }

  if (remainder > 0) {
    if (remainder < 10) {
      words.push(UNITS[remainder] as string);
    } else if (remainder === 10) {
      words.push('sepuluh');
    } else if (remainder === 11) {
      words.push('sebelas');
    } else if (remainder < 20) {
      words.push(UNITS[remainder - 10] as string, 'belas');
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      words.push(UNITS[tens] as string, 'puluh');
      if (ones > 0) {
        words.push(UNITS[ones] as string);
      }
    }
  }

  return words.join(' ');
}

function convertIntegerToWords(integerStr: string): string {
  if (integerStr === '0') {
    return 'nol';
  }

  const segments: string[] = [];
  let scaleIdx = 0;

  for (let end = integerStr.length; end > 0; end -= 3) {
    const start = Math.max(0, end - 3);
    const chunkVal = Number(integerStr.slice(start, end));

    if (chunkVal > 0) {
      if (scaleIdx === 1 && chunkVal === 1) {
        segments.push('seribu');
      } else {
        const words = convertTriplet(chunkVal);
        const scaleWord = SCALES[scaleIdx] as string;
        segments.push(scaleWord ? `${words} ${scaleWord}` : words);
      }
    }

    scaleIdx++;
  }

  return segments.reverse().join(' ');
}

/**
 * Mengonversi angka (`number | bigint | string`) menjadi kalimat terbilang Bahasa Indonesia baku.
 */
export function terbilang(
  value: NumericInput,
  options: TerbilangOptions = {}
): string {
  const {
    style = 'lower',
    prefix,
    suffix,
    negativePrefix = 'minus',
    decimalWord = 'koma',
    trimTrailingDecimalZeros = false,
  } = options;

  const parsed = parseNumericInput(value);
  const fraction = trimTrailingDecimalZeros
    ? parsed.fraction.replace(/0+$/, '')
    : parsed.fraction;

  const intWords = convertIntegerToWords(parsed.integer);
  let text = intWords;

  if (fraction.length > 0) {
    const fracWords: string[] = [];
    for (let i = 0; i < fraction.length; i++) {
      const digit = fraction.charCodeAt(i) - 48;
      fracWords.push(UNITS[digit] as string);
    }
    text = `${intWords} ${decimalWord.trim()} ${fracWords.join(' ')}`;
  }

  if (parsed.isNegative) {
    text = `${negativePrefix.trim()} ${text}`;
  }

  return applyStyleAndAffixes(text, { style, prefix, suffix });
}

/**
 * Mengonversi nominal angka menjadi kalimat terbilang mata uang Rupiah lengkap dengan sen.
 */
export function terbilangRupiah(
  value: NumericInput,
  options: TerbilangRupiahOptions = {}
): string {
  const {
    style = 'lower',
    prefix,
    suffix,
    negativePrefix = 'minus',
    currencyUnit = 'rupiah',
    includeSen = true,
    senUnit = 'sen',
    rounding = 'half-up',
  } = options;

  const parsed = parseNumericInput(value);
  const decimals = includeSen ? 2 : 0;
  const rounded = roundDecimal(
    parsed.integer,
    parsed.fraction,
    decimals,
    rounding
  );

  assertMaxDigits(rounded.integer);

  const senVal = includeSen ? Number(rounded.fraction) : 0;
  const isZero = rounded.integer === '0' && senVal === 0;
  const isNegative = isZero ? false : parsed.isNegative;

  const intWords = convertIntegerToWords(rounded.integer);
  let text = `${intWords} ${currencyUnit.trim()}`;

  if (senVal > 0) {
    text = `${text} ${convertTriplet(senVal)} ${senUnit.trim()}`;
  }

  if (isNegative) {
    text = `${negativePrefix.trim()} ${text}`;
  }

  return applyStyleAndAffixes(text, { style, prefix, suffix });
}
