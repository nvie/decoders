// @flow strict

// $FlowFixMe[unclear-type] - deliberate casting
type cast = any;

// Two spaces of indentation
export const INDENT = '  ';

/**
 * `x instanceof Date` checks are unreliable across stack frames (that information
 * might get lost by the JS runtime), so we'll have to reside to more runtime
 * inspection checks.
 *
 * Taken from https://stackoverflow.com/a/44198641
 */
const isDate = (value: mixed): boolean =>
    !!value &&
    // $FlowFixMe[method-unbinding]
    Object.prototype.toString.call(value) === '[object Date]' &&
    !isNaN(value);

/**
 * Is value is a valid Date instance, then return that.  If not, then return
 * null.
 */
export function asDate(value: mixed): Date | null {
    return isDate(value) ? ((value: cast): Date) : null;
}

export function isMultiline(s: string): boolean {
    const linecount = s.split('\n').length;
    return linecount > 1;
}

export function indent(s: string, prefix: string = INDENT): string {
    if (isMultiline(s)) {
        return s
            .split('\n')
            .map((line) => prefix + line)
            .join('\n');
    } else {
        return prefix + s;
    }
}
