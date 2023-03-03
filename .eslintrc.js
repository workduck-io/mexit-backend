/**
 * parser: '@typescript-eslint/parser' tells ESLint to use the parser package.
 This allows ESLint to understand TypeScript syntax.
 This is required, or else ESLint will throw errors as it tries to parse TypeScript code as if it were regular JavaScript.
 plugins: ['@typescript-eslint'] tells ESLint to load the plugin package.
 This allows you to use the rules within your codebase.
 extends: [ ... ] tells ESLint that your config extends the given configurations.
 eslint:recommended is ESLint's inbuilt 'recommended' config - it turns on a small,
 sensible set of rules which lint for well-known best-practices.
 plugin:@typescript-eslint/recommended is our 'recommended' config - it's just like eslint:recommended, except it only turns on rules from TypeScript-specific plugin.


 * @type {{parser: string, extends: string[], plugins: string[], root: boolean}}
 */
module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort', 'import'],
  env: { es6: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    //'airbnb-typescript',
    'prettier',
    'plugin:node/recommended',
  ],
  rules: {
    'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
    'node/exports-style': ['error', 'module.exports'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.js'],
      rules: {
        'unused-imports/no-unused-imports': 'warn',
        'simple-import-sort/exports': 'warn',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        'simple-import-sort/imports': [
          'warn',
          {
            groups: [
              // Side effect imports.
              ['^\\u0000'],
              // Internal packages.
              ['^(@workduck-io)(/.*|$)'],
              // Third party @ packages first
              ['^@?\\w'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
};
