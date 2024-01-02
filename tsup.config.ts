import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/format.ts', 'src/result.ts'],
  dts: true,
  splitting: true,
  clean: true,
  // target: /* what tsconfig specifies */,
  format: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
});
