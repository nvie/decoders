// @flow strict

import * as Result from '../Result';

describe('Result', () => {
    const r1 = Result.ok(42);
    const r2 = Result.ok("I'm a string");
    const r3 = Result.err(new Error('Proper JS error'));
    const r4 = Result.err('a reason');

    it('toString', () => {
        expect(Result.toString(r1)).toBe('Ok(42)');
        expect(Result.toString(r2)).toBe("Ok(I'm a string)");
        expect(Result.toString(r3)).toBe('Err(Error: Proper JS error)');
        expect(Result.toString(r4)).toBe('Err(a reason)');
    });

    it('inspection', () => {
        expect(Result.isOk(r1)).toBe(true);
        expect(Result.isErr(r1)).toBe(false);
        expect(Result.isOk(r2)).toBe(true);
        expect(Result.isErr(r2)).toBe(false);
        expect(Result.isOk(r3)).toBe(false);
        expect(Result.isErr(r3)).toBe(true);
        expect(Result.isOk(r4)).toBe(false);
        expect(Result.isErr(r4)).toBe(true);
    });

    it('convenience constructors', () => {
        expect(Result.isOk(Result.ok(42))).toBe(true);
        expect(Result.isErr(Result.err('oops'))).toBe(true);
    });

    it('dispatching', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            Result.dispatch(
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
        expect(Result.value(Result.map(r1, (x) => x.toString()))).toBe('42');
        expect(Result.value(Result.map(r4, (x) => x.length))).toBeUndefined();
    });

    it('mapError', () => {
        expect(Result.unwrap(Result.mapError(r1, (_) => 'whoopsy'))).toBe(42);
        expect(Result.unwrap(Result.mapError(r2, (_) => 'whoopsy'))).toBe("I'm a string");
        expect(() => Result.unwrap(Result.mapError(r3, (_) => 'whoopsy'))).toThrow(
            'whoopsy',
        );
        expect(() => Result.unwrap(Result.mapError(r4, (_) => 'whoopsy'))).toThrow(
            'whoopsy',
        );
    });

    it('unwrapping', () => {
        expect(Result.unwrap(r1)).toBe(42);
        expect(Result.unwrap(r2)).toBe("I'm a string");
        expect(() => Result.unwrap(r3)).toThrow('Proper JS error');
        expect(() => Result.unwrap(r4)).toThrow('a reason');
    });

    it('expect', () => {
        class CustomErr extends Error {}
        expect(Result.expect(r1, 'foo')).toBe(42);
        expect(Result.expect(r2, 'foo')).toBe("I'm a string");
        expect(() => Result.expect(r3, 'foo')).toThrow('foo');
        expect(() => Result.expect(r3, new CustomErr('foo'))).toThrow('foo');
        expect(() => Result.expect(r3, new CustomErr('foo'))).toThrow(CustomErr);
    });

    it('withDefault', () => {
        expect(Result.withDefault(r1, 'foo')).toBe(42);
        expect(Result.withDefault(r2, 'foo')).toBe("I'm a string");
        expect(Result.withDefault(r3, 'foo')).toBe('foo');
        expect(Result.withDefault(r4, 'foo')).toBe('foo');
    });

    it('value', () => {
        expect(Result.value(r1)).toBe(42);
        expect(Result.value(r2)).toBe("I'm a string");
        expect(Result.value(r3)).toBeUndefined();
        expect(Result.value(r4)).toBeUndefined();
    });

    it('errValue', () => {
        expect(Result.errValue(r1)).toBeUndefined();
        expect(Result.errValue(r2)).toBeUndefined();
        expect(Result.errValue(r3)).toEqual(new Error('Proper JS error'));
        expect(Result.errValue(r4)).toEqual('a reason');
    });

    it('and (&&)', () => {
        const ok1 = Result.ok(42);
        const ok2 = Result.ok('hi');
        const err1 = Result.err('boo');
        const err2 = Result.err('bleh');

        expect(Result.and(ok1, ok2)).toBe(ok2);
        expect(Result.and(ok1, err1)).toBe(err1);
        expect(Result.and(err1, ok1)).toBe(err1);
        expect(Result.and(err1, err2)).toBe(err1);
        expect(Result.and(err2, err1)).toBe(err2);
    });

    it('or (||)', () => {
        const ok1 = Result.ok(42);
        const ok2 = Result.ok('hi');
        const err1 = Result.err('boo');
        const err2 = Result.err('bleh');

        expect(Result.or(ok1, ok2)).toBe(ok1);
        expect(Result.or(ok2, ok1)).toBe(ok2);
        expect(Result.or(ok1, err1)).toBe(ok1);
        expect(Result.or(err1, ok1)).toBe(ok1);
        expect(Result.or(err1, err2)).toBe(err2);
        expect(Result.or(err2, err1)).toBe(err1);
    });

    it('andThen', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            Result.andThen(r, (n) =>
                typeof n === 'number'
                    ? Result.ok(n * 2)
                    : Result.err('not a number')
            ),
        );
        expect(Result.value(v1)).toBe(84);
        expect(Result.isErr(v2)).toBe(true);
        expect(Result.isErr(v3)).toBe(true);
        expect(Result.isErr(v4)).toBe(true);
    });

    it('orElse', () => {
        const [v1, v2, v3, v4] = [r1, r2, r3, r4].map((r) =>
            // prettier-ignore
            Result.orElse(r,
                (e) => Result.ok('lesson learned: ' + e.toString())
            ),
        );
        expect(Result.value(v1)).toBe(42);
        expect(Result.value(v2)).toBe("I'm a string");
        expect(Result.value(v3)).toBe('lesson learned: Error: Proper JS error');
        expect(Result.value(v4)).toBe('lesson learned: a reason');
    });
});
