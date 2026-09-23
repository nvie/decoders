import { beforeEach, describe, expect, test } from 'vitest';

import type { Annotation, ObjectAnnotation } from '~/core/annotate';
import {
  annotate,
  makeArrayAnn,
  makeObjectAnn as makeObjectAnnOriginal,
  makeOpaqueAnn,
  makeScalarAnn,
  merge as mergeOriginal,
} from '~/core/annotate';
import { formatInline } from '~/core/format';

function makeObjectAnn(obj: Record<string, Annotation>, text?: string) {
  return makeObjectAnnOriginal(() => new Map(Object.entries(obj)), text);
}

function merge(
  objAnnotation: ObjectAnnotation,
  fields: Readonly<Record<string, Annotation>>,
) {
  return mergeOriginal(objAnnotation, new Map(Object.entries(fields)));
}

describe('parsing (scalars)', () => {
  test('strings', () => {
    expect(annotate('foo')).toEqual(makeScalarAnn('foo'));
    expect(annotate('foo', '')).toEqual(makeScalarAnn('foo', ''));
    expect(annotate('foo', 'great')).toEqual(makeScalarAnn('foo', 'great'));
  });

  test('booleans', () => {
    expect(annotate(true)).toEqual(makeScalarAnn(true));
    expect(annotate(true, '')).toEqual(makeScalarAnn(true, ''));
    expect(annotate(false, 'lies!')).toEqual(makeScalarAnn(false, 'lies!'));
  });

  test('numbers', () => {
    expect(annotate(123)).toEqual(makeScalarAnn(123));
    expect(annotate(234, '')).toEqual(makeScalarAnn(234, ''));
    expect(annotate(314, '100x π')).toEqual(makeScalarAnn(314, '100x π'));
  });

  test('dates', () => {
    const nyd = new Date(2018, 0, 1);
    expect(annotate(nyd)).toEqual(makeScalarAnn(nyd));
    expect(annotate(nyd, '')).toEqual(makeScalarAnn(nyd, ''));
    expect(annotate(nyd, "new year's day")).toEqual(makeScalarAnn(nyd, "new year's day"));
  });

  test('null', () => {
    expect(annotate(null)).toEqual(makeScalarAnn(null));
    expect(annotate(null, 'foo')).toEqual(makeScalarAnn(null, 'foo'));
  });

  test('undefined', () => {
    expect(annotate(undefined)).toEqual(makeScalarAnn(undefined));
    expect(annotate(undefined, 'foo')).toEqual(makeScalarAnn(undefined, 'foo'));
  });

  test('symbols', () => {
    const sym1 = Symbol.for('xyz');
    const sym2 = Symbol();
    const sym3 = Symbol('hi');

    expect(annotate(sym1)).toEqual(makeScalarAnn(sym1));
    expect(annotate(sym2)).toEqual(makeScalarAnn(sym2));
    expect(annotate(sym3)).toEqual(makeScalarAnn(sym3));
  });
});

describe('parsing (composite)', () => {
  test('arrays', () => {
    const arr1 = [1, 'foo'];
    expect(annotate(arr1)).toEqual(
      makeArrayAnn(() => [makeScalarAnn(1), makeScalarAnn('foo')]),
    );

    const arr2 = [annotate(1, 'uno'), 'foo'];
    expect(annotate(arr2)).toEqual(
      makeArrayAnn(() => [makeScalarAnn(1, 'uno'), makeScalarAnn('foo')]),
    );
  });

  test('sparse arrays', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(annotate([1, , 3])).toEqual(
      makeArrayAnn(() => [makeScalarAnn(1), makeScalarAnn(undefined), makeScalarAnn(3)]),
    );
  });

  test('objects', () => {
    const obj = { name: 'Frank' };
    expect(annotate(obj)).toEqual(
      makeObjectAnn({
        name: makeScalarAnn('Frank'),
      }),
    );
  });

  test('objects (values annotated)', () => {
    const obj = { name: annotate('nvie', 'Vincent'), age: 36 };
    expect(annotate(obj)).toEqual(
      makeObjectAnn({
        name: makeScalarAnn('nvie', 'Vincent'),
        age: makeScalarAnn(36),
      }),
    );
  });

  test('annotates fields in object', () => {
    // Annotate with a simple string
    const objAnn = makeObjectAnn({ name: makeScalarAnn(null) });
    expect(merge(objAnn, { name: makeScalarAnn(null, 'Missing!') })).toEqual(
      makeObjectAnn({
        name: makeScalarAnn(null, 'Missing!'),
      }),
    );

    // Annotate with a full annotation object (able to change the annotate value itself)
    const obj2 = makeObjectAnn({ name: makeScalarAnn(null), age: makeScalarAnn(20) });
    expect(merge(obj2, { name: makeScalarAnn(null, 'An example value') })).toEqual(
      makeObjectAnn({
        name: makeScalarAnn(null, 'An example value'),
        age: makeScalarAnn(20),
      }),
    );
  });

  test('annotates missing fields in object', () => {
    // Annotate with a simple string
    const obj = makeObjectAnn({ foo: makeScalarAnn('hello') });
    expect(merge(obj, { bar: makeScalarAnn(undefined, 'Missing') })).toEqual(
      makeObjectAnn({
        foo: makeScalarAnn('hello'),
        bar: makeScalarAnn(undefined, 'Missing'),
      }),
    );
  });
});

