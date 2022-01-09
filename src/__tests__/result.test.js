// @flow strict

import { andThen, err, ok } from '../result';

describe('Result', () => {
    const r1 = ok(42);
    const r2 = ok("I'm a string");
    const r3 = err(new Error('Proper JS error'));
    const r4 = err('a reason');

    it('inspection', () => {
        expect(r1.ok).toBe(true);
        expect(r2.ok).toBe(true);
        expect(r3.ok).toBe(false);
        expect(r4.ok).toBe(false);
    });

    it('convenience constructors', () => {
        expect(ok(42).ok).toBe(true);
        expect(err('oops').ok).toBe(false);
    });

    it('value access', () => {
        expect(r1.value).toBe(42);
        expect(r2.value).toBe("I'm a string");
        expect(r3.value).toBeUndefined();
        expect(r4.value).toBeUndefined();
    });

    it('error access', () => {
        expect(r1.error).toBeUndefined();
        expect(r2.error).toBeUndefined();
        expect(r3.error).toEqual(new Error('Proper JS error'));
        expect(r4.error).toEqual('a reason');
    });

    it('andThen', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            andThen(r, (n) =>
                typeof n === 'number'
                    ? ok(n * 2)
                    : err('not a number')
            ),
        );
        expect(v1.value).toBe(84);
        expect(v2.ok).toBe(false);
        expect(v3.ok).toBe(false);
        expect(v4.ok).toBe(false);
    });
});
