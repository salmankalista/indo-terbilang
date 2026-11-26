/** Batas maksimal digit bagian bulat (hingga 999 desiliun). */
export const MAX_INTEGER_DIGITS = 36;

/** Batas absolut eksponen untuk ekspansi notasi ilmiah agar aman terhadap memori. */
export const MAX_EXPONENT_ABS = 100;

/** Pola string yang hanya berisi karakter `'0'` (atau kosong). */
export const ZERO_ONLY_PATTERN = /^0*$/;

/** Kata dasar angka 0 sampai 9 sesuai kaidah Bahasa Indonesia baku. */
export const UNITS = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
] as const;

/** Daftar skala bilangan per 3 digit sesuai EYD V / KBBI. */
export const SCALES = [
  '',
  'ribu',
  'juta',
  'miliar',
  'triliun',
  'kuadriliun',
  'kuintiliun',
  'sekstiliun',
  'septiliun',
  'oktiliun',
  'noniliun',
  'desiliun',
] as const;

/** Daftar satuan ringkas untuk `formatRupiah({ compact: true })`. */
export const COMPACT_UNITS = [
  { power: 12, label: 'T' },
  { power: 9, label: 'M' },
  { power: 6, label: 'jt' },
  { power: 3, label: 'rb' },
] as const;
