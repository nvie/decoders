/// <reference lib="es6" />

import { Decoder } from '../_types';

export const poja: Decoder<unknown[]>;
export function array<T>(decoder: Decoder<T>): Decoder<T[]>;
export function nonEmptyArray<T>(decoder: Decoder<T>): Decoder<[T, ...T[]]>;
export function set<T>(decoder: Decoder<T>): Decoder<Set<T>>;
