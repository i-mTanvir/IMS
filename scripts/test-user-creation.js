// Test User Creation with Different Email
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNjU3NywiZXhwIjoyMDY5MDAyNTc3fQ.yYxIf9W_46RUQhgxsyIhyZJWGc9v0r4EwiFgyAIYoyA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserCreation() {
  console.log('Testing user creation with different email...');
  
  try {
    // Try creating a test user first
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'Test123!',
      email_confirm: true
    });

    if (error) {
      console.error('❌ Test user creation failed:', error);
      return false;
    }

    console.log('✅ Test user created successfully!');
    
    // Now try the admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@serranotex.com',
      password: 'Admin123!',
      email_confirm: true
    });

    if (adminError) {
      console.error('❌ Admin user creation failed:', adminError);
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(data.user.id);
      return false;
    }

    console.log('✅ Admin user created successfully!');
    
    // Clean up test user
    await supabase.auth.admin.deleteUser(data.user.id);
    console.log('✅ Test user cleaned up');
    
    return true;
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    return false;
  }
}

testUserCreation();