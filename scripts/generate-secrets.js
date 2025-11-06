#!/usr/bin/env node

/**
 * Generate Secrets Script
 * Generates secure random secrets for production deployment
 */

import crypto from 'crypto';

/**
 * Generate a secure random string
 * @param {number} bytes - Number of random bytes
 * @returns {string} Base64-encoded random string
 */
function generateSecret(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64');
}

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
  return crypto.randomUUID();
}

console.log('='.repeat(60));
console.log('FPSgame Secret Generator');
console.log('='.repeat(60));
console.log('');
console.log('🔐 Generated Secrets (copy these to your deployment):');
console.log('');

// JWT Secret
const jwtSecret = generateSecret(32);
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Shop Signing Key
const shopKey = generateSecret(32);
console.log('SHOP_SIGNING_KEY:');
console.log(shopKey);
console.log('');

// Generate some UUIDs for reference
console.log('📦 Sample UUIDs (for testing):');
for (let i = 0; i < 3; i++) {
  console.log(`  ${generateUUID()}`);
}
console.log('');

console.log('='.repeat(60));
console.log('📋 Next Steps:');
console.log('='.repeat(60));
console.log('');
console.log('1. Set secrets in Fly.io:');
console.log('   fly secrets set JWT_SECRET="<generated-value>"');
console.log('   fly secrets set SHOP_SIGNING_KEY="<generated-value>"');
console.log('');
console.log('2. Set secrets in GitHub Actions:');
console.log('   Repository Settings → Secrets → Actions');
console.log('   Add FLY_API_TOKEN, VERCEL_TOKEN, etc.');
console.log('');
console.log('3. Set environment variables in Vercel:');
console.log('   Project Settings → Environment Variables');
console.log('   Add VITE_PUBLIC_API_ORIGIN and VITE_PUBLIC_WSS_URL');
console.log('');
console.log('⚠️  IMPORTANT: Keep these secrets safe!');
console.log('   - Never commit them to Git');
console.log('   - Store them securely (password manager)');
console.log('   - Rotate regularly (every 3-6 months)');
console.log('');
