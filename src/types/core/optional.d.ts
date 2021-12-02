import { Decoder } from '../_types';

export function optional<T>(decoder: Decoder<T>): Decoder<T | undefined>;
export function nullable<T>(decoder: Decoder<T>): Decoder<T | null>;
export function maybe<T>(decoder: Decoder<T>): Decoder<T | null | undefined>;
