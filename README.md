# `indo-terbilang`

Library TypeScript/JavaScript modern untuk mengonversi angka menjadi kalimat **terbilang Bahasa Indonesia baku (EYD V / KBBI)** serta memformat dan mem-parsing mata uang **Rupiah (IDR)** secara deterministik — dengan **zero dependencies**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](./package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](./tsconfig.json)

---

## Mengapa `indo-terbilang`?

- **Zero Runtime Dependencies & Super Ringan:** Tidak bergantung pada package eksternal apa pun, ukuran bundle ESM `< 3 KB` (gzipped).
- **Dual Format (ESM & CJS) + TypeScript Native:** Berjalan mulus di Node.js (`>= 18`), Bun, Deno, Vite, Next.js App Router, React Native/Hermes, dan browser modern.
- **Presisi Tinggi (`number | bigint | string`):** Mendukung nominal raksasa hingga skala **`desiliun`** ($10^{36} - 1$) tanpa terkena batas presisi `Number.MAX_SAFE_INTEGER`.
- **Akurat Sesuai Kaidah EYD V / KBBI:**
  - `10` $\to$ `"sepuluh"`, `11` $\to$ `"sebelas"`
  - `100` $\to$ `"seratus"`, `1000` $\to$ `"seribu"`, `1001000` $\to$ `"satu juta seribu"`, `21000` $\to$ `"dua puluh satu ribu"`
  - Menggunakan ejaan baku `"miliar"` (bukan `"milyar"`) dan `"satu juta"` (standar akuntansi/dokumen resmi).
  - Pembacaan desimal umum digit-per-digit (`3.14` $\to$ `"tiga koma satu empat"`, `"12.05"` $\to$ `"dua belas koma nol lima"`).
- **Pemformat Rupiah Deterministik (`formatRupiah`):** Tidak bergantung pada `Intl.NumberFormat` sehingga hasilnya 100% identik di Alpine Docker, Linux, Windows, macOS, maupun React Native Hermes (tanpa masalah spasi non-breaking `\u00a0`).
- **Fail-Loud (`TerbilangError`):** Input rusak (`NaN`, `Infinity`, string kosong/ilegal) melempar error bertipe jelas, bukan diam-diam mengembalikan `"nol"`.

---

## Instalasi

```bash
# npm
npm install indo-terbilang

# pnpm
pnpm add indo-terbilang

# yarn
yarn add indo-terbilang

# bun
bun add indo-terbilang
```

---

## Quick Start

```ts
import {
  terbilang,
  terbilangRupiah,
  formatRupiah,
  parseRupiah,
} from 'indo-terbilang';

terbilang(1500000);
// => "satu juta lima ratus ribu"

terbilang(1500000, { style: 'title', suffix: 'rupiah' });
// => "Satu Juta Lima Ratus Ribu Rupiah"

terbilangRupiah(1250.5);
// => "seribu dua ratus lima puluh rupiah lima puluh sen"

formatRupiah(1500000);
// => "Rp 1.500.000,00"

formatRupiah(1500000, { compact: true });
// => "Rp 1,5 jt"

parseRupiah('Rp 1.500.000,50');
// => "1500000.50"
```

CommonJS (`require`) juga didukung penuh:

```js
const { terbilang, formatRupiah } = require('indo-terbilang');
```

---

## Tutorial Pemakaian Praktis

### Tutorial 1: Generate Teks Kwitansi / Invoice Otomatis (Backend PDF)

Saat membuat faktur atau kwitansi, Anda membutuhkan angka nominal yang rapi sekaligus kalimat terbilang huruf kapital di awal setiap kata (`title`) atau awal kalimat (`sentence`):

