import { TerbilangError } from './errors';
import type { TerbilangStyle } from './types';

export interface StyleAndAffixOptions {
  style?: TerbilangStyle | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
}

/**
 * Menggabungkan awalan/akhiran lalu menerapkan transformasi gaya huruf (`style`).
 */
export function applyStyleAndAffixes(
  text: string,
  options: StyleAndAffixOptions
): string {
  const { style = 'lower', prefix, suffix } = options;
  const parts: string[] = [];

  const cleanPrefix = prefix?.trim();
  if (cleanPrefix) {
    parts.push(cleanPrefix);
  }

  parts.push(text);

  const cleanSuffix = suffix?.trim();
  if (cleanSuffix) {
    parts.push(cleanSuffix);
  }

  const combined = parts.join(' ');

  switch (style) {
    case 'lower':
      return combined.toLowerCase();
    case 'upper':
      return combined.toUpperCase();
    case 'title':
      return combined
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    case 'sentence':
      return combined.charAt(0).toUpperCase() + combined.slice(1).toLowerCase();
    default:
      throw new TerbilangError('INVALID_INPUT', `Style tidak valid: "${String(style)}".`);
  }
}
