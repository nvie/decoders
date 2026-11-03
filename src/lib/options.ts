import type { Relax } from './Relax';
import { qty } from './utils';

// prettier-ignore
export type SizeOptions = Relax<
  | { size: number }
  | { min: number; max?: number }
  | { min?: number; max: number }
>;

/**
 * Options for `regex()`: optional size bounds, checked before the regex runs,
 * and an optional error message.
 */
export type RegexOptions = Partial<SizeOptions> & { message?: string };

/**
 * Anything with a .length or .size property, like strings, arrays, or sets.
 */
export type Sized = Relax<{ length: number } | { size: number }>;

/**
 * Returns a rejection function for the given size options. Strings are measured
 * in chars, anything else in the given unit (items by default).
 */
/* #__NO_SIDE_EFFECTS__ */
export function bySizeOptions(
  options: Partial<SizeOptions>,
  unit: string = 'item',
): (value: Sized) => string | null {
  const size = options.size;
  const min = size ?? options.min;
  const max = size ?? options.max;

  const atLeast = min === max ? '' : 'at least ';
  const atMost = min === max ? '' : 'at most ';

  return (value: Sized) => {
    const len = value.length ?? value.size;
    if (typeof value === 'string') {
      if (min !== undefined && len < min)
        return `Too short, must be ${atLeast}${qty(min, 'char')}`;
      if (max !== undefined && len > max)
        return `Too long, must be ${atMost}${qty(max, 'char')}`;
    } else {
      if (min !== undefined && len < min) return `Must have ${atLeast}${qty(min, unit)}`;
      if (max !== undefined && len > max) return `Must have ${atMost}${qty(max, unit)}`;
    }
    return null;
  };
}

/**
 * `min` and `max` are inclusive, `gt` and `lt` are exclusive. When both bounds
 * for one side are given, `min`/`max` win.
 */
export type RangeOptions = { min?: number; max?: number; gt?: number; lt?: number };

/**
 * Returns a rejection function for the given range options.
 */
/* #__NO_SIDE_EFFECTS__ */
export function byRangeOptions(options: RangeOptions): (value: number) => string | null {
  const { min, gt, max, lt } = options;

  // Every message states the whole allowed range
  const lower =
    min !== undefined
      ? `at least ${min}`
      : gt !== undefined
        ? `greater than ${gt}`
        : null;
  const upper =
    max !== undefined ? `at most ${max}` : lt !== undefined ? `less than ${lt}` : null;
  const range =
    min !== undefined && max !== undefined
      ? `between ${min} and ${max}`
      : lower !== null && upper !== null
        ? `${lower} and ${upper}`
        : (lower ?? upper);
  const lowMsg = `Too low, must be ${range}`;
  const highMsg = `Too high, must be ${range}`;

  const lo = min ?? gt ?? -Infinity;
  const hi = max ?? lt ?? Infinity;
  const loExclusive = gt !== undefined;
  const hiExclusive = lt !== undefined;
  return (value: number) =>
    value < lo || (loExclusive && value === lo)
      ? lowMsg
      : value > hi || (hiExclusive && value === hi)
        ? highMsg
        : null;
}
