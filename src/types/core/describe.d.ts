import { Decoder } from '../_decoder';

export function describe<T>(decoder: Decoder<T>, msg: string): Decoder<T>;
