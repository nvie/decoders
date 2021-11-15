// @flow strict

import annotate, { annotateFields } from '../annotate';
import { isAnnotation } from '../ast';

describe('annotation detection', () => {
    it('detects annotation instances', () => {
        expect(isAnnotation(undefined)).toBe(false);
        expect(isAnnotation(null)).toBe(false);
        expect(isAnnotation(42)).toBe(false);
        expect(isAnnotation('foo')).toBe(false);
        expect(isAnnotation([])).toBe(false);
        expect(isAnnotation({})).toBe(false);
        expect(isAnnotation({ type: 'foo' })).toBe(false);
        expect(isAnnotation({ type: 'ObjectAnnotation' })).toBe(true);
        expect(isAnnotation({ type: 'ArrayAnnotation' })).toBe(true);
        expect(isAnnotation({ type: 'ScalarAnnotation' })).toBe(true);
        expect(isAnnotation({ type: 'FunctionAnnotation' })).toBe(true);
        expect(isAnnotation({ type: 'CircularRefAnnotation' })).toBe(true);
    });
});

describe('parsing (scalars)', () => {
    it('strings', () => {
        expect(annotate('foo')).toEqual({
            type: 'ScalarAnnotation',
            value: 'foo',
            annotation: undefined,
        });
        expect(annotate('foo', '')).toEqual({
            type: 'ScalarAnnotation',
            value: 'foo',
            annotation: '',
        });
        expect(annotate('foo', 'great')).toEqual({
            type: 'ScalarAnnotation',
            value: 'foo',
            annotation: 'great',
        });
    });

    it('booleans', () => {
        expect(annotate(true)).toEqual({
            type: 'ScalarAnnotation',
            value: true,
            annotation: undefined,
        });
        expect(annotate(true, '')).toEqual({
            type: 'ScalarAnnotation',
            value: true,
            annotation: '',
        });
        expect(annotate(false, 'lies!')).toEqual({
            type: 'ScalarAnnotation',
            value: false,
            annotation: 'lies!',
        });
    });

    it('numbers', () => {
        expect(annotate(123)).toEqual({
            type: 'ScalarAnnotation',
            value: 123,
            annotation: undefined,
        });
        expect(annotate(234, '')).toEqual({
            type: 'ScalarAnnotation',
            value: 234,
            annotation: '',
        });
        expect(annotate(314, '100x π')).toEqual({
            type: 'ScalarAnnotation',
            value: 314,
            annotation: '100x π',
        });
    });

    it('dates', () => {
        const nyd = new Date(2018, 0, 1);
        expect(annotate(nyd)).toEqual({
            type: 'ScalarAnnotation',
            value: nyd,
            annotation: undefined,
        });
        expect(annotate(nyd, '')).toEqual({
            type: 'ScalarAnnotation',
            value: nyd,
            annotation: '',
        });
        expect(annotate(nyd, "new year's day")).toEqual({
            type: 'ScalarAnnotation',
            value: nyd,
            annotation: "new year's day",
        });
    });

    it('null', () => {
        expect(annotate(null)).toEqual({
            type: 'ScalarAnnotation',
            value: null,
            annotation: undefined,
        });
        expect(annotate(null, 'foo')).toEqual({
            type: 'ScalarAnnotation',
            value: null,
            annotation: 'foo',
        });
    });

    it('undefined', () => {
        expect(annotate(undefined)).toEqual({
            type: 'ScalarAnnotation',
            value: undefined,
            annotation: undefined,
        });
        expect(annotate(undefined, 'foo')).toEqual({
            type: 'ScalarAnnotation',
            value: undefined,
            annotation: 'foo',
        });
    });
});

