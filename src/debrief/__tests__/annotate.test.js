// @flow strict
/* eslint-disable no-restricted-syntax */

import * as Ann from '../Annotation';
import annotate, {
    __private_annotate,
    __private_annotateFields,
    annotateFields,
} from '../annotate';

describe('annotation detection', () => {
    it('detects annotation instances', () => {
        expect(Ann.isAnnotation(undefined)).toBe(false);
        expect(Ann.isAnnotation(null)).toBe(false);
        expect(Ann.isAnnotation(42)).toBe(false);
        expect(Ann.isAnnotation('foo')).toBe(false);
        expect(Ann.isAnnotation([])).toBe(false);
        expect(Ann.isAnnotation({})).toBe(false);
        expect(Ann.isAnnotation({ _type: 'foo' })).toBe(false);
        expect(Ann.isAnnotation({ _type: 'object' })).toBe(true);
        expect(Ann.isAnnotation({ _type: 'array' })).toBe(true);
        expect(Ann.isAnnotation({ _type: 'scalar' })).toBe(true);
        expect(Ann.isAnnotation({ _type: 'function' })).toBe(true);
        expect(Ann.isAnnotation({ _type: 'circular-ref' })).toBe(true);
    });
});

describe('parsing (scalars)', () => {
    it('strings', () => {
        expect(annotate('foo')).toEqual(Ann.scalar('foo'));
        expect(annotate('foo', '')).toEqual(Ann.scalar('foo', ''));
        expect(annotate('foo', 'great')).toEqual(Ann.scalar('foo', 'great'));
    });

    it('booleans', () => {
        expect(annotate(true)).toEqual(Ann.scalar(true));
        expect(annotate(true, '')).toEqual(Ann.scalar(true, ''));
        expect(annotate(false, 'lies!')).toEqual(Ann.scalar(false, 'lies!'));
    });

    it('numbers', () => {
        expect(annotate(123)).toEqual(Ann.scalar(123));
        expect(annotate(234, '')).toEqual(Ann.scalar(234, ''));
        expect(annotate(314, '100x π')).toEqual(Ann.scalar(314, '100x π'));
    });

    it('dates', () => {
        const nyd = new Date(2018, 0, 1);
        expect(annotate(nyd)).toEqual(Ann.scalar(nyd));
        expect(annotate(nyd, '')).toEqual(Ann.scalar(nyd, ''));
        expect(annotate(nyd, "new year's day")).toEqual(
            Ann.scalar(nyd, "new year's day"),
        );
    });

    it('null', () => {
        expect(annotate(null)).toEqual(Ann.scalar(null));
        expect(annotate(null, 'foo')).toEqual(Ann.scalar(null, 'foo'));
    });

    it('undefined', () => {
        expect(annotate(undefined)).toEqual(Ann.scalar(undefined));
        expect(annotate(undefined, 'foo')).toEqual(Ann.scalar(undefined, 'foo'));
    });
});

describe('parsing (composite)', () => {
    it('arrays', () => {
        const arr1 = [1, 'foo'];
        expect(annotate(arr1)).toEqual(Ann.array([Ann.scalar(1), Ann.scalar('foo')]));

        const arr2 = [annotate(1, 'uno'), 'foo'];
        expect(annotate(arr2)).toEqual(
            Ann.array([Ann.scalar(1, 'uno'), Ann.scalar('foo')]),
        );
    });

    it('objects', () => {
        const obj = { name: 'Frank' };
        expect(annotate(obj)).toEqual(
            Ann.object([
                {
                    key: 'name',
                    value: Ann.scalar('Frank'),
                },
            ]),
        );
    });

    it('objects (values annotated)', () => {
        const obj = { name: annotate('nvie', 'Vincent'), age: 36 };
        expect(annotate(obj)).toEqual(
            Ann.object([
                { key: 'name', value: Ann.scalar('nvie', 'Vincent') },
                { key: 'age', value: Ann.scalar(36) },
            ]),
        );
    });

    it('annotates fields in object', () => {
        // Annotate with a simple string
        const obj = { name: null };
        expect(annotateFields(obj, [['name', 'Missing!']])).toEqual(
            Ann.object([
                {
                    key: 'name',
                    value: Ann.scalar(null, 'Missing!'),
                },
            ]),
        );

        // Annotate with a full annotation object (able to change the annotate value itself)
        const obj2 = { name: null, age: 20 };
        expect(
            annotateFields(obj2, [['name', annotate('example', 'An example value')]]),
        ).toEqual(
            Ann.object([
                {
                    key: 'name',
                    value: Ann.scalar('example', 'An example value'),
                },
                {
                    key: 'age',
                    value: Ann.scalar(20),
                },
            ]),
        );
    });

    it('annotates missing fields in object', () => {
        // Annotate with a simple string
        const obj = { foo: 'hello' };
        expect(annotateFields(obj, [['bar', 'Missing']])).toEqual(
            Ann.object([
                { key: 'foo', value: Ann.scalar('hello') },
                { key: 'bar', value: Ann.scalar(undefined, 'Missing') },
            ]),
        );
    });
});

describe('parsing is idempotent', () => {
    it('parsing an annotation returns itself', () => {
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
    it('circular arrays', () => {
        var circularArray = ['foo'];
        circularArray.push(circularArray);
        expect(annotate(circularArray)).toEqual(
            Ann.array([Ann.scalar('foo'), Ann.circularRef()]),
        );
        expect(annotate(annotate(annotate(circularArray)))).toEqual(
            Ann.array([Ann.scalar('foo'), Ann.circularRef()]),
        );
    });

    it('circular objects', () => {
        var circularObject = { foo: 42, bar: { qux: 'hello' } };
        // $FlowFixMe[prop-missing]
        circularObject.bar.self = circularObject;
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;
        expect(annotateFields(circularObject, [['self', 'Example']])).toEqual(
            Ann.object([
                { key: 'foo', value: Ann.scalar(42) },
                {
                    key: 'bar',
                    value: Ann.object([
                        { key: 'qux', value: Ann.scalar('hello') },
                        { key: 'self', value: Ann.circularRef() },
                    ]),
                },
                { key: 'self', value: Ann.circularRef('Example') },
            ]),
        );
    });

    it('circular objects (w/ explicit seen)', () => {
        var circularObject = { foo: 42, bar: { qux: 'hello' } };
        // $FlowFixMe[prop-missing]
        circularObject.bar.self = circularObject;
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;

        const seen = new WeakSet();
        seen.add(circularObject);
        expect(
            __private_annotateFields(circularObject, [['self', 'Example']], seen),
        ).toEqual(Ann.circularRef());
    });

    it('circular objects (w/ explicit annotation)', () => {
        var circularObject = { foo: 42 };
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;

        const seen = new WeakSet();
        seen.add(circularObject);
        expect(
            __private_annotate(
                __private_annotate(circularObject, undefined, seen),
                'Example',
                seen,
            ),
        ).toEqual(Ann.circularRef('Example'));
    });
});
