module.exports = {
  // TypeScript files - strict checking
  '**/*.{ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
    // Type check only staged files (faster than full project)
    () => 'tsc --noEmit --skipLibCheck'
  ],
  
  // JavaScript files
  '**/*.{js,jsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write'
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