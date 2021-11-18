module.exports = {
  root: true
, parser: '@typescript-eslint/parser'
, plugins: [
    '@typescript-eslint'
  ]
, extends: [
    'eslint:recommended'
  , 'plugin:@typescript-eslint/recommended'
  ]
, rules: {
    'no-empty': 'off'
  , '@typescript-eslint/ban-types': 'off'
  , '@typescript-eslint/ban-ts-comment': 'off'
  }
}
