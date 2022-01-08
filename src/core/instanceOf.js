// @flow strict

import { annotate } from '../annotate';
import { define } from '../_decoder';
import { err, ok } from '../result';
import type { Decoder } from '../_decoder';

export function instanceOf<T>(klass: Class<T>): Decoder<T> {
    return define((blob) =>
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
              ),
    );
}
