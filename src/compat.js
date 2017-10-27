// @flow
import { Result } from 'lemons';

import type { Decoder, Guard } from './index';
import {
    array,
    boolean,
    constant,
    dispatch,
    either,
    either3,
    either4,
    fail as fail_,
    field as field_,
    guard,
    hardcoded,
    mapping,
    null_,
    nullable as nullable_,
    number,
    object,
    optional as optional_,
    string,
    tuple2,
    undefined_,
} from './index';

/**
 * Converts a Guard, which used to be referred to as a Decoder 0.0.x, and
 * converts it, behaviourally, to a >=0.1 Decoder, so we can use it in decoder
 * composition. */
function g2d<T>(g: Guard<T>): Decoder<T> {
    return (blob: any) => {
        try {
            const result: T = g(blob);
            return Result.ok(result);
        } catch (err) {
            if ('blob' in err) {
                return Result.err(err.message);
            }

            // Re-throw it, it's something else
            throw err;
        }
    };
}

function convertObject<O: { [field: string]: Guard<any> }>(mapping: O): $ObjMap<O, <T>(Guard<T>) => Decoder<T>> {
    let output: { [field: string]: Decoder<*> } = {};
    for (const key of Object.keys(mapping)) {
        const g: Guard<*> = mapping[key];
        output[key] = g2d(g);
    }
    return output;
}

function convertGuardFactory<A, B>(dispatcher: A => Guard<B>): A => Decoder<B> {
    return (a: A) => {
        const guard = dispatcher(a);
        return g2d(guard);
    };
}

export const andThen = <A, B>(f: A => Guard<B>, g: Guard<A>) => guard(dispatch(g2d(g), convertGuardFactory(f)));
export const decodeNumber = () => guard(number);
export const decodeString = () => guard(string);
export const decodeBoolean = () => guard(boolean);
export const decodeNull = () => guard(null_);
export const decodeUndefined = () => guard(undefined_);
export const fail = (msg: string) => guard(fail_(msg));
export const decodeConstant = <T>(value: T) => guard(constant(value));
export const decodeField = <T>(field: string, g: Guard<T>) => guard(field_(field, g2d(g)));
export const decodeValue = <T>(value: T) => guard(hardcoded(value));
export const decodeArray = <T>(g: Guard<T>) => guard(array(g2d(g)));
export const decodeMap = <T>(g: Guard<T>) => guard(mapping(g2d(g)));
export const decodeObject = (o: { [field: string]: Guard<any> }) => guard(object(convertObject(o)));
export const optional = <T>(g: Guard<T>) => guard(optional_(g2d(g)));
export const nullable = <T>(g: Guard<T>) => guard(nullable_(g2d(g)));
export const decodeTuple2 = <T1, T2>(g1: Guard<T1>, g2: Guard<T2>) => guard(tuple2(g2d(g1), g2d(g2)));
export const oneOf = <T1, T2>(g1: Guard<T1>, g2: Guard<T2>) => guard(either(g2d(g1), g2d(g2)));
export const oneOf3 = <T1, T2, T3>(g1: Guard<T1>, g2: Guard<T2>, g3: Guard<T3>) =>
    guard(either3(g2d(g1), g2d(g2), g2d(g3)));
export const oneOf4 = <T1, T2, T3, T4>(g1: Guard<T1>, g2: Guard<T2>, g3: Guard<T3>, g4: Guard<T4>) =>
    guard(either4(g2d(g1), g2d(g2), g2d(g3), g2d(g4)));

export type { Guard as Decoder };
