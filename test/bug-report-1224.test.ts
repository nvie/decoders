import { expect, test } from 'vitest';

import {
  type Decoder,
  define,
  formatShort,
  nonEmptyString,
  object,
  oneOf,
  positiveInteger,
} from '~';

export function combineObjects<
  A extends Record<string, unknown>,
  B extends Record<string, unknown>,
>(decoderA: Decoder<A>, decoderB: Decoder<B>): Decoder<A & B> {
  return define((blob, ok, error) => {
    const a = decoderA.decode(blob);
    if (!a.ok) {
      // console.log(util.inspect(a, { depth: null }));
      return error(a.error);
    }

    const b = decoderB.decode(blob);
    if (!b.ok) {
      return error(b.error);
    }

    return ok({ ...a.value, ...b.value });
  });
}

test('test', () => {
  const profile = {
    name: 'Bob',
    surname: 'Burgers',
    age: 40,
    occupation: 'Restaurateur',
  };

  const restaurantOwner = combineObjects(
    object({
      name: nonEmptyString,
      surname: nonEmptyString,
      age: nonEmptyString,
    }),
    object({
      age: positiveInteger,
      occupation: oneOf(['Restaurateur']),
    }),
  );

  const result = restaurantOwner.decode(profile);

  expect(result.ok).toBe(false);
  expect(result.value).toBeUndefined();

  expect((result.error as any)?.text).toBe(undefined);
  expect((result.error as any)?.fields.get('age')).toStrictEqual({
    text: 'Must be string',
    type: 'scalar',
    value: 40,
  });

  expect(formatShort(result.error!)).toEqual("Value at key 'age': Must be string");
});
