import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    splitting: true,
    clean: true,
    target: 'es2020',
    format: ['cjs', 'esm'],

    // Perhaps enable later?
    minify: true,
    sourcemap: true,
});
