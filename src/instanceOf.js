// @flow strict

import * as Result from './core/Result';
import { annotate } from './core/Annotation';
import type { Decoder } from './types';

export function instanceOf<T>(klass: Class<T>): Decoder<T> {
    return (blob: mixed) =>
        blob instanceof klass
            ? Result.ok(blob)
            : Result.err(
                  annotate(
                      blob,
                      `Must be ${
                          // $FlowFixMe[incompatible-use] - klass.name is fine?
                          klass.name
                      } instance`,
                  ),
              );
}
