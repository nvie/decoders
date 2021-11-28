// @flow strict

import { summarize as _summarize } from '../_utils';
import type { Annotation } from '../annotate';

export function formatShort(ann: Annotation): string {
    return _summarize(ann, []).join('\n');
}
