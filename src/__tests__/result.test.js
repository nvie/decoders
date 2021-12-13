// @flow strict

import {
    andThen,
    dispatch,
    err,
    expect as expect_, // To avoid conflict with Jest expect() calls
    isErr,
    isOk,
    mapError,
    mapOk,
    ok,
    orElse,
    toString,
    unwrap,
    withDefault,
} from '../result';

describe('Result', () => {
    const r1 = ok(42);
    const r2 = ok("I'm a string");
    const r3 = err(new Error('Proper JS error'));
    const r4 = err('a reason');

    it('toString', () => {
        expect(toString(r1)).toBe('Ok(42)');
        expect(toString(r2)).toBe("Ok(I'm a string)");
        expect(toString(r3)).toBe('Err(Error: Proper JS error)');
        expect(toString(r4)).toBe('Err(a reason)');
    });

    it('inspection', () => {
        expect(isOk(r1)).toBe(true);
        expect(isErr(r1)).toBe(false);
        expect(isOk(r2)).toBe(true);
        expect(isErr(r2)).toBe(false);
        expect(isOk(r3)).toBe(false);
        expect(isErr(r3)).toBe(true);
        expect(isOk(r4)).toBe(false);
        expect(isErr(r4)).toBe(true);
    });

    it('convenience constructors', () => {
        expect(isOk(ok(42))).toBe(true);
        expect(isErr(err('oops'))).toBe(true);
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

    it('withDefault', () => {
        expect(withDefault(r1, 'foo')).toBe(42);
        expect(withDefault(r2, 'foo')).toBe("I'm a string");
        expect(withDefault(r3, 'foo')).toBe('foo');
        expect(withDefault(r4, 'foo')).toBe('foo');
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

    // it('and (&&)', () => {
    //     const ok1 = ok(42);
    //     const ok2 = ok('hi');
    //     const err1 = err('boo');
    //     const err2 = err('bleh');

    //     expect(and(ok1, ok2)).toBe(ok2);
    //     expect(and(ok1, err1)).toBe(err1);
    //     expect(and(err1, ok1)).toBe(err1);
    //     expect(and(err1, err2)).toBe(err1);
    //     expect(and(err2, err1)).toBe(err2);
    // });

    // it('or (||)', () => {
    //     const ok1 = ok(42);
    //     const ok2 = ok('hi');
    //     const err1 = err('boo');
    //     const err2 = err('bleh');

    //     expect(or(ok1, ok2)).toBe(ok1);
    //     expect(or(ok2, ok1)).toBe(ok2);
    //     expect(or(ok1, err1)).toBe(ok1);
    //     expect(or(err1, ok1)).toBe(ok1);
    //     expect(or(err1, err2)).toBe(err2);
    //     expect(or(err2, err1)).toBe(err1);
    // });

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
        expect(isErr(v2)).toBe(true);
        expect(isErr(v3)).toBe(true);
        expect(isErr(v4)).toBe(true);
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
