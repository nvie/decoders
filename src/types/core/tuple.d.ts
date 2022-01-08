import { Decoder } from '../_decoder';

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
