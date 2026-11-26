# Panduan Kontribusi (`indo-terbilang`)

Terima kasih sudah tertarik berkontribusi pada `indo-terbilang`!

## Persyaratan Lokal

- Node.js `>= 18`
- Git

## Setup Pengembangan

```bash
git clone https://github.com/salmankalista/indo-terbilang.git
cd indo-terbilang
npm install
```

*(Catatan pengguna Windows PowerShell: apabila eksekusi skrip `.ps1` diblokir Execution Policy, jalankan `npm.cmd` dan `npx.cmd`).*

## Menjalankan Quality Gate

Sebelum membuka Pull Request, pastikan seluruh pengecekan berikut lulus:

```bash
npm run verify
```

Perintah tersebut menjalankan secara berurutan:
1. `tsc --noEmit` (strict TypeScript typecheck)
2. `vitest run --coverage` (wajib 100% coverage untuk seluruh modul `src/`)
3. `tsup` (build dual ESM + CJS + `.d.ts`/`.d.cts`)
4. `publint && attw --pack .` (validasi metadata & exports package)
5. `node tests/exports-smoke.mjs` (smoke test impor ESM & CJS hasil build)
6. Pengecekan batas ukuran bundle ESM gzipped `< 3 KB`

## Aturan Kode & Commit

- Jaga **0 runtime dependencies** di `package.json`.
- Ikuti kaidah Bahasa Indonesia baku (EYD V / KBBI), misalnya `"miliar"`, `"seribu"`, dan pembacaan desimal digit-per-digit.
- Gunakan format [Conventional Commits](https://www.conventionalcommits.org/) untuk pesan commit (mis. `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).
