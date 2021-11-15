// @flow strict
/* eslint-disable no-restricted-syntax */

import { guard } from '../guard';
import { json, jsonArray, jsonObject } from '../json';

describe('decoder', () => {
    const decoder = json;

    it('decodes null', () => {
        expect(guard(decoder)(null)).toEqual(null);
    });

    it('decodes strings', () => {
        expect(guard(decoder)('')).toEqual('');
        expect(guard(decoder)('hello')).toEqual('hello');
    });

    it('decodes numbers', () => {
        expect(guard(decoder)(0)).toEqual(0);
        expect(guard(decoder)(0.0)).toEqual(0.0);
        expect(guard(decoder)(3.141529)).toEqual(3.141529);
        expect(guard(decoder)(-3.141529)).toEqual(-3.141529);
    });

    it('decodes booleans', () => {
        expect(guard(decoder)(true)).toEqual(true);
        expect(guard(decoder)(false)).toEqual(false);
    });

    it('decodes JSON arrays', () => {
        expect(guard(decoder)([])).toEqual([]);
        expect(guard(decoder)([1, true, 'hi'])).toEqual([1, true, 'hi']);
        expect(guard(decoder)([[1], [[true, 'hi']]])).toEqual([[1], [[true, 'hi']]]);
        expect(guard(decoder)([[1], [{ a: true, b: 'hi' }]])).toEqual([
            [1],
            [{ a: true, b: 'hi' }],
        ]);
    });

    it('decodes JSON objects', () => {
        expect(guard(decoder)({})).toEqual({});
        expect(guard(decoder)({ a: 1, b: true, c: 'hi' })).toEqual({
            a: 1,
            b: true,
            c: 'hi',
        });
        expect(guard(decoder)({ a: { a: { a: [1] } } })).toEqual({
            a: { a: { a: [1] } },
        });
    });

    it('invalid', () => {
        expect(() => guard(decoder)(undefined)).toThrow();
        expect(() => guard(decoder)(NaN)).toThrow();
        expect(() => guard(decoder)(new Date())).toThrow();
        expect(() => guard(decoder)([new Date()])).toThrow();
        expect(() => guard(decoder)({ a: new Date() })).toThrow();
    });
});

describe('jsonObject', () => {
    const decoder = jsonObject;

    it('decodes JSON objects', () => {
        expect(guard(decoder)({})).toEqual({});
        expect(guard(decoder)({ a: 1, b: true, c: 'hi' })).toEqual({
            a: 1,
            b: true,
            c: 'hi',
        });
        expect(guard(decoder)({ a: { a: { a: [1] } } })).toEqual({
            a: { a: { a: [1] } },
        });
    });

    it('invalid', () => {
        expect(() => guard(decoder)(null)).toThrow();
        expect(() => guard(decoder)('')).toThrow();
        expect(() => guard(decoder)('hi')).toThrow();
        expect(() => guard(decoder)(0)).toThrow();
        expect(() => guard(decoder)(-3.1415)).toThrow();
        expect(() => guard(decoder)(42)).toThrow();
        expect(() => guard(decoder)(true)).toThrow();
        expect(() => guard(decoder)(false)).toThrow();
        expect(() => guard(decoder)(undefined)).toThrow();
        expect(() => guard(decoder)(NaN)).toThrow();
        expect(() => guard(decoder)([])).toThrow();
        expect(() => guard(decoder)([1])).toThrow();
        expect(() => guard(decoder)(['hi'])).toThrow();
        expect(() => guard(decoder)(new Date())).toThrow();
        expect(() => guard(decoder)([new Date()])).toThrow();
        expect(() => guard(decoder)({ a: new Date() })).toThrow();
    });
});

describe('jsonArray', () => {
    const decoder = jsonArray;

    it('decodes JSON arrays', () => {
        expect(guard(decoder)([])).toEqual([]);
        expect(guard(decoder)([1, true, 'hi'])).toEqual([1, true, 'hi']);
        expect(guard(decoder)([[1], [[true, 'hi']]])).toEqual([[1], [[true, 'hi']]]);
        expect(guard(decoder)([[1], [{ a: true, b: 'hi' }]])).toEqual([
            [1],
            [{ a: true, b: 'hi' }],
        ]);
    });

    it('invalid', () => {
        expect(() => guard(decoder)(null)).toThrow();
        expect(() => guard(decoder)('')).toThrow();
        expect(() => guard(decoder)('hi')).toThrow();
        expect(() => guard(decoder)(0)).toThrow();
        expect(() => guard(decoder)(-3.1415)).toThrow();
        expect(() => guard(decoder)(42)).toThrow();
        expect(() => guard(decoder)(true)).toThrow();
        expect(() => guard(decoder)(false)).toThrow();
        expect(() => guard(decoder)(undefined)).toThrow();
        expect(() => guard(decoder)(NaN)).toThrow();
        expect(() => guard(decoder)({})).toThrow();
        expect(() => guard(decoder)({ a: 1, b: true, c: 'hi' })).toThrow();
        expect(() => guard(decoder)({ a: { a: { a: [1] } } })).toThrow();
        expect(() => guard(decoder)(new Date())).toThrow();
        expect(() => guard(decoder)([new Date()])).toThrow();
        expect(() => guard(decoder)({ a: new Date() })).toThrow();
    });
});
