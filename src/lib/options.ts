import type { Relax } from './Relax';
import { qty } from './utils';

// prettier-ignore
export type SizeOptions = Relax<
  | { size: number }
  | { min: number; max?: number }
  | { min?: number; max: number }
>;

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
  options: SizeOptions,
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
