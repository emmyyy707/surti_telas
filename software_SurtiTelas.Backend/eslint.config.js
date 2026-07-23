const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/migrations/**', 'eslint.config.js', '*.js', 'scripts/**', '.kilo/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
