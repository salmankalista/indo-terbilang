import { COMPACT_UNITS, ZERO_ONLY_PATTERN } from './constants';
import { TerbilangError } from './errors';
import { parseNumericInput } from './parser';
import { roundDecimal } from './rounding';
import type { FormatRupiahOptions, NumericInput, RoundingMode } from './types';

function insertThousandsSeparator(intStr: string, separator: string): string {
  if (separator === '' || intStr.length <= 3) {
    return intStr;
  }
  const groups: string[] = [];
  for (let end = intStr.length; end > 0; end -= 3) {
    const start = Math.max(0, end - 3);
    groups.push(intStr.slice(start, end));
  }
  return groups.reverse().join(separator);
}

function applyRupiahAffixes(
  numberText: string,
  isNegative: boolean,
  symbol: string,
  spaceAfterSymbol: boolean,
  negativeFormat: 'minus' | 'parentheses'
): string {
  const core = symbol
    ? `${symbol}${spaceAfterSymbol ? ' ' : ''}${numberText}`
    : numberText;
  if (!isNegative) {
    return core;
  }
  return negativeFormat === 'parentheses' ? `(${core})` : `-${core}`;
}

function divideByPowerAndRound(
  integer: string,
  fraction: string,
  power: number,
  decimals: number,
  rounding: RoundingMode
): { integer: string; fraction: string } {
  const splitAt = integer.length - power;
  const shiftedInt = splitAt > 0 ? integer.slice(0, splitAt) : '0';
  const shiftedFrac =
    (splitAt > 0 ? integer.slice(splitAt) : integer.padStart(power, '0')) +
    fraction;
  return roundDecimal(shiftedInt, shiftedFrac, decimals, rounding);
}

function formatCompactRupiah(
  isNegativeInput: boolean,
  integer: string,
  fraction: string,
  options: {
    symbol: string;
    spaceAfterSymbol: boolean;
    thousandsSeparator: string;
    decimalSeparator: string;
    rounding: RoundingMode;
    negativeFormat: 'minus' | 'parentheses';
    compactDecimals: number;
  }
): string {
  const {
    symbol,
    spaceAfterSymbol,
    thousandsSeparator,
    decimalSeparator,
    rounding,
    negativeFormat,
    compactDecimals,
  } = options;

  if (
    !Number.isInteger(compactDecimals) ||
    compactDecimals < 0 ||
    compactDecimals > 6
  ) {
    throw new TerbilangError('INVALID_INPUT', 'Opsi compactDecimals harus 0-6.');
  }

  let scaleIdx = -1;
  for (let i = 0; i < COMPACT_UNITS.length; i++) {
    const unit = COMPACT_UNITS[i] as (typeof COMPACT_UNITS)[number];
    if (integer.length > unit.power) {
      scaleIdx = i;
      break;
    }
  }

  let rounded: { integer: string; fraction: string };
  let label = '';

  if (scaleIdx === -1) {
    rounded = roundDecimal(integer, fraction, compactDecimals, rounding);
    if (rounded.integer.length > 3) {
      scaleIdx = COMPACT_UNITS.length - 1;
    }
  }

  if (scaleIdx !== -1) {
    let unit = COMPACT_UNITS[scaleIdx] as (typeof COMPACT_UNITS)[number];
    rounded = divideByPowerAndRound(
      integer,
      fraction,
      unit.power,
      compactDecimals,
      rounding
    );

    if (rounded.integer.length > 3 && scaleIdx > 0) {
      unit = COMPACT_UNITS[scaleIdx - 1] as (typeof COMPACT_UNITS)[number];
      rounded = divideByPowerAndRound(
        integer,
        fraction,
        unit.power,
        compactDecimals,
        rounding
      );
    }

    label = ` ${unit.label}`;
  }

  const finalFrac = rounded!.fraction.replace(/0+$/, '');
  const isZero = rounded!.integer === '0' && finalFrac === '';
  const isNegative = isZero ? false : isNegativeInput;
  const formattedInt = insertThousandsSeparator(
    rounded!.integer,
    thousandsSeparator
  );
  const numberPart =
    finalFrac.length > 0
      ? `${formattedInt}${decimalSeparator}${finalFrac}`
      : formattedInt;

  return applyRupiahAffixes(
    `${numberPart}${label}`,
    isNegative,
    symbol,
    spaceAfterSymbol,
    negativeFormat
  );
}

/**
 * Memformat angka (`number | bigint | string`) menjadi format mata uang Rupiah secara deterministik.
 */
export function formatRupiah(
  value: NumericInput,
  options: FormatRupiahOptions = {}
): string {
  const {
    symbol = 'Rp',
    spaceAfterSymbol = true,
    thousandsSeparator = '.',
    decimalSeparator = ',',
    decimals = 2,
    rounding = 'half-up',
    negativeFormat = 'minus',
    compact = false,
    compactDecimals = 1,
  } = options;

  const parsed = parseNumericInput(value);

  if (compact) {
    return formatCompactRupiah(parsed.isNegative, parsed.integer, parsed.fraction, {
      symbol,
      spaceAfterSymbol,
      thousandsSeparator,
      decimalSeparator,
      rounding,
      negativeFormat,
      compactDecimals,
    });
  }

  if (
    decimals !== 'auto' &&
    (!Number.isInteger(decimals) || decimals < 0 || decimals > 20)
  ) {
    throw new TerbilangError('INVALID_INPUT', 'Opsi decimals harus auto atau 0-20.');
  }

  let finalInt: string;
  let finalFrac: string;
  let isNegative: boolean;

  if (decimals === 'auto') {
    finalInt = parsed.integer;
    finalFrac = parsed.fraction.replace(/0+$/, '');
    isNegative = parsed.isNegative;
  } else {
    const rounded = roundDecimal(
      parsed.integer,
      parsed.fraction,
      decimals,
      rounding
    );
    finalInt = rounded.integer;
    finalFrac = rounded.fraction;
    const isZero = finalInt === '0' && ZERO_ONLY_PATTERN.test(finalFrac);
    isNegative = isZero ? false : parsed.isNegative;
  }

  const formattedInt = insertThousandsSeparator(finalInt, thousandsSeparator);
  const numberText =
    finalFrac.length > 0
      ? `${formattedInt}${decimalSeparator}${finalFrac}`
      : formattedInt;

  return applyRupiahAffixes(
    numberText,
    isNegative,
    symbol,
    spaceAfterSymbol,
    negativeFormat
  );
}
