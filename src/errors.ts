import { MAX_INTEGER_DIGITS } from './constants';
import type { TerbilangErrorCode } from './types';

/**
 * Error bertipe khusus yang dilempar ketika input atau opsi tidak valid.
 */
export class TerbilangError extends Error {
  /** Kode error terstruktur untuk penanganan secara programatik. */
  public readonly code: TerbilangErrorCode;

  constructor(code: TerbilangErrorCode, message: string) {
    super(message);
    this.name = 'TerbilangError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Memvalidasi panjang digit bagian bulat agar tidak melampaui batas skala `desiliun`.
 */
export function assertMaxDigits(integerStr: string): void {
  if (integerStr.length > MAX_INTEGER_DIGITS) {
    throw new TerbilangError(
      'OUT_OF_RANGE',
      `Melebihi batas ${MAX_INTEGER_DIGITS} digit.`
    );
  }
}
