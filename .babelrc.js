// @flow strict

const { NODE_ENV, BABEL_ENV } = process.env;

if (BABEL_ENV !== 'esmodules' && BABEL_ENV !== 'commonjs' && !NODE_ENV) {
    throw new Error('Please specify BABEL_ENV as either "esmodules" or "commonjs"');
}

const modules =
    NODE_ENV === 'test' || BABEL_ENV !== 'esmodules'
        ? 'commonjs'
        : // e.g. "don't do module processing"
          false;

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                loose: true,
                modules,
            },
        ],
        '@babel/preset-flow',
    ],
    // plugins: ['@babel/plugin-transform-runtime'],
};
