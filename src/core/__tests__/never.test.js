// @flow strict
/* eslint-disable no-restricted-syntax */

import { fail, never } from '../never';
import { INPUTS } from './fixtures';

describe('fail', () => {
    const decoder = fail('I always fail');
    const not_okay = INPUTS;

    it('accepts nothing', () => {
        // Nothing is valid for a failing decoder :)
    });

    it('rejects everything', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});

describe('never', () => {
    const decoder = never('I always fail');
    const not_okay = INPUTS;

    it('accepts nothing', () => {
        // Nothing is valid for a failing decoder :)
    });

    it('rejects everything', () => {
        expect(not_okay.length).not.toBe(0);
        for (const value of not_okay) {
            expect(decoder.decode(value).ok).toBe(false);
        }
    });
});
