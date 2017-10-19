// @flow

import { Err } from 'lemons';

import type { DecodeErrorType, JSType } from './types';

export function summarizer(key: string, value: mixed): mixed {
    // Don't collapse the outer level
    if (!key) {
        return value;
    }

    if (Array.isArray(value)) {
        return '[...]';
    } else if (typeof value === 'object') {
        return '{...}';
    }
    return value;
}

export function DecodeError(
    message: string,
    details: string = '',
    blob: any = undefined,
    parents: Array<DecodeErrorType> = []
): DecodeErrorType {
    let err = {
        message,
        details,
        blob,
        parents,
        format(prefix: string = '') {
            let msg = '';
            msg += `${prefix}Error: ${err.message}\n`;
            msg += `${prefix}${err.details}\n`;
            msg += `${prefix}Actual: ${JSON.stringify(err.blob, summarizer, 1)}\n`;
            if (err.parents.length > 0) {
                msg += `${prefix}Parent errors:\n`;
                msg += err.parents.map(e => e.format(prefix + '    ')).join('\n');
            }
            return msg;
        },
        toString() {
            return this.format();
        },
    };
    return err;
}

/**
 * Helper to enforce a runtime check on the given value.  No-op if the given blob
 * matches the predicate, but throws a decoding runtime error otherwise.
 */
export function assertTest(blob: any, predicate: any => boolean, message: string, details: string): void {
    if (!predicate(blob)) {
        throw DecodeError(message, details, blob);
    }
}

/**
 * Helper to enforce a runtime type check on the given value.
 */
export function assertType(blob: any, jsType: JSType): void {
    return assertTest(blob, x => typeof x === jsType, `Not a ${jsType}`, `Expected a "${jsType}" value`);
}

export function makeErr(
    message: string,
    details: string = '',
    blob: any = undefined,
    parents: Array<DecodeErrorType> = []
) {
    return Err(DecodeError(message, details, blob, parents));
}
