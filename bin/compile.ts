import { rolldown } from 'rolldown';
import * as fs from 'fs';

const bundle = await rolldown({
  input: fs.globSync('./test-compile/*.ts'),
});

await Promise.all([
  bundle.write({
    dir: './test-compile/dist/unminified',
    format: 'esm',
    minify: 'dce-only',
  }),
  bundle.write({
    dir: './test-compile/dist/minified',
    format: 'esm',
    minify: true,
  }),
]);