```ts
import { formatRupiah, terbilangRupiah } from 'indo-terbilang';

interface InvoiceData {
  nomor: string;
  totalTagihan: string; // Simpan nominal finansial dari DB sebagai string agar eksak
}

function buatRingkasanKwitansi(invoice: InvoiceData) {
  const nominalFormatted = formatRupiah(invoice.totalTagihan);
  const kalimatTerbilang = terbilangRupiah(invoice.totalTagihan, {
    style: 'title',
  });

  return {
    nomor: invoice.nomor,
    nominal: nominalFormatted,
    terbilang: kalimatTerbilang,
  };
}

console.log(
  buatRingkasanKwitansi({
    nomor: 'INV-2026-001',
    totalTagihan: '1250750.50',
  })
);
/* Output:
{
  nomor: 'INV-2026-001',
  nominal: 'Rp 1.250.750,50',
  terbilang: 'Satu Juta Dua Ratus Lima Puluh Ribu Tujuh Ratus Lima Puluh Rupiah Lima Puluh Sen'
}
*/
```

*(Catatan: Untuk `'1250750.50'`, output `terbilang` persisnya adalah `"Satu Juta Dua Ratus Lima Puluh Ribu Tujuh Ratus Lima Puluh Rupiah Lima Puluh Sen"`).*

Jika kwitansi tidak memerlukan satuan sen dan ingin dibulatkan otomatis:

```ts
terbilangRupiah('1250750.60', {
  includeSen: false,
  style: 'sentence',
});
// => "Satu juta dua ratus lima puluh ribu tujuh ratus lima puluh satu rupiah"
```

---

### Tutorial 2: Menangani Input Form Rupiah + Live Preview Terbilang (Frontend)

Pengguna aplikasi web sering menempelkan (*paste*) teks seperti `"Rp 2.500.000,75"` ke input form. Gunakan `parseRupiah()` untuk membersihkannya terlebih dahulu sebelum diteruskan ke `terbilangRupiah()` dan tangani error dengan `TerbilangError`:

```ts
import {
  TerbilangError,
  formatRupiah,
  parseRupiah,
  terbilangRupiah,
} from 'indo-terbilang';

function prosesInputUser(rawText: string) {
  try {
    // 1. Ubah "Rp 2.500.000,75" -> "2500000.75"
    const numericString = parseRupiah(rawText);

    // 2. Format ulang secara konsisten dan buat preview terbilang
    return {
      valid: true,
      numericString,
      formatted: formatRupiah(numericString),
      terbilang: terbilangRupiah(numericString, { style: 'sentence' }),
    };
  } catch (err) {
    if (err instanceof TerbilangError) {
      return {
        valid: false,
        code: err.code,
        message: 'Nominal yang dimasukkan belum sesuai format Rupiah.',
      };
    }
    throw err;
  }
}

prosesInputUser('Rp 2.500.000,75');
// => {
//   valid: true,
//   numericString: "2500000.75",
//   formatted: "Rp 2.500.000,75",
//   terbilang: "Dua juta lima ratus ribu rupiah tujuh puluh lima sen"
// }
```

---

### Tutorial 3: Angka Raksasa (`BigInt` & `String`) dari Database `DECIMAL` / APBD

Tipe `number` JavaScript kehilangan presisi di atas `9.007.199.254.740.991` (`Number.MAX_SAFE_INTEGER`). Untuk anggaran proyek skala triliunan, kuadriliunan, atau nilai `DECIMAL(36, 2)` dari PostgreSQL/MySQL, selalu kirimkan sebagai `bigint` atau `string`:

```ts
import { formatRupiah, terbilang, terbilangRupiah } from 'indo-terbilang';

// Menggunakan BigInt
const anggaran = 15_000_000_000_000_000n;
terbilang(anggaran);
// => "lima belas kuadriliun"

// Menggunakan string presisi tinggi dari database DECIMAL
const nilaiKontrak = '1234567890123456.75';
formatRupiah(nilaiKontrak);
// => "Rp 1.234.567.890.123.456,75"

terbilangRupiah(nilaiKontrak, { style: 'title' });
// => "Seribu Dua Ratus Tiga Puluh Empat Triliun Lima Ratus Enam Puluh Tujuh Miliar Delapan Ratus Sembilan Puluh Juta Seratus Dua Puluh Tiga Ribu Empat Ratus Lima Puluh Enam Rupiah Tujuh Puluh Lima Sen"
```

