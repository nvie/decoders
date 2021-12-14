// @flow strict

import { annotate } from '../annotate';
import { err, ok } from '../result';
import type { Decoder } from '../_types';

export function instanceOf<T>(klass: Class<T>): Decoder<T> {
    return (blob: mixed) =>
        blob instanceof klass
            ? ok(blob)
            : err(
                  annotate(
                      blob,
                      `Must be ${
                          // $FlowFixMe[incompatible-use] - klass.name is fine?
                          klass.name
                      } instance`,
                  ),
              );
}
