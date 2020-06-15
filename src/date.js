// @flow strict

import { annotate } from 'debrief';
import { Err, Ok } from 'lemons/Result';

import type { Decoder } from './types';
import { isDate } from './utils';

// $FlowFixMe (not really an issue) - deliberate casting
type cast = any;

export const date: Decoder<Date> = (value: mixed) =>
    isDate(value) ? Ok(((value: cast): Date)) : Err(annotate(value, 'Must be a Date'));
