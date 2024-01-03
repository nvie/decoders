import { partition } from 'itertools';
import { describe, expect, test } from 'vitest';

import { array } from '~/arrays';
import { constant, optional } from '~/basics';
import type { Decoder } from '~/core';
import { instanceOf, lazy, prep } from '~/misc';
import { number } from '~/numbers';
import { object } from '~/objects';
import { string } from '~/strings';

import { INPUTS } from './_fixtures';

describe('instanceOf', () => {
  const errorDecoder = instanceOf(Error);
  const typeErrorDecoder = instanceOf(TypeError);

  test('accepts', () => {
    const e = new Error('foo');
    const t = new TypeError('bar'); // Subclasses are also allowed

    expect(errorDecoder.verify(e)).toEqual(e);
    expect(typeErrorDecoder.verify(t)).toEqual(t);

    // A TypeError is also an Error (since it's a subclass), but not the
    // other way around!
    expect(errorDecoder.verify(t)).toEqual(t);
    expect(() => typeErrorDecoder.verify(e)).toThrow('Must be TypeError instance');
  });

  test('rejects', () => {
    expect(() => errorDecoder.verify('123')).toThrow('Must be Error instance');
    expect(() => errorDecoder.verify(123)).toThrow('Must be Error instance');
    expect(() => errorDecoder.verify({})).toThrow('Must be Error instance');
    expect(() => errorDecoder.verify(null)).toThrow('Must be Error instance');
    expect(() => errorDecoder.verify(undefined)).toThrow('Must be Error instance');
  });
});

describe('lazy', () => {
  test('lazy(() => string) is same as string', () => {
    const eagerDecoder = string;
    const lazyDecoder = lazy(() => string);
    for (const input of INPUTS) {
      const eagerResult = eagerDecoder.decode(input);
      const lazyResult = lazyDecoder.decode(input);
      expect(eagerResult.value).toEqual(lazyResult.value);
      expect(eagerResult.error).toEqual(lazyResult.error);
    }
  });

  test('build self-referential types with lazy()', () => {
    type StringList = {
      curr: string;
      next?: StringList;
    };

    const llist: Decoder<StringList> = object({
      curr: string,
      next: optional(lazy(() => llist)),
    });

    expect(llist.decode(123).ok).toBe(false);
    expect(llist.decode('string').ok).toBe(false);
    expect(llist.decode({ curr: 123 }).ok).toBe(false);
    expect(llist.decode({ curr: 'string', next: true }).ok).toBe(false);

    const v1 = { curr: 'i am a string' };
    const v2 = { curr: 'i am a string', next: { curr: 'another' } };
    expect(llist.decode(v1).value).toEqual(v1);
    expect(llist.decode(v2).value).toEqual(v2);
  });

  test('build self-referential types with variables', () => {
    type Tree<T> = {
      node?: T;
      children: Tree<T>[];
    };

    function tree<T>(decoder: Decoder<T>): Decoder<Tree<T>> {
      return object({
        node: decoder,
        children: array(lazy(() => tree(decoder))),
      });
    }

    const stringTree = tree(string);

    expect(stringTree.decode(123).ok).toBe(false);
    expect(stringTree.decode('string').ok).toBe(false);
    expect(stringTree.decode({ node: 123 }).ok).toBe(false);
    expect(stringTree.decode({ node: 'string', children: false }).ok).toBe(false);

    const s1 = { node: 'string', children: [] };
    const s2 = { node: 'string', children: [{ node: 'another', children: [] }] };
    expect(stringTree.decode(s1).value).toEqual(s1);
    expect(stringTree.decode(s2).value).toEqual(s2);

    const n1 = { node: 123, children: [] };
    const n2 = { node: 123, children: [{ node: 456, children: [] }] };
    expect(tree(number).decode(n1).value).toEqual(n1);
    expect(tree(number).decode(n2).value).toEqual(n2);
  });
});

describe('prep', () => {
  const answerToLife = prep((x) => parseInt(x as string), constant(42));
  const [okay, not_okay] = partition(INPUTS, (x) => String(x) === '42');

  test('valid', () => {
    expect(okay.length).not.toBe(0);
    for (const value of okay) {
      expect(answerToLife.verify(value)).toBe(42);
    }
  });

  test('invalid', () => {
    expect(not_okay.length).not.toBe(0);
    for (const value of not_okay) {
      expect(answerToLife.decode(value).ok).toBe(false);
    }
  });

  test('invalid when prep mapper function throws', () => {
    expect(answerToLife.decode(Symbol('foo')).ok).toBe(false);
    //                  ^^^^^^^^^^^^^ This will cause the `Number(x)` call to throw
  });
});
