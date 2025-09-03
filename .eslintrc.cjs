module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'node_modules', '**/templates/**'],
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript strict rules - ZERO TOLERANCE
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': ['error', {
      'checksVoidReturn': false
    }],
    
    // Ban dangerous TypeScript suppressions
    '@typescript-eslint/ban-ts-comment': ['error', { 
      'ts-ignore': true, 
      'ts-nocheck': true,
      'ts-expect-error': 'allow-with-description'
    }],
    
    // Additional safety rules for exactOptionalPropertyTypes
    '@typescript-eslint/no-non-null-assertion': 'warn', // Allow ! but warn
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    
    // General rules - STRICT
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'no-implicit-coercion': 'error',
    'no-param-reassign': 'error',
  },
  overrides: [
    {
      files: ['apps/web/**/*'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      plugins: ['react', 'react-hooks', 'jsx-a11y'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '*.config.js',
    '*.config.ts',
    'coverage/',
  ],
};
