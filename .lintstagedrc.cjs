module.exports = {
  // TypeScript files - relaxed checking for now
  '**/*.{ts,tsx}': [
    'prettier --write'
    // TODO: Re-enable ESLint when config is fixed
    // 'eslint --fix --max-warnings 0',
    // () => 'tsc --noEmit --skipLibCheck'
  ],
  
  // JavaScript files
  '**/*.{js,jsx}': [
    'prettier --write'
    // TODO: Re-enable ESLint when config is fixed
    // 'eslint --fix --max-warnings 0',
  ],
  
  // JSON files
  '**/*.json': [
    'prettier --write'
  ],
  
  // Markdown files
  '**/*.md': [
    'prettier --write'
  ],
  
  // Prisma schema
  'prisma/schema.prisma': [
    'prisma format'
  ]
};