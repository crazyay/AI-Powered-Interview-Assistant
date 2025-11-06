#!/usr/bin/env node

/**
 * Quick API Call Test Script
 * Run this to see how many Gemini API calls a typical flow makes
 */

const BASE_URL = 'http://localhost:5000';

async function testApiCalls() {
  console.log('🧪 Starting API Call Test\n');
  
  // Step 1: Check initial stats
  console.log('📊 Step 1: Checking initial API stats...');
  let stats = await fetch(`${BASE_URL}/api/stats/stats`).then(r => r.json());
  console.log('Initial stats:', JSON.stringify(stats, null, 2));
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Simulate starting a custom test
  console.log('\n📝 Step 2: Starting a custom test (this will call Gemini)...');
  try {
    const testResponse = await fetch(`${BASE_URL}/api/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890'
        },
        testMode: 'custom',
        topics: ['JavaScript', 'React'],
        questionCount: 5
      })
    });
    
    const testData = await testResponse.json();
    console.log('Test started:', testData.success ? '✅' : '❌');
    
    if (!testData.success) {
      console.log('Error:', testData.error);
    }
  } catch (error) {
    console.log('❌ Error starting test:', error.message);
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Check stats after
  console.log('\n📊 Step 3: Checking API stats after test start...');
  stats = await fetch(`${BASE_URL}/api/stats/stats`).then(r => r.json());
  console.log('Stats after test:', JSON.stringify(stats, null, 2));
  
  // Analysis
  console.log('\n📈 ANALYSIS:');
  console.log(`   Total calls made: ${stats.stats.totalCalls}`);
  console.log(`   Calls in last minute: ${stats.stats.callsLastMinute}`);
  console.log(`   Breakdown:`, stats.stats.callsBySource);
  
  if (stats.stats.callsLastMinute > 10) {
    console.log('\n⚠️  WARNING: More than 10 calls in last minute!');
    console.log('   This could cause rate limiting issues.');
  } else {
    console.log('\n✅ Call rate looks normal for a single test.');
  }
  
  if (stats.warning) {
    console.log('\n⚠️  ' + stats.warning);
  }
  
  console.log('\n💡 RECOMMENDATION:');
  if (stats.stats.callsLastMinute < 5) {
    console.log('   Rate limit issue is likely from Gemini API side, not our code.');
    console.log('   Consider upgrading API plan or using a different region.');
  } else if (stats.stats.callsLastMinute > 10) {
    console.log('   We might be making too many calls too quickly.');
    console.log('   Consider adding delays or caching.');
  } else {
    console.log('   Normal usage. If you see 429 errors, it\'s Gemini\'s limit.');
  }
  
  console.log('\n✅ Test complete!');
}

// Run if backend is available
fetch(`${BASE_URL}/api/health`)
  .then(() => testApiCalls())
  .catch(() => {
    console.log('❌ Backend not running!');
    console.log('Start backend with: cd F:\\AIQuizz\\backend && node server.js');
  });
