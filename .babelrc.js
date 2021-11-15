// @flow strict

const { BABEL_ENV } = process.env;

if (BABEL_ENV !== 'esmodules' && BABEL_ENV !== 'commonjs') {
    throw new Error('Please specify BABEL_ENV as either "esmodules" or "commonjs"');
}

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: BABEL_ENV === 'esmodules',
            },
        ],
        '@babel/preset-flow',
    ],
};
