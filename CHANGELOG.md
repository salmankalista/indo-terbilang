# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-26

### Added
- `terbilang(value, options?)`: Konversi angka (`number | bigint | string`) ke kalimat terbilang Bahasa Indonesia baku (EYD V / KBBI) dari `0` hingga skala `desiliun` ($10^{36}-1$), mendukung bilangan negatif, notasi ilmiah, desimal digit-per-digit, gaya huruf (`lower`, `upper`, `title`, `sentence`), serta `prefix`/`suffix`.
- `terbilangRupiah(value, options?)`: Konversi nominal finansial ke format Rupiah beserta sen dengan pembulatan eksak berbasis string (`half-up` / `truncate`).
- `formatRupiah(value, options?)`: Pemformat mata uang Rupiah deterministik (tanpa ketergantungan `Intl`) dengan opsi desimal, format negatif kurung/minus, dan notasi ringkas `compact` (`rb`, `jt`, `M`, `T`).
- `parseRupiah(value)`: Parser aman untuk mengekstrak string format Rupiah menjadi string numerik kanonik.
- `TerbilangError`: Error bertipe terstruktur dengan kode `INVALID_INPUT`, `NON_FINITE_NUMBER`, dan `OUT_OF_RANGE`.
- Paket dual ESM + CJS beserta deklarasi TypeScript (`.d.ts`, `.d.cts`) dengan zero runtime dependencies.
