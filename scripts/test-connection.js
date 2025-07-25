// Simple Node.js script to test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjY1NzcsImV4cCI6MjA2OTAwMjU3N30.YhGJM0J0mjh1Q2OcQjyU96VkBayfRqbZAwCVsqjSK0w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log(`URL: ${supabaseUrl}`);
  
  try {
    // Test basic connection by trying to access a non-existent table
    // This will give us a predictable error that confirms connection works
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    // If we get PGRST116 (table not found) or 42P01 (relation does not exist), connection is working
    if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
      console.log('✅ Connection successful!');
      console.log('📋 No tables found yet (expected for new project)');
      return true;
    }
    
    // If we get data, that means tables exist
    if (!error) {
      console.log('✅ Connection successful!');
      console.log('📊 Database tables are accessible');
      return true;
    }
    
    // Any other error indicates a connection problem
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    return false;

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Test authentication
async function testAuth() {
  console.log('\n🔐 Testing authentication...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth test failed:', error.message);
      return false;
    }

    if (session) {
      console.log('✅ User is authenticated');
      console.log(`👤 User: ${session.user.email}`);
    } else {
      console.log('✅ No active session (expected for initial setup)');
    }

    return true;
  } catch (error) {
    console.error('❌ Auth test error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Supabase connection tests...\n');
  
  const connectionResult = await testConnection();
  const authResult = await testAuth();
  
  console.log('\n📊 Test Results:');
  console.log(`Connection: ${connectionResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${authResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const overall = connectionResult && authResult;
  console.log(`\n🎯 Overall: ${overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (overall) {
    console.log('\n🎉 Supabase is ready for database setup!');
  } else {
    console.log('\n⚠️  Please check your Supabase configuration.');
  }
  
  return overall;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});