---

### Tutorial 4: Format Dashboard (`compact`), Laporan Akuntansi, & Desimal Umum

```ts
import { formatRupiah, terbilang } from 'indo-terbilang';

// 1. Label ringkas untuk grafik / kartu KPI dashboard
formatRupiah(1500000, { compact: true }); // => "Rp 1,5 jt"
formatRupiah(2350000000, { compact: true, compactDecimals: 2 }); // => "Rp 2,35 M"
formatRupiah(999990, { compact: true }); // => "Rp 1 jt" (otomatis naik skala saat pembulatan)

// 2. Format akuntansi (kurung untuk nilai minus, tanpa desimal)
formatRupiah(-750000, {
  decimals: 0,
  negativeFormat: 'parentheses',
});
// => "(Rp 750.000)"

// 3. Desimal matematika / pengukuran (bukan mata uang)
terbilang(3.14); // => "tiga koma satu empat"
terbilang('12.05'); // => "dua belas koma nol lima"
terbilang('12.50'); // => "dua belas koma lima nol"
terbilang('12.50', { trimTrailingDecimalZeros: true }); // => "dua belas koma lima"
```

---

## Catatan Penting Penggunaan

1. **Perbedaan `number` vs `string` pada Desimal:**
   Di JavaScript, `12.50 === 12.5`. Jika Anda mengirim `terbilang(12.50)`, JavaScript sudah memangkas nol di ujung kanan sehingga hasilnya `"dua belas koma lima"`. Jika nol di ujung kanan perlu dibaca eksplisit, kirimkan sebagai string (`terbilang("12.50")` $\to$ `"dua belas koma lima nol"`). Untuk mata uang Rupiah, gunakan `terbilangRupiah(12.5)` yang otomatis memperlakukan `.5` sebagai `"lima puluh sen"`.
2. **Pemisah Ribuan vs Desimal pada String:**
   `terbilang("1.500")` menafsirkan `.` sebagai titik desimal standar (`1.5`), sedangkan `"1.500.000"` melempar `TerbilangError` agar tidak salah tafsir diam-diam. Untuk string berformat ribuan Indonesia (`"Rp 1.500.000"` atau `"1.500.000"`), selalu konversi lewat `parseRupiah()` terlebih dahulu.

---

## Referensi API

### 1. `terbilang(value, options?)`
Mengonversi `number | bigint | string` menjadi kalimat terbilang Bahasa Indonesia.

| Opsi | Tipe | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `style` | `'lower' \| 'upper' \| 'title' \| 'sentence'` | `'lower'` | Gaya penulisan huruf output. |
| `prefix` | `string` | `undefined` | Kata/kalimat awalan sebelum hasil. |
| `suffix` | `string` | `undefined` | Kata/kalimat akhiran setelah hasil. |
| `negativePrefix` | `string` | `'minus'` | Kata pengganti tanda `-`. |
| `decimalWord` | `string` | `'koma'` | Kata pemisah angka desimal. |
| `trimTrailingDecimalZeros` | `boolean` | `false` | Menghapus nol di ujung kanan desimal string (mis. `"12.50"` $\to$ `"dua belas koma lima"`). |

---

### 2. `terbilangRupiah(value, options?)`
Mengonversi nominal angka menjadi kalimat terbilang Rupiah beserta sen (2 digit desimal, pembulatan eksak berbasis string).

| Opsi | Tipe | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `style` | `'lower' \| 'upper' \| 'title' \| 'sentence'` | `'lower'` | Gaya penulisan huruf output. |
| `prefix` | `string` | `undefined` | Teks awalan sebelum hasil. |
| `suffix` | `string` | `undefined` | Teks akhiran setelah satuan mata uang/sen. |
| `negativePrefix` | `string` | `'minus'` | Kata pengganti tanda `-`. |
| `currencyUnit` | `string` | `'rupiah'` | Nama satuan mata uang utama. |
| `includeSen` | `boolean` | `true` | Menyertakan satuan sen bila bagian pecahan > `0`. |
| `senUnit` | `string` | `'sen'` | Nama satuan pecahan sen. |
| `rounding` | `'half-up' \| 'truncate'` | `'half-up'` | Mode pembulatan jika digit desimal > 2 (atau `includeSen: false`). |

