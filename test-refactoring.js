#!/usr/bin/env node

/**
 * Test Script for Refactoring Improvements
 * Run with: node test-refactoring.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Refactoring Improvements...\n');

// Test 1: Check if new files exist
const newFiles = [
  'src/types/api.ts',
  'src/components/ErrorBoundary.tsx',
  'src/hooks/useRetry.ts',
  'src/components/LoadingStates.tsx',
  'src/hooks/usePerformance.ts'
];

console.log('📁 Checking new files...');
newFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test 2: Check if components use React.memo
const memoComponents = [
  'src/components/Pets/PetCard.tsx',
  'src/components/Pets/SearchFilterHeader.tsx'
];

console.log('\n🔧 Checking React.memo usage...');
memoComponents.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('React.memo')) {
      console.log(`✅ ${file} uses React.memo`);
    } else {
      console.log(`❌ ${file} doesn't use React.memo`);
    }
  }
});

// Test 3: Check if useMemo is used
console.log('\n⚡ Checking useMemo usage...');
memoComponents.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('useMemo')) {
      console.log(`✅ ${file} uses useMemo`);
    } else {
      console.log(`❌ ${file} doesn't use useMemo`);
    }
  }
});

// Test 4: Check TypeScript types
console.log('\n📝 Checking TypeScript types...');
if (fs.existsSync('src/types/api.ts')) {
  const content = fs.readFileSync('src/types/api.ts', 'utf8');
  const typeChecks = [
    { name: 'ApiResponse', found: content.includes('interface ApiResponse') },
    { name: 'UserApiResponse', found: content.includes('interface UserApiResponse') },
    { name: 'PetApiResponse', found: content.includes('interface PetApiResponse') },
    { name: 'ApiError', found: content.includes('interface ApiError') }
  ];
  
  typeChecks.forEach(check => {
    if (check.found) {
      console.log(`✅ ${check.name} interface defined`);
    } else {
      console.log(`❌ ${check.name} interface missing`);
    }
  });
}

// Test 5: Check Error Boundary integration
console.log('\n🛡️ Checking Error Boundary...');
if (fs.existsSync('src/app/(main)/_layout.tsx')) {
  const content = fs.readFileSync('src/app/(main)/_layout.tsx', 'utf8');
  if (content.includes('ErrorBoundary')) {
    console.log('✅ ErrorBoundary integrated in main layout');
  } else {
    console.log('❌ ErrorBoundary not integrated');
  }
}

// Test 6: Check LoadingStates component
console.log('\n⏳ Checking LoadingStates...');
if (fs.existsSync('src/components/LoadingStates.tsx')) {
  const content = fs.readFileSync('src/components/LoadingStates.tsx', 'utf8');
  const loadingTypes = ['spinner', 'skeleton', 'dots', 'pulse'];
  loadingTypes.forEach(type => {
    if (content.includes(`'${type}'`)) {
      console.log(`✅ LoadingStates supports ${type} type`);
    } else {
      console.log(`❌ LoadingStates missing ${type} type`);
    }
  });
}

// Test 7: Check performance monitoring
console.log('\n📊 Checking Performance Monitoring...');
if (fs.existsSync('src/hooks/usePerformance.ts')) {
  const content = fs.readFileSync('src/hooks/usePerformance.ts', 'utf8');
  const perfFeatures = [
    { name: 'render tracking', found: content.includes('trackRenders') },
    { name: 'API call tracking', found: content.includes('trackApiCalls') },
    { name: 'memory tracking', found: content.includes('trackMemory') },
    { name: 'performance summary', found: content.includes('getPerformanceSummary') }
  ];
  
  perfFeatures.forEach(feature => {
    if (feature.found) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
}

// Test 8: Check retry logic
console.log('\n🔄 Checking Retry Logic...');
if (fs.existsSync('src/hooks/useRetry.ts')) {
  const content = fs.readFileSync('src/hooks/useRetry.ts', 'utf8');
  const retryFeatures = [
    { name: 'max attempts', found: content.includes('maxAttempts') },
    { name: 'exponential backoff', found: content.includes('backoffMultiplier') },
    { name: 'retry function', found: content.includes('retry') },
    { name: 'reset function', found: content.includes('reset') }
  ];
  
  retryFeatures.forEach(feature => {
    if (feature.found) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
}

console.log('\n🎉 Refactoring Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Run the app: npm start');
console.log('2. Check console for performance logs');
console.log('3. Test error scenarios (turn off network)');
console.log('4. Verify loading states work correctly');
console.log('5. Test retry functionality with slow network'); 