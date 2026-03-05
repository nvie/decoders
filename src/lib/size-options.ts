import type { Relax } from './Relax';

export type SizeOptions = {
  min?: number;
  max?: number;
  size?: number;
};

/**
 * Anything with a .length or .size property, like strings, arrays, or sets.
 */
export type Sized = Relax<{ length: number } | { size: number }>;

/* #__NO_SIDE_EFFECTS__ */
export function bySizeOptions(options: SizeOptions): (value: Sized) => string | null {
  const size = options.size;
  const min = size ?? options.min;
  const max = size ?? options.max;

  const atLeast = min === max ? '' : 'at least ';
  const atMost = min === max ? '' : 'at most ';

  return (value: Sized) => {
    const len = value.length ?? value.size;
    if (typeof value === 'string') {
      if (min !== undefined && len < min)
        return `Too short, must be ${atLeast}${min} chars`;
      if (max !== undefined && len > max)
        return `Too long, must be ${atMost}${max} chars`;
    } else {
      if (min !== undefined && len < min) return `Must have ${atLeast}${min} items`;
      if (max !== undefined && len > max) return `Must have ${atMost}${max} items`;
    }
    return null;
  };
}
