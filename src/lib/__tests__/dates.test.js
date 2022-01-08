// @flow strict
/* eslint-disable no-restricted-syntax */

import { date, iso8601 } from '../dates';
import { INPUTS } from './_fixtures';
import { partition } from 'itertools';

describe('dates', () => {
    const decoder = date;
    const [okay, not_okay] = partition(
        INPUTS,
        (o) =>
            // $FlowFixMe[method-unbinding]
            Object.prototype.toString.call(o) === '[object Date]' && !isNaN(o),
    );

    it('valid', () => {
        expect(okay.length).not.toBe(0);
        for (const value of okay) {
            expect(decoder.verify(value)).toBe(value);
        }
    });

    it('invalid', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(() => decoder.verify(value)).toThrow();
        }
    });
});

describe('iso8601 dates', () => {
    const decoder = iso8601;

    it('invalid', () => {
        // None of the values in INPUTS are valid ISO8601 strings
        const not_okay = INPUTS;
        for (const value of not_okay) {
            expect(() => decoder.verify(value)).toThrow();
        }
    });

    it('decodes ISO dates', () => {
        expect(decoder.verify('2020-06-22T10:57:33Z')).toEqual(
            new Date('2020-06-22T10:57:33Z'),
        );
        expect(decoder.verify('2020-06-22T10:57:33+02:00')).toEqual(
            new Date('2020-06-22T08:57:33Z'),
        );

        // Note: Feb 30 does not exist, but the Date constructor "fixes" that
        expect(decoder.verify('2020-02-30T10:57:33+02:00')).toEqual(
            new Date('2020-03-01T08:57:33Z'),
        );
    });

    it('rejects invalid dates', () => {
        // Syntactically invalid
        expect(() => decoder.verify('03/04/2000')).toThrow();
        expect(() => decoder.verify('2020-06-22T10:57:33')).toThrow();

        // Semantically invalid (these dates don't exist)
        expect(() => decoder.verify('2020-03-32T10:57:33Z')).toThrow();
        expect(() => decoder.verify('0099-16-48T10:57:33Z')).toThrow();
    });
});
