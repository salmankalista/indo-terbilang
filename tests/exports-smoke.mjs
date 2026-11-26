import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  TerbilangError as EsmTerbilangError,
  formatRupiah as esmFormatRupiah,
  parseRupiah as esmParseRupiah,
  terbilang as esmTerbilang,
  terbilangRupiah as esmTerbilangRupiah,
} from '../dist/index.js';

const require = createRequire(import.meta.url);
const {
  TerbilangError: CjsTerbilangError,
  formatRupiah: cjsFormatRupiah,
  parseRupiah: cjsParseRupiah,
  terbilang: cjsTerbilang,
  terbilangRupiah: cjsTerbilangRupiah,
} = require('../dist/index.cjs');

for (const [label, api] of [
  [
    'ESM',
    {
      terbilang: esmTerbilang,
      terbilangRupiah: esmTerbilangRupiah,
      formatRupiah: esmFormatRupiah,
      parseRupiah: esmParseRupiah,
      TerbilangError: EsmTerbilangError,
    },
  ],
  [
    'CJS',
    {
      terbilang: cjsTerbilang,
      terbilangRupiah: cjsTerbilangRupiah,
      formatRupiah: cjsFormatRupiah,
      parseRupiah: cjsParseRupiah,
      TerbilangError: CjsTerbilangError,
    },
  ],
]) {
  assert.equal(api.terbilang(1500), 'seribu lima ratus', `${label} terbilang failed`);
  assert.equal(
    api.terbilangRupiah(1250.5, { style: 'title' }),
    'Seribu Dua Ratus Lima Puluh Rupiah Lima Puluh Sen',
    `${label} terbilangRupiah failed`
  );
  assert.equal(
    api.formatRupiah(1500000),
    'Rp 1.500.000,00',
    `${label} formatRupiah failed`
  );
  assert.equal(
    api.parseRupiah('Rp 1.500.000,50'),
    '1500000.50',
    `${label} parseRupiah failed`
  );
  assert.throws(
    () => api.terbilang(Number.NaN),
    (err) => err instanceof api.TerbilangError && err.code === 'NON_FINITE_NUMBER',
    `${label} TerbilangError instanceof check failed`
  );
}

console.log('ESM & CJS exports smoke test passed!');
