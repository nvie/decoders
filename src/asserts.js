// @flow

import { Err } from 'lemons';

import type { DecodeErrorType } from './types';

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

export function DecodeError(message: string, blob: mixed, parents: Array<DecodeErrorType>): DecodeErrorType {
    let err = {
        message,
        blob,
        parents,
        format(prefix: string = '') {
            let msg = '';
            msg += `${prefix}Error: ${err.message}\n`;
            msg += `${prefix}Actual: ${JSON.stringify(err.blob, summarizer, 1)}\n`;
            if (err.parents.length > 0) {
                msg += `${prefix}Parent errors:\n`;
                msg += err.parents.map(e => e.format(prefix + '    ')).join('\n');
            }
            return msg;
        },
    };
    return err;
}

export function makeErr(message: string, blob: mixed, parents: Array<DecodeErrorType>) {
    return Err(DecodeError(message, blob, parents));
}
