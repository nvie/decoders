// @flow

import { Err } from 'lemons';

function summarizer(key: string, value: mixed): mixed {
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

export function isDecodeError(e: any): boolean {
    return !!(e && e._isDecoderError);
}

export default class DecodeError extends Error {
    _isDecoderError: true;
    // message: string;
    blob: mixed;
    parents: Array<DecodeError>;

    constructor(message: string, blob: mixed, parents: Array<DecodeError>) {
        super(message);
        // this.message = message;
        this.blob = blob;
        this.parents = parents;
        this._isDecoderError = true;
    }

    format(prefix: string = '') {
        let msg = '';
        msg += `${prefix}Error: ${this.message}\n`;
        msg += `${prefix}Actual: ${JSON.stringify(this.blob, summarizer, 1)}\n`;
        if (this.parents.length > 0) {
            msg += `${prefix}Parent errors:\n`;
            msg += this.parents.map(e => e.format(prefix + '    ')).join('\n');
        }
        return msg;
    }

    toString() {
        return this.format();
    }
}

/**
 * Helper that creates Err instances containing rich DecodeError objects as
 * their error value param.  These rich objects contain all of the relevant
 * nested errors under their "parents" params.
 */
export function makeErr(message: string, blob: mixed, parents: Array<DecodeError>) {
    return Err(new DecodeError(message, blob, parents));
}
