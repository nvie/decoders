// @flow strict

import { json, jsonArray, jsonObject } from '../json';

describe('decoder', () => {
    const decoder = json;

    it('decodes null', () => {
        expect(decoder.verify(null)).toEqual(null);
    });

    it('decodes strings', () => {
        expect(decoder.verify('')).toEqual('');
        expect(decoder.verify('hello')).toEqual('hello');
    });

    it('decodes numbers', () => {
        expect(decoder.verify(0)).toEqual(0);
        expect(decoder.verify(0.0)).toEqual(0.0);
        expect(decoder.verify(3.141529)).toEqual(3.141529);
        expect(decoder.verify(-3.141529)).toEqual(-3.141529);
    });

    it('decodes booleans', () => {
        expect(decoder.verify(true)).toEqual(true);
        expect(decoder.verify(false)).toEqual(false);
    });

    it('decodes JSON arrays', () => {
        expect(decoder.verify([])).toEqual([]);
        expect(decoder.verify([1, true, 'hi'])).toEqual([1, true, 'hi']);
        expect(decoder.verify([[1], [[true, 'hi']]])).toEqual([[1], [[true, 'hi']]]);
        expect(decoder.verify([[1], [{ a: true, b: 'hi' }]])).toEqual([
            [1],
            [{ a: true, b: 'hi' }],
        ]);
    });

    it('decodes JSON objects', () => {
        expect(decoder.verify({})).toEqual({});
        expect(decoder.verify({ a: 1, b: true, c: 'hi' })).toEqual({
            a: 1,
            b: true,
            c: 'hi',
        });
        expect(decoder.verify({ a: { a: { a: [1] } } })).toEqual({
            a: { a: { a: [1] } },
        });
    });

    it('invalid', () => {
        expect(() => decoder.verify(undefined)).toThrow();
        expect(() => decoder.verify(NaN)).toThrow();
        expect(() => decoder.verify(new Date())).toThrow();
        expect(() => decoder.verify([new Date()])).toThrow();
        expect(() => decoder.verify({ a: new Date() })).toThrow();
    });
});

describe('jsonObject', () => {
    const decoder = jsonObject;

    it('decodes JSON objects', () => {
        expect(decoder.verify({})).toEqual({});
        expect(decoder.verify({ a: 1, b: true, c: 'hi' })).toEqual({
            a: 1,
            b: true,
            c: 'hi',
        });
        expect(decoder.verify({ a: { a: { a: [1] } } })).toEqual({
            a: { a: { a: [1] } },
        });
    });

    it('invalid', () => {
        expect(() => decoder.verify(null)).toThrow();
        expect(() => decoder.verify('')).toThrow();
        expect(() => decoder.verify('hi')).toThrow();
        expect(() => decoder.verify(0)).toThrow();
        expect(() => decoder.verify(-3.1415)).toThrow();
        expect(() => decoder.verify(42)).toThrow();
        expect(() => decoder.verify(true)).toThrow();
        expect(() => decoder.verify(false)).toThrow();
        expect(() => decoder.verify(undefined)).toThrow();
        expect(() => decoder.verify(NaN)).toThrow();
        expect(() => decoder.verify([])).toThrow();
        expect(() => decoder.verify([1])).toThrow();
        expect(() => decoder.verify(['hi'])).toThrow();
        expect(() => decoder.verify(new Date())).toThrow();
        expect(() => decoder.verify([new Date()])).toThrow();
        expect(() => decoder.verify({ a: new Date() })).toThrow();
    });
});

describe('jsonArray', () => {
    const decoder = jsonArray;

    it('decodes JSON arrays', () => {
        expect(decoder.verify([])).toEqual([]);
        expect(decoder.verify([1, true, 'hi'])).toEqual([1, true, 'hi']);
        expect(decoder.verify([[1], [[true, 'hi']]])).toEqual([[1], [[true, 'hi']]]);
        expect(decoder.verify([[1], [{ a: true, b: 'hi' }]])).toEqual([
            [1],
            [{ a: true, b: 'hi' }],
        ]);
    });

    it('invalid', () => {
        expect(() => decoder.verify(null)).toThrow();
        expect(() => decoder.verify('')).toThrow();
        expect(() => decoder.verify('hi')).toThrow();
        expect(() => decoder.verify(0)).toThrow();
        expect(() => decoder.verify(-3.1415)).toThrow();
        expect(() => decoder.verify(42)).toThrow();
        expect(() => decoder.verify(true)).toThrow();
        expect(() => decoder.verify(false)).toThrow();
        expect(() => decoder.verify(undefined)).toThrow();
        expect(() => decoder.verify(NaN)).toThrow();
        expect(() => decoder.verify({})).toThrow();
        expect(() => decoder.verify({ a: 1, b: true, c: 'hi' })).toThrow();
        expect(() => decoder.verify({ a: { a: { a: [1] } } })).toThrow();
        expect(() => decoder.verify(new Date())).toThrow();
        expect(() => decoder.verify([new Date()])).toThrow();
        expect(() => decoder.verify({ a: new Date() })).toThrow();
    });
});
