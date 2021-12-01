// @flow strict
/* eslint-disable no-restricted-syntax */

import { annotate, array, circularRef, merge, object, scalar } from '../annotate';

describe('parsing (scalars)', () => {
    it('strings', () => {
        expect(annotate('foo')).toEqual(scalar('foo'));
        expect(annotate('foo', '')).toEqual(scalar('foo', ''));
        expect(annotate('foo', 'great')).toEqual(scalar('foo', 'great'));
    });

    it('booleans', () => {
        expect(annotate(true)).toEqual(scalar(true));
        expect(annotate(true, '')).toEqual(scalar(true, ''));
        expect(annotate(false, 'lies!')).toEqual(scalar(false, 'lies!'));
    });

    it('numbers', () => {
        expect(annotate(123)).toEqual(scalar(123));
        expect(annotate(234, '')).toEqual(scalar(234, ''));
        expect(annotate(314, '100x π')).toEqual(scalar(314, '100x π'));
    });

    it('dates', () => {
        const nyd = new Date(2018, 0, 1);
        expect(annotate(nyd)).toEqual(scalar(nyd));
        expect(annotate(nyd, '')).toEqual(scalar(nyd, ''));
        expect(annotate(nyd, "new year's day")).toEqual(scalar(nyd, "new year's day"));
    });

    it('null', () => {
        expect(annotate(null)).toEqual(scalar(null));
        expect(annotate(null, 'foo')).toEqual(scalar(null, 'foo'));
    });

    it('undefined', () => {
        expect(annotate(undefined)).toEqual(scalar(undefined));
        expect(annotate(undefined, 'foo')).toEqual(scalar(undefined, 'foo'));
    });

    it('symbols', () => {
        const sym1 = Symbol.for('xyz');
        const sym2 = Symbol();
        const sym3 = Symbol('hi');

        expect(annotate(sym1)).toEqual(scalar(sym1));
        expect(annotate(sym2)).toEqual(scalar(sym2));
        expect(annotate(sym3)).toEqual(scalar(sym3));
    });
});

describe('parsing (composite)', () => {
    it('arrays', () => {
        const arr1 = [1, 'foo'];
        expect(annotate(arr1)).toEqual(array([scalar(1), scalar('foo')]));

        const arr2 = [annotate(1, 'uno'), 'foo'];
        expect(annotate(arr2)).toEqual(array([scalar(1, 'uno'), scalar('foo')]));
    });

    it('objects', () => {
        const obj = { name: 'Frank' };
        expect(annotate(obj)).toEqual(
            object({
                name: scalar('Frank'),
            }),
        );
    });

    it('objects (values annotated)', () => {
        const obj = { name: annotate('nvie', 'Vincent'), age: 36 };
        expect(annotate(obj)).toEqual(
            object({
                name: scalar('nvie', 'Vincent'),
                age: scalar(36),
            }),
        );
    });

    it('annotates fields in object', () => {
        // Annotate with a simple string
        const objAnn = object({ name: scalar(null) });
        expect(merge(objAnn, { name: scalar(null, 'Missing!') })).toEqual(
            object({
                name: scalar(null, 'Missing!'),
            }),
        );

        // Annotate with a full annotation object (able to change the annotate value itself)
        const obj2 = object({ name: scalar(null), age: scalar(20) });
        expect(merge(obj2, { name: scalar(null, 'An example value') })).toEqual(
            object({
                name: scalar(null, 'An example value'),
                age: scalar(20),
            }),
        );
    });

    it('annotates missing fields in object', () => {
        // Annotate with a simple string
        const obj = object({ foo: scalar('hello') });
        expect(merge(obj, { bar: scalar(undefined, 'Missing') })).toEqual(
            object({
                foo: scalar('hello'),
                bar: scalar(undefined, 'Missing'),
            }),
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
        var circularArray = ['foo', [42 /* circular ref will go here */]];
        circularArray[1].push(circularArray);

        const expected = array([scalar('foo'), array([scalar(42), circularRef()])]);

        expect(annotate(circularArray)).toEqual(expected);

        // Annotations are idempotent
        expect(annotate(annotate(annotate(circularArray)))).toEqual(expected);
    });

    it('circular objects', () => {
        var circularObject = {
            foo: 42,
            bar: { qux: 'hello' },
        };
        // $FlowFixMe[prop-missing]
        circularObject.bar.self = circularObject;
        // $FlowFixMe[prop-missing]
        circularObject.self = circularObject;

        const expected = object({
            foo: scalar(42),
            bar: object({
                qux: scalar('hello'),
                self: circularRef(),
            }),
            self: circularRef(),
        });

        expect(annotate(circularObject)).toEqual(expected);

        // Annotations are idempotent
        expect(annotate(annotate(annotate(circularObject)))).toEqual(expected);
    });
});
