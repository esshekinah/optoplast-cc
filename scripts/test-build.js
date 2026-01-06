#!/usr/bin/env node

// Simple build test script to check for common issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing build configuration...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.env.local',
  'app/layout.tsx',
  'app/page.tsx',
  'app/api/auth/[...nextauth]/route.ts'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check environment variables
console.log('\n🔐 Checking environment variables...');
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`⚠️  ${envVar} - NOT SET`);
  }
});

// Test TypeScript compilation
console.log('\n🔧 Testing TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout?.toString() || error.message);
}

// Test Next.js build (dry run)
console.log('\n🏗️  Testing Next.js build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Next.js build successful');
} catch (error) {
  console.log('❌ Next.js build failed:');
  console.log(error.stdout?.toString() || error.message);
}

console.log('\n🎉 Build test completed!');