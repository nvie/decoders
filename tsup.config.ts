import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  splitting: true,
  clean: true,
  // target: /* what tsconfig specifies */,
  format: ['esm', 'cjs'],
});