describe('parsing is idempotent', () => {
  test('parsing an annotation returns itself', () => {
    for (const value of ['a string', 42, [], {}, function () {}]) {
      // Annotated once yields an Annotation, but annotating it more often
      // has no effect on the result
      const once = annotate(value);
      expect(annotate(annotate(annotate(once)))).toEqual(once);

      // But providing a new value will update the existing annotation!
      expect(annotate(annotate(value), 'foo').text).toEqual('foo');
      expect(annotate(annotate(annotate(value), 'foo'), 'bar').text).toEqual('bar');
    }
  });
});

describe('annotating circular objects', () => {
  test('circular arrays', () => {
    const circularArray: any[] = ['foo', [42 /* circular ref will go here */]];
    circularArray[1].push(circularArray);

    const expected = makeArrayAnn(() => [
      makeScalarAnn('foo'),
      makeArrayAnn(() => [makeScalarAnn(42), makeOpaqueAnn('<circular ref>')]),
    ]);

    expect(annotate(circularArray)).toEqual(expected);

    // Annotations are idempotent
    expect(annotate(annotate(annotate(circularArray)))).toEqual(expected);
  });

  test('circular objects', () => {
    const circularObject = {
      foo: 42,
      bar: { qux: 'hello' },
    };
    (circularObject.bar as any).self = circularObject;
    (circularObject as any).self = circularObject;

    const expected = makeObjectAnn({
      foo: makeScalarAnn(42),
      bar: makeObjectAnn({
        qux: makeScalarAnn('hello'),
        self: makeOpaqueAnn('<circular ref>'),
      }),
      self: makeOpaqueAnn('<circular ref>'),
    });

    expect(annotate(circularObject)).toEqual(expected);

    // Annotations are idempotent
    expect(annotate(annotate(annotate(circularObject)))).toEqual(expected);
  });
});

describe('laziness', () => {
  let reads = 0;
  const spy = {
    get value() {
      reads++;
      return 42;
    },
  };
  const spyArray: unknown[] = [];
  Object.defineProperty(spyArray, 0, {
    enumerable: true,
    get() {
      reads++;
      return 42;
    },
  });

  beforeEach(() => {
    reads = 0;
  });

  test('does not walk the input until fields or items are read', () => {
    const objAnn = annotate(spy, 'Oops');
    const arrAnn = annotate(spyArray, 'Oops');
    expect(reads).toBe(0);

    expect(formatInline(objAnn)).toContain('"value": 42');
    expect(reads).toBe(1);
    expect(formatInline(arrAnn)).toContain('42');
    expect(reads).toBe(2);
  });

  test('updating the text does not walk the input', () => {
    annotate(annotate(spy, 'Oops'), 'Changed');
    annotate(annotate(spyArray, 'Oops'), 'Changed');
    expect(reads).toBe(0);
  });

  test('reflects changes made to the input before the first read', () => {
    const input = { name: 'Alice' };
    const ann = annotate(input, 'Oops');
    input.name = 'Bob';
    expect(ann).toEqual(makeObjectAnn({ name: makeScalarAnn('Bob') }, 'Oops'));

    // But once read, the annotation no longer changes
    input.name = 'Charlie';
    expect(ann).toEqual(makeObjectAnn({ name: makeScalarAnn('Bob') }, 'Oops'));
  });

  test('updating the text shares the walked tree', () => {
    const original = annotate(spy, 'Original');
    const updated = annotate(original, 'Updated');

    expect(updated).toEqual(makeObjectAnn({ value: makeScalarAnn(42) }, 'Updated'));
    expect(original).toEqual(makeObjectAnn({ value: makeScalarAnn(42) }, 'Original'));
    expect(reads).toBe(1);
  });
});
