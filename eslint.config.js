const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
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
      // 错误预防
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
      
      // 最佳实践
      'eqeqeq': ['warn', 'smart'],
      'curly': ['warn', 'multi-line'],
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
      
      // 变量声明
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-var': 'warn',
      'prefer-const': 'warn',
      
      // 代码风格 (由 Prettier 处理大部分)
      'semi': ['warn', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'indent': 'off', // 由 Prettier 处理
      'linebreak-style': 'off',
      
      // Node.js 特定
      'no-process-exit': 'off',
      'no-sync': 'off',
    },
  },
  {
    // 浏览器脚本特定配置
    files: ['src/site/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        'mermaid': 'readonly',
        'ForceGraph': 'readonly',
        'lucide': 'readonly',
        'Alpine': 'readonly',
        'FlexSearch': 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    // 测试文件和配置文件忽略某些规则
    files: ['*.config.js', '*.config.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // 忽略的文件
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/site/vendor/**',
      '*.min.js',
    ],
  },
];