describe('parsing (composite)', () => {
    it('arrays', () => {
        const arr1 = [1, 'foo'];
        expect(annotate(arr1)).toEqual({
            type: 'ArrayAnnotation',
            items: [
                {
                    type: 'ScalarAnnotation',
                    value: 1,
                    annotation: undefined,
                },
                {
                    type: 'ScalarAnnotation',
                    value: 'foo',
                    annotation: undefined,
                },
            ],
            annotation: undefined,
        });

        const arr2 = [annotate(1, 'uno'), 'foo'];
        expect(annotate(arr2)).toEqual({
            type: 'ArrayAnnotation',
            items: [
                {
                    type: 'ScalarAnnotation',
                    value: 1,
                    annotation: 'uno',
                },
                {
                    type: 'ScalarAnnotation',
                    value: 'foo',
                    annotation: undefined,
                },
            ],
            annotation: undefined,
        });
    });

    it('objects', () => {
        const obj = { name: 'Frank' };
        expect(annotate(obj)).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'name',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 'Frank',
                        annotation: undefined,
                    },
                },
            ],
            annotation: undefined,
        });
    });

    it('objects (values annotated)', () => {
        const obj = { name: annotate('nvie', 'Vincent'), age: 36 };
        expect(annotate(obj)).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'name',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 'nvie',
                        annotation: 'Vincent',
                    },
                },
                {
                    key: 'age',
                    value: { type: 'ScalarAnnotation', value: 36, annotation: undefined },
                },
            ],
            annotation: undefined,
        });
    });

    it('annotates fields in object', () => {
        // Annotate with a simple string
        const obj = { name: null };
        expect(annotateFields(obj, [['name', 'Missing!']])).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'name',
                    value: {
                        type: 'ScalarAnnotation',
                        value: null,
                        annotation: 'Missing!',
                    },
                },
            ],
            annotation: undefined,
        });

        // Annotate with a full annotation object (able to change the annotate value itself)
        const obj2 = { name: null, age: 20 };
        expect(
            annotateFields(obj2, [['name', annotate('example', 'An example value')]]),
        ).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'name',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 'example',
                        annotation: 'An example value',
                    },
                },
                {
                    key: 'age',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 20,
                        annotation: undefined,
                    },
                },
            ],
            annotation: undefined,
        });
    });

    it('annotates missing fields in object', () => {
        // Annotate with a simple string
        const obj = { foo: 'hello' };
        expect(annotateFields(obj, [['bar', 'Missing']])).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'foo',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 'hello',
                        annotation: undefined,
                    },
                },
                {
                    key: 'bar',
                    value: {
                        type: 'ScalarAnnotation',
                        value: undefined,
                        annotation: 'Missing',
                    },
                },
            ],
            annotation: undefined,
        });
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
            expect(annotate(annotate(value), 'foo').annotation).toEqual('foo');
            expect(annotate(annotate(annotate(value), 'foo'), 'bar').annotation).toEqual(
                'bar',
            );
        }
    });
});

describe('annotating circular objects', () => {
    it('circular arrays', () => {
        var circularArray = ['foo'];
        circularArray.push(circularArray);
        expect(annotate(circularArray)).toEqual({
            type: 'ArrayAnnotation',
            annotation: undefined,
            items: [
                {
                    type: 'ScalarAnnotation',
                    value: 'foo',
                    annotation: undefined,
                },
                { type: 'CircularRefAnnotation' },
            ],
        });
        expect(annotate(annotate(annotate(circularArray)))).toEqual({
            type: 'ArrayAnnotation',
            annotation: undefined,
            items: [
                {
                    type: 'ScalarAnnotation',
                    value: 'foo',
                    annotation: undefined,
                },
                { type: 'CircularRefAnnotation' },
            ],
        });
    });

    it('circular objects', () => {
        var circularObject = { foo: 42, bar: { qux: 'hello' } };
        // $FlowFixMe[prop-missing]
        circularObject.bar.self = circularObject;
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;
        expect(annotateFields(circularObject, [['self', 'Example']])).toEqual({
            type: 'ObjectAnnotation',
            pairs: [
                {
                    key: 'foo',
                    value: {
                        type: 'ScalarAnnotation',
                        value: 42,
                    },
                },
                {
                    key: 'bar',
                    value: {
                        type: 'ObjectAnnotation',
                        pairs: [
                            {
                                key: 'qux',
                                value: {
                                    type: 'ScalarAnnotation',
                                    value: 'hello',
                                },
                            },
                            {
                                key: 'self',
                                value: {
                                    type: 'CircularRefAnnotation',
                                },
                            },
                        ],
                    },
                },
                {
                    key: 'self',
                    value: {
                        type: 'CircularRefAnnotation',
                        annotation: 'Example',
                    },
                },
            ],
            annotation: undefined,
        });
    });

    it('circular objects (w/ explicit seen)', () => {
        var circularObject = { foo: 42, bar: { qux: 'hello' } };
        // $FlowFixMe[prop-missing]
        circularObject.bar.self = circularObject;
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;

        const seen = new WeakSet();
        seen.add(circularObject);
        expect(annotateFields(circularObject, [['self', 'Example']], seen)).toEqual({
            type: 'CircularRefAnnotation',
            annotation: undefined,
        });
    });

    it('circular objects (w/ explicit annotation)', () => {
        var circularObject = { foo: 42 };
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;

        const seen = new WeakSet();
        seen.add(circularObject);
        expect(
            annotate(annotate(circularObject, undefined, seen), 'Example', seen),
        ).toEqual({
            type: 'CircularRefAnnotation',
            annotation: 'Example',
        });
    });
});
