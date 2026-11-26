/**
 * Tipe input numerik yang didukung seluruh fungsi konversi dan pemformatan.
 */
export type NumericInput = number | bigint | string;

/**
 * Gaya penulisan huruf pada hasil kalimat terbilang.
 * - `'lower'`: huruf kecil seluruhnya (`"seribu rupiah"`)
 * - `'upper'`: huruf kapital seluruhnya (`"SERIBU RUPIAH"`)
 * - `'title'`: huruf pertama setiap kata kapital (`"Seribu Rupiah"`)
 * - `'sentence'`: hanya huruf pertama kalimat kapital (`"Seribu rupiah"`)
 */
export type TerbilangStyle = 'lower' | 'upper' | 'title' | 'sentence';

/**
 * Mode pembulatan desimal berbasis string (tanpa floating-point arithmetic).
 */
export type RoundingMode = 'half-up' | 'truncate';

/**
 * Kode error terstruktur yang dilempar oleh {@link TerbilangError}.
 */
export type TerbilangErrorCode =
  | 'INVALID_INPUT'
  | 'NON_FINITE_NUMBER'
  | 'OUT_OF_RANGE';

/**
 * Struktur internal hasil parsing angka yang sudah dinormalisasi.
 */
export interface ParsedDecimal {
  /** Bernilai `true` jika angka bernilai negatif dan bukan nol. */
  isNegative: boolean;
  /** Digit bilangan bulat tanpa leading zeros (kecuali `"0"`). */
  integer: string;
  /** Digit di belakang koma tanpa pemisah; `""` jika tidak ada desimal. */
  fraction: string;
}

/**
 * Opsi konfigurasi untuk fungsi {@link terbilang}.
 */
export interface TerbilangOptions {
  /** Gaya huruf output. Default: `'lower'`. */
  style?: TerbilangStyle | undefined;
  /** Teks awalan sebelum kalimat hasil. */
  prefix?: string | undefined;
  /** Teks akhiran setelah kalimat hasil. */
  suffix?: string | undefined;
  /** Kata untuk tanda minus. Default: `'minus'`. */
  negativePrefix?: string | undefined;
  /** Kata pemisah desimal. Default: `'koma'`. */
  decimalWord?: string | undefined;
  /**
   * Jika `true`, menghapus angka nol di ujung kanan bagian desimal string
   * (mis. `"12.50"` menjadi `"dua belas koma lima"`, `"12.00"` menjadi `"dua belas"`).
   * Default: `false`.
   */
  trimTrailingDecimalZeros?: boolean | undefined;
}

/**
 * Opsi konfigurasi untuk fungsi {@link terbilangRupiah}.
 */
export interface TerbilangRupiahOptions {
  /** Gaya huruf output. Default: `'lower'`. */
  style?: TerbilangStyle | undefined;
  /** Teks awalan sebelum kalimat hasil. */
  prefix?: string | undefined;
  /** Teks akhiran tambahan setelah satuan mata uang/sen. */
  suffix?: string | undefined;
  /** Kata untuk tanda minus. Default: `'minus'`. */
  negativePrefix?: string | undefined;
  /** Satuan mata uang utama. Default: `'rupiah'`. */
  currencyUnit?: string | undefined;
  /** Apakah bagian sen (2 digit desimal) disertakan jika bernilai > 0. Default: `true`. */
  includeSen?: boolean | undefined;
  /** Satuan pecahan sen. Default: `'sen'`. */
  senUnit?: string | undefined;
  /** Mode pembulatan ketika desimal > 2 digit (atau `includeSen: false`). Default: `'half-up'`. */
  rounding?: RoundingMode | undefined;
}

/**
 * Opsi konfigurasi untuk fungsi {@link formatRupiah}.
 */
export interface FormatRupiahOptions {
  /** Simbol mata uang. Default: `'Rp'`. */
  symbol?: string | undefined;
  /** Apakah terdapat spasi antara simbol dan angka. Default: `true` (`"Rp 1.000,00"`). */
  spaceAfterSymbol?: boolean | undefined;
  /** Karakter pemisah ribuan. Default: `'.'`. */
  thousandsSeparator?: string | undefined;
  /** Karakter pemisah desimal. Default: `','`. */
  decimalSeparator?: string | undefined;
  /**
   * Jumlah digit desimal (`0` sampai `20`) atau `'auto'` (tampilkan hanya jika ada pecahan non-nol).
   * Default: `2`.
   */
  decimals?: number | 'auto' | undefined;
  /** Mode pembulatan desimal. Default: `'half-up'`. */
  rounding?: RoundingMode | undefined;
  /** Format tampilan angka negatif. Default: `'minus'` (`"-Rp 1.000,00"`). */
  negativeFormat?: 'minus' | 'parentheses' | undefined;
  /** Aktifkan notasi ringkas Indonesia (`"Rp 1,5 jt"`, `"Rp 2 M"`). Default: `false`. */
  compact?: boolean | undefined;
  /** Jumlah maksimal digit desimal saat `compact: true` (`0` sampai `6`). Default: `1`. */
  compactDecimals?: number | undefined;
}
