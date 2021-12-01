// @flow strict
/* eslint-disable no-restricted-syntax */

import * as Ann from '../annotate';
import { annotate } from '../annotate';

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

    it('symbols', () => {
        const sym1 = Symbol.for('xyz');
        const sym2 = Symbol();
        const sym3 = Symbol('hi');

        expect(annotate(sym1)).toEqual(Ann.scalar(sym1));
        expect(annotate(sym2)).toEqual(Ann.scalar(sym2));
        expect(annotate(sym3)).toEqual(Ann.scalar(sym3));
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
            Ann.object({
                name: Ann.scalar('Frank'),
            }),
        );
    });

    it('objects (values annotated)', () => {
        const obj = { name: annotate('nvie', 'Vincent'), age: 36 };
        expect(annotate(obj)).toEqual(
            Ann.object({
                name: Ann.scalar('nvie', 'Vincent'),
                age: Ann.scalar(36),
            }),
        );
    });

    it('annotates fields in object', () => {
        // Annotate with a simple string
        const objAnn = Ann.object({ name: Ann.scalar(null) });
        expect(Ann.updateField(objAnn, 'name', Ann.scalar(null, 'Missing!'))).toEqual(
            Ann.object({
                name: Ann.scalar(null, 'Missing!'),
            }),
        );

        // Annotate with a full annotation object (able to change the annotate value itself)
        const obj2 = Ann.object({ name: Ann.scalar(null), age: Ann.scalar(20) });
        expect(
            Ann.updateField(obj2, 'name', Ann.scalar(null, 'An example value')),
        ).toEqual(
            Ann.object({
                name: Ann.scalar(null, 'An example value'),
                age: Ann.scalar(20),
            }),
        );
    });

    it('annotates missing fields in object', () => {
        // Annotate with a simple string
        const obj = Ann.object({ foo: Ann.scalar('hello') });
        expect(Ann.updateField(obj, 'bar', Ann.scalar(undefined, 'Missing'))).toEqual(
            Ann.object({
                foo: Ann.scalar('hello'),
                bar: Ann.scalar(undefined, 'Missing'),
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

        const expected = Ann.array([
            Ann.scalar('foo'),
            Ann.array([Ann.scalar(42), Ann.circularRef()]),
        ]);

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

        const expected = Ann.object({
            foo: Ann.scalar(42),
            bar: Ann.object({
                qux: Ann.scalar('hello'),
                self: Ann.circularRef(),
            }),
            self: Ann.circularRef(),
        });

        expect(annotate(circularObject)).toEqual(expected);

        // Annotations are idempotent
        expect(annotate(annotate(annotate(circularObject)))).toEqual(expected);
    });
});
