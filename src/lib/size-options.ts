export type SizeOptions = {
  min?: number;
  max?: number;
  size?: number;
};

export function bySizeOptions(options: SizeOptions) {
  const size = options?.size;
  const min = size ?? options?.min;
  const max = size ?? options?.max;

  const atLeast = min === max ? '' : 'at least ';
  const atMost = min === max ? '' : 'at most ';
  const tooShort = `Too short, must be ${atLeast}${min} chars`;
  const tooLong = `Too long, must be ${atMost}${max} chars`;

  // XXX Optimize for runtime performance
  return (s: string) =>
    min !== undefined && s.length < min
      ? tooShort
      : max !== undefined && s.length > max
        ? tooLong
        : null;
}
