// @flow strict

import { summarize as _summarize } from '../_utils';
import type { Annotation } from '../annotate';

function public_summarize(ann: Annotation): Array<string> {
    return _summarize(ann, []);
}

export { public_summarize as summarize };
