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

function dumps(blob: any): string {
    const value = JSON.stringify(blob, summarizer, 2);
    return value !== undefined ? value : '(unserializable data)';
}

function indent(s: string, prefix: string = '    '): string {
    return s
        .split('\n')
        .map(s => prefix + s)
        .join('\n');
}

export default class DecodeError {
    _isDecoderError: true;
    message: string;
    blob: mixed;
    parents: Array<DecodeError>;

    constructor(message: string, blob: mixed, parents: Array<DecodeError>) {
        this.message = message;
        this.blob = blob;
        this.parents = parents;
        this._isDecoderError = true;
        this.message = this.format();
    }

    format() {
        let msg = '';
        msg += `Error: ${this.message}\n`;
        msg += `Value: (${typeof this.blob}):\n`;
        msg += `${indent(dumps(this.blob))}\n`;
        if (this.parents.length > 0) {
            msg += `Parent errors (${this.parents.length} errors):\n`;
            for (const parent of this.parents) {
                msg += indent(parent.format()) + '\n';
            }
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
