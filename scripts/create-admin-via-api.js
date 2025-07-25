// Create Admin User via Supabase Admin API
// Run this with: node scripts/create-admin-via-api.js

const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNjU3NywiZXhwIjoyMDY5MDAyNTc3fQ.yYxIf9W_46RUQhgxsyIhyZJWGc9v0r4EwiFgyAIYoyA'; // You need to get this from Supabase Dashboard > Settings > API

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Creating admin user via Supabase Admin API...');
  
  try {
    // Create user in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@serranotex.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'System Administrator'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return false;
    }

    console.log('✅ Auth user created:', authUser.user.email);

    // Update the existing user in public.users with the auth ID
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        id: authUser.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'admin@serranotex.com');

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError);
      return false;
    }

    console.log('✅ User profile updated with auth ID');
    console.log('🎉 Admin user setup completed successfully!');
    console.log('📧 Email: admin@serranotex.com');
    console.log('🔑 Password: Admin123!');
    
    return true;
  } catch (error) {
    console.error('💥 Failed to create admin user:', error);
    return false;
  }
}

// Instructions for getting service role key
console.log('📋 To use this script:');
console.log('1. Go to Supabase Dashboard > Settings > API');
console.log('2. Copy the "service_role" key (not the anon key)');
console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in this file');
console.log('4. Run: node scripts/create-admin-via-api.js');
console.log('');

if (supabaseServiceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.log('⚠️  Please set the service role key first!');
  process.exit(1);
} else {
  createAdminUser().then(success => {
    process.exit(success ? 0 : 1);
  });
}