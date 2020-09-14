// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { Decoder } from './types';

export function instanceOf<T>(klass: Class<T>): Decoder<T> {
    return (blob: mixed) =>
        blob instanceof klass
            ? Ok(blob)
            : Err(
                  annotate(
                      blob,
                      `Must be ${
                          // $FlowFixMe[incompatible-use] - klass.name is fine?
                          klass.name
                      } instance`
                  )
              );
}
