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
  const tooShort = min !== undefined && `Too short, must be ${atLeast}${min} chars`;
  const tooLong = max !== undefined && `Too long, must be ${atMost}${max} chars`;

  return tooShort && tooLong
    ? (s: string) => (s.length < min ? tooShort : s.length > max ? tooLong : null)
    : tooShort
      ? (s: string) => (s.length < min ? tooShort : null)
      : tooLong
        ? (s: string) => (s.length > max ? tooLong : null)
        : () => null;
}
