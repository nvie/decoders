// @flow strict

import * as Result from './core/Result';
import { serialize as serializeInline, summarize } from './format';
import type { Annotation } from './core/Annotation';
import type { Decoder, Guard } from './types';

type Options = {|
    style?: 'inline' | 'simple', // `inline` by default
|};

/**
 * Alternative for serialize() that does not echo back the input value.
 */
function serializeSimple(annotation: Annotation) {
    return summarize(annotation).join('\n');
}

export function guard<T>(decoder: Decoder<T>, options?: Options): Guard<T> {
    const o = options || {};
    const style = o.style || 'inline';

    const serializer =
        style === 'inline'
            ? serializeInline // Normal serializer, which echoes back inputted value and inlines errors
            : serializeSimple; // Only returns error messages, without echoing back input

    return (blob: mixed) =>
        Result.unwrap(
            Result.mapError(decoder(blob), (annotation) => {
                const err = new Error('\n' + serializer(annotation));
                err.name = 'Decoding error';
                return err;
            }),
        );
}
