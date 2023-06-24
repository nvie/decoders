const { NODE_ENV, BABEL_ENV } = process.env;

if (BABEL_ENV !== 'esmodules' && BABEL_ENV !== 'commonjs' && !NODE_ENV) {
    throw new Error('Please specify BABEL_ENV as either "esmodules" or "commonjs"');
}

const modules =
    NODE_ENV === 'test' || BABEL_ENV !== 'esmodules'
        ? 'commonjs'
        : // NOTE: This value confused me forever. False here does NOT mean
          // "don't use modules", but instead it means "don't _transpile_
          // modules (to another format)". Quite the opposite!
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
};
