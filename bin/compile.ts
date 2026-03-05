import * as fs from 'fs';
import { build, type Options } from 'tsup';

const baseOptions: Options = {
  entry: fs.globSync('./test-compile/*.ts'),
  format: 'esm',
  dts: false,
  clean: true,
  treeshake: true,
};

await Promise.all([
  build({
    ...baseOptions,
    minify: false,
    outDir: './test-compile/dist/unminified',
  }),
  build({
    ...baseOptions,
    minify: true,
    outDir: './test-compile/dist/minified',
  }),
]);
