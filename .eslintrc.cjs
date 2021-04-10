module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.json', '.js', '.ts', '.css'],
      },
    },
  },
  rules: {
    'no-console': 'off',
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'no-param-reassign': [2, { props: false }],
    'no-unused-vars': [2, { args: 'none' }],
    'linebreak-style': ['error', (require('os').EOL === '\r\n' ? 'windows' : 'unix')],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        json: 'never',
        js: 'never',
        ts: 'never',
        css: 'never',
      },
    ],
  },
};
