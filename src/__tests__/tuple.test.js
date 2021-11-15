// @flow strict
/* eslint-disable no-restricted-syntax */

import * as Result from '../Result';
import { number } from '../number';
import { string } from '../string';
import { tuple1, tuple2, tuple3, tuple4, tuple5, tuple6 } from '../tuple';

describe('tuples', () => {
    it('tuple1', () => {
        const decoder = tuple1(string);
        expect(Result.unwrap(decoder(['foo']))).toEqual(['foo']);
        expect(Result.isErr(decoder(['foo', 'bar']))).toBe(true);
        expect(Result.isErr(decoder([42]))).toBe(true);
        expect(Result.isErr(decoder([42, 13]))).toBe(true);

        // Invalid
        expect(Result.isErr(decoder('not an array'))).toBe(true);
        expect(Result.isErr(decoder(undefined))).toBe(true);

        // Wrong arity (not a 1-tuple)
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder(['foo', 42, true]))).toBe(true);
    });

    it('tuple2', () => {
        const decoder = tuple2(string, number);
        expect(Result.unwrap(decoder(['foo', 42]))).toEqual(['foo', 42]);
        expect(Result.isErr(decoder(['foo', 'bar']))).toBe(true);
        expect(Result.isErr(decoder([42, 'foo']))).toBe(true);
        expect(Result.isErr(decoder([42, 13]))).toBe(true);

        // Invalid
        expect(Result.isErr(decoder('not an array'))).toBe(true);
        expect(Result.isErr(decoder(undefined))).toBe(true);

        // Wrong arity (not a 2-tuple)
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder(['foo']))).toBe(true);
        expect(Result.isErr(decoder(['foo', 42, true]))).toBe(true);
    });

    it('tuple3', () => {
        const decoder = tuple3(number, number, number);
        expect(Result.isOk(decoder([1, 2, 3]))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder([1]))).toBe(true);
        expect(Result.isErr(decoder([1, 2]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 'foo']))).toBe(true);
        expect(Result.isErr(decoder([1, 'foo', 2]))).toBe(true);
        expect(Result.isErr(decoder(['foo', 1, 2]))).toBe(true);
    });

    it('tuple4', () => {
        const decoder = tuple4(number, number, number, number);
        expect(Result.isOk(decoder([1, 2, 3, 4]))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder([1]))).toBe(true);
        expect(Result.isErr(decoder([1, 2]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 'foo']))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 'foo', 3]))).toBe(true);
        expect(Result.isErr(decoder([1, 'foo', 2, 3]))).toBe(true);
        expect(Result.isErr(decoder(['foo', 1, 2, 3]))).toBe(true);
    });

    it('tuple5', () => {
        const decoder = tuple5(number, number, number, number, number);
        expect(Result.isOk(decoder([1, 2, 3, 4, 5]))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder([1]))).toBe(true);
        expect(Result.isErr(decoder([1, 2]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4, 'foo']))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 'foo', 4]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 'foo', 3, 4]))).toBe(true);
        expect(Result.isErr(decoder([1, 'foo', 2, 3, 4]))).toBe(true);
        expect(Result.isErr(decoder(['foo', 1, 2, 3, 4]))).toBe(true);
    });

    it('tuple6', () => {
        const decoder = tuple6(number, number, number, number, number, number);
        expect(Result.isOk(decoder([1, 2, 3, 4, 5, 6]))).toBe(true);
        expect(Result.isErr(decoder([]))).toBe(true);
        expect(Result.isErr(decoder([1]))).toBe(true);
        expect(Result.isErr(decoder([1, 2]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4, 5]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4, 5, 'foo']))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 4, 'foo', 5]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 3, 'foo', 4, 5]))).toBe(true);
        expect(Result.isErr(decoder([1, 2, 'foo', 3, 4, 5]))).toBe(true);
        expect(Result.isErr(decoder([1, 'foo', 2, 3, 4, 5]))).toBe(true);
        expect(Result.isErr(decoder(['foo', 1, 2, 3, 4, 5]))).toBe(true);
    });
});
