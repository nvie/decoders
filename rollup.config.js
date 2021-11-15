import babel from '@rollup/plugin-babel';

const plugins = [
    babel({
        babelHelpers: 'runtime',
        plugins: ['@babel/plugin-transform-runtime'],
    }),
];

export default {
    external: [/@babel\/runtime/, 'debrief'],
    input: 'src/index.js',
    plugins,
    output: {
        format: 'es',
        file: 'dist/es/index.js',
    },
};
