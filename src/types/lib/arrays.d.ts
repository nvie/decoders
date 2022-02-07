/// <reference lib="es6" />

import { Decoder } from '../Decoder';

/**
 * Accepts any array, but doesn't validate its items further.
 *
 * "poja" means "plain old JavaScript array", a play on `pojo()`.
 */
export const poja: Decoder<unknown[]>;

/**
 * Accepts arrays of whatever the given decoder accepts.
 */
export function array<T>(decoder: Decoder<T>): Decoder<T[]>;

/**
 * Like `array()`, but will reject arrays with 0 elements.
 */
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<[T, ...T[]]>;

/**
 * Similar to `array()`, but returns the result as an [ES6
 * Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 */
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>>;

/**
 * Accepts a tuple (an array with exactly _n_ items) of values accepted by the
 * _n_ given decoders.
 */
export function tuple<A>(a: Decoder<A>): Decoder<[A]>;
export function tuple<A, B>(a: Decoder<A>, b: Decoder<B>): Decoder<[A, B]>;
export function tuple<A, B, C>(
    a: Decoder<A>,
    b: Decoder<B>,
    c: Decoder<C>,
): Decoder<[A, B, C]>;
export function tuple<A, B, C, D>(
    a: Decoder<A>,
    b: Decoder<B>,
    c: Decoder<C>,
    d: Decoder<D>,
): Decoder<[A, B, C, D]>;
export function tuple<A, B, C, D, E>(
    a: Decoder<A>,
    b: Decoder<B>,
    c: Decoder<C>,
    d: Decoder<D>,
    e: Decoder<E>,
): Decoder<[A, B, C, D, E]>;
export function tuple<A, B, C, D, E, F>(
    a: Decoder<A>,
    b: Decoder<B>,
    c: Decoder<C>,
    d: Decoder<D>,
    e: Decoder<E>,
    f: Decoder<F>,
): Decoder<[A, B, C, D, E, F]>;
