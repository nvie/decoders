// @flow strict

import { indent } from './utils';
import { isAnnotation } from './types';
import annotate, { annotateFields } from './annotate';
import serialize from './serialize';
import summarize from './summarize';
import type { Annotation } from './types';

export type { Annotation };
export { annotate, annotateFields, indent, isAnnotation, serialize, summarize };
