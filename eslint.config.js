const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'src/site/vendor/**',
      '*.min.js',
      '.cache/**',
      '*.log',
    ],
  },
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-extra-semi': 'warn',
      'no-func-assign': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'warn',
      'valid-typeof': 'error',
      'eqeqeq': ['warn', 'smart'],
      curly: ['warn', 'multi-line'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'warn',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'warn',
      'no-throw-literal': 'warn',
      'no-unused-expressions': 'off',
      'no-useless-call': 'warn',
      'no-useless-concat': 'warn',
      'no-void': 'warn',
      'wrap-iife': ['warn', 'inside'],
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-var': 'warn',
      'prefer-const': 'warn',
      semi: ['warn', 'always'],
      quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      indent: 'off',
      'linebreak-style': 'off',
      'no-process-exit': 'off',
      'no-sync': 'off',
    },
  },
  {
    files: ['src/site/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        mermaid: 'readonly',
        ForceGraph: 'readonly',
        lucide: 'readonly',
        Alpine: 'readonly',
        FlexSearch: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/client/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ForceGraph: 'readonly',
        FlexSearch: 'readonly',
        lucide: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['*.config.js', '*.config.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
];
