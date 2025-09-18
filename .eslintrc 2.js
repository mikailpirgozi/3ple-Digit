module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ['eslint:recommended', '@typescript-eslint/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // 🎯 ONLY CRITICAL ERRORS - NO WARNINGS AS ERRORS
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn', // Warning, not error
    '@typescript-eslint/no-unsafe-assignment': 'off', // Too noisy
    '@typescript-eslint/no-unsafe-member-access': 'off', // Too noisy
    '@typescript-eslint/no-unsafe-call': 'off', // Too noisy
    '@typescript-eslint/no-unsafe-return': 'off', // Too noisy
    '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Warning only
    'no-console': 'warn', // Warning only
    'no-unused-vars': 'off', // Use TS version instead
  },
};
