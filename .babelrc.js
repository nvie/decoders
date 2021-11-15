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
                // loose: true,
                // targets: '> 5%',
                modules:
                    BABEL_ENV === 'esmodules'
                        ? false // e.g. "don't do module processing"
                        : 'commonjs',
                // exclude: [
                //     '@babel/plugin-transform-regenerator',
                //     '@babel/plugin-transform-spread',
                //     '@babel/plugin-transform-spread',
                // ],
            },
        ],
        '@babel/preset-flow',
    ],
    plugins: ['@babel/plugin-transform-runtime'],
};
