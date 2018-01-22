// @flow

import type { Decoder } from './types';
import { isDate, predicate } from './utils';

export const date: Decoder<Date> = predicate(isDate, 'Must be a Date');
