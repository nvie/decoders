/* eslint-disable */

module.exports = {
    env: {
        es6: true,
        jest: true,
    },
    extends: ['eslint:recommended'],
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module',
        ecmaFeatures: {
            arrowFunctions: true,
            binaryLiterals: true,
            blockBindings: true,
            classes: true,
            defaultParams: true,
            destructuring: true,
            forOf: true,
            generators: true,
            jsx: true,
            modules: true,
            objectLiteralComputedProperties: true,
            objectLiteralDuplicateProperties: true,
            objectLiteralShorthandMethods: true,
            objectLiteralShorthandProperties: true,
            octalLiterals: true,
            regexUFlag: true,
            regexYFlag: true,
            spread: true,
            superInFunctions: true,
            templateStrings: true,
            unicodeCodePointEscapes: true,
            globalReturn: true,
            experimentalObjectRestSpread: true,
        },
    },
    plugins: ['eslint-plugin-flowtype', 'eslint-plugin-sort-imports-es6-autofix'],
    globals: {
        process: false,
    },
    rules: {
        eqeqeq: ['error', 'always'],
        'linebreak-style': ['error', 'unix'],
        'no-unused-vars': ['error', { argsIgnorePattern: '^_+$' }],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'always'],
        'padding-line-between-statements': [
            'error',
            // Disallow whitespace between import statements
            { blankLine: 'never', prev: 'import', next: 'import' },
            // Enable whitespace between case statements
            { blankLine: 'always', prev: ['case', 'default'], next: '*' },
        ],

        'flowtype/boolean-style': [2, 'boolean'],
        'flowtype/define-flow-type': 1,
        'flowtype/delimiter-dangle': 0,
        'flowtype/generic-spacing': [2, 'never'],
        'flowtype/no-weak-types': 0,
        'flowtype/require-parameter-type': 0,
        'flowtype/require-return-type': 0,
        'flowtype/require-valid-file-annotation': 0,
        'flowtype/semi': 0,
        'flowtype/space-after-type-colon': [2, 'always'],
        'flowtype/space-before-generic-bracket': [2, 'never'],
        'flowtype/space-before-type-colon': [2, 'never'],
        'flowtype/type-id-match': 0,
        'flowtype/union-intersection-spacing': [2, 'always'],
        'flowtype/use-flow-type': 1,
        'flowtype/valid-syntax': 1,

        'no-restricted-syntax': [
            'error',
            {
                selector: 'ForOfStatement',
                message:
                    'Avoid for..of loops in libraries, because they generate unneeded Babel iterator runtime support code in the bundle',
            },
            {
                selector: 'ForInStatement',
                message:
                    'for..in loops are never what you want. Loop over Object.keys() instead.',
            },
        ],

        'sort-imports-es6-autofix/sort-imports-es6': [
            2,
            {
                ignoreCase: true,
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
            },
        ],
    },
    settings: {
        flowtype: {
            onlyFilesWithFlowAnnotation: false,
        },
    },
};
