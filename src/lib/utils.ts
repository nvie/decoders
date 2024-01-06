export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

export function isDate(value: unknown): value is Date {
  //
  // `x instanceof Date` checks are unreliable across stack frames (that
  // information might get lost by the JS runtime), so we'll have to reside
  // to more runtime inspection checks.
  //
  // Taken from https://stackoverflow.com/a/44198641
  //
  return (
    !!value &&
    Object.prototype.toString.call(value) === '[object Date]' &&
    !isNaN(value as number)
  );
}

/**
 * Is the given value a POJO (plain old JavaScript object)?
 */
export function isPojo(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    // This still seems to be the only reliable way to determine whether
    // something is a pojo... ¯\_(ツ)_/¯
    Object.prototype.toString.call(value) === '[object Object]'
  );
}