---

### 3. `formatRupiah(value, options?)`
Memformat angka menjadi string mata uang Rupiah secara deterministik tanpa ketergantungan `Intl`.

| Opsi | Tipe | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `symbol` | `string` | `'Rp'` | Simbol mata uang (isi `''` jika ingin tanpa simbol). |
| `spaceAfterSymbol` | `boolean` | `true` | Menambah spasi antara simbol dan angka. |
| `thousandsSeparator` | `string` | `'.'` | Pemisah ribuan. |
| `decimalSeparator` | `string` | `','` | Pemisah desimal. |
| `decimals` | `number \| 'auto'` | `2` | Jumlah digit desimal (`0–20`), atau `'auto'` untuk menampilkan pecahan non-nol saja. |
| `rounding` | `'half-up' \| 'truncate'` | `'half-up'` | Mode pembulatan desimal. |
| `negativeFormat` | `'minus' \| 'parentheses'` | `'minus'` | Format negatif (`"-Rp 1.000,00"` atau `"(Rp 1.000,00)"`). |
| `compact` | `boolean` | `false` | Format ringkas (`rb`, `jt`, `M`, `T`). |
| `compactDecimals` | `number` | `1` | Maksimal digit desimal saat `compact: true` (`0–6`). |

---

### 4. `parseRupiah(value)`
Mengekstrak string terformat Rupiah (`"Rp 1.500.000,50"`, `"IDR 2.500"`, `"(Rp 500.000)"`, `"-Rp 500.000"`) menjadi string numerik kanonik (`"1500000.50"`, `"-500000"`). Melempar `TerbilangError` jika pemisah ribuan/desimal rusak atau melebihi 36 digit bagian bulat.

---

### 5. `TerbilangError`
Class error turunan `Error` dengan properti `code: TerbilangErrorCode`:
- `'INVALID_INPUT'`: Tipe bukan `number | bigint | string`, string kosong, format ambigu/ilegal, atau nilai opsi di luar aturan.
- `'NON_FINITE_NUMBER'`: Input `number` berupa `NaN`, `Infinity`, atau `-Infinity`.
- `'OUT_OF_RANGE'`: Panjang bagian bulat melebihi 36 digit (di atas skala `desiliun`) atau eksponen notasi ilmiah melampaui batas aman (`±100`).

---

## Orisinalitas Kode & Kredit

Seluruh implementasi runtime di dalam `indo-terbilang` (`src/` dan hasil build `dist/`) ditulis **100% secara orisinal dari nol** tanpa menyalin potongan kode pihak ketiga dan tanpa runtime dependency eksternal. Kaidah penulisan bilangan merujuk pada aturan baku **EYD V / KBBI** (Badan Pengembangan dan Pembinaan Bahasa).

Pengembangan, build, dan pengujian library ini didukung oleh toolchain open-source berikut *(hanya sebagai `devDependencies`, tidak ikut ter-bundle ke kode distribusi)*:
- [TypeScript](https://github.com/microsoft/TypeScript) (`Apache-2.0`)
- [tsup](https://github.com/egoist/tsup) (`MIT`)
- [Vitest](https://github.com/vitest-dev/vitest) & `@vitest/coverage-v8` (`MIT`)
- [publint](https://github.com/publint/publint) (`MIT`)
- [Are The Types Wrong?](https://github.com/arethetypeswrong/arethetypeswrong.github.io) (`MIT`)

---

## Lisensi

[MIT](./LICENSE) © 2026 salmankalista — dipilih karena bersifat permisif, ringkas, dan menjadi standar industri ekosistem npm sehingga aman dipakai di proyek open-source maupun komersial/enterprise.
