// @flow strict

import {
    andThen,
    dispatch,
    err,
    expect as expect_, // To avoid conflict with Jest expect() calls
    mapError,
    mapOk,
    ok,
    orElse,
    unwrap,
} from '../result';

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

    it('dispatching', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            dispatch(
                r,
                () => "I'm a success",
                () => "I'm an error",
            ),
        );
        expect(v1).toBe("I'm a success");
        expect(v2).toBe("I'm a success");
        expect(v3).toBe("I'm an error");
        expect(v4).toBe("I'm an error");
    });

    it('map', () => {
        expect(mapOk(r1, (x) => x.toString()).value).toBe('42');
        expect(mapOk(r4, (x) => x.length).value).toBeUndefined();
    });

    it('mapError', () => {
        expect(unwrap(mapError(r1, (_) => 'whoopsy'))).toBe(42);
        expect(unwrap(mapError(r2, (_) => 'whoopsy'))).toBe("I'm a string");
        expect(() => unwrap(mapError(r3, (_) => 'whoopsy'))).toThrow('whoopsy');
        expect(() => unwrap(mapError(r4, (_) => 'whoopsy'))).toThrow('whoopsy');
    });

    it('unwrapping', () => {
        expect(unwrap(r1)).toBe(42);
        expect(unwrap(r2)).toBe("I'm a string");
        expect(() => unwrap(r3)).toThrow('Proper JS error');
        expect(() => unwrap(r4)).toThrow('a reason');
    });

    it('expect', () => {
        class CustomErr extends Error {}
        expect(expect_(r1, 'foo')).toBe(42);
        expect(expect_(r2, 'foo')).toBe("I'm a string");
        expect(() => expect_(r3, 'foo')).toThrow('foo');
        expect(() => expect_(r3, new CustomErr('foo'))).toThrow('foo');
        expect(() => expect_(r3, new CustomErr('foo'))).toThrow(CustomErr);
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

    it('orElse', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            orElse(r,
                (e) => ok('lesson learned: ' + e.toString())
            ),
        );
        expect(v1.value).toBe(42);
        expect(v2.value).toBe("I'm a string");
        expect(v3.value).toBe('lesson learned: Error: Proper JS error');
        expect(v4.value).toBe('lesson learned: a reason');
    });
});
