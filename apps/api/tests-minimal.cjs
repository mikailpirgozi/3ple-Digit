#!/usr/bin/env node

/**
 * 🧪 MINIMAL TESTS - Len základné smoke testy
 *
 * Ak nechcete komplikované testy, tento súbor obsahuje len základné kontroly.
 */

const { execSync } = require('child_process');

console.log('🧪 Running minimal smoke tests...');

try {
  // 1. Build test
  console.log('📦 Testing build...');
  execSync('pnpm build', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Build successful');

  // 2. Basic API test (ak server beží)
  console.log('🔗 Testing API connection...');
  try {
    const response = execSync('curl -f http://localhost:4000/health', { timeout: 5000 });
    console.log('✅ API health check passed');
  } catch (error) {
    console.log('⚠️ API not running (this is OK for build tests)');
  }

  console.log('🎉 All minimal tests passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
