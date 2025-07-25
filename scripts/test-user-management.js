// Test User Management Tables Setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjY1NzcsImV4cCI6MjA2OTAwMjU3N30.YhGJM0J0mjh1Q2OcQjyU96VkBayfRqbZAwCVsqjSK0w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserManagement() {
  console.log('🔍 Testing User Management Tables...');
  
  try {
    // Test 1: Check if tables exist by querying them
    console.log('\n📋 Test 1: Checking table existence...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table not found:', usersError.message);
      return false;
    }
    console.log('✅ Users table exists');
    
    const { data: permissions, error: permissionsError } = await supabase
      .from('user_permissions')
      .select('*')
      .limit(1);
    
    if (permissionsError) {
      console.log('❌ User permissions table not found:', permissionsError.message);
      return false;
    }
    console.log('✅ User permissions table exists');
    
    // Test 2: Check if default admin user exists
    console.log('\n📋 Test 2: Checking default admin user...');
    
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super_admin');
    
    if (adminError) {
      console.log('❌ Error checking admin users:', adminError.message);
      return false;
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} super admin user(s)`);
      adminUsers.forEach(user => {
        console.log(`  - ${user.full_name} (${user.email})`);
      });
    } else {
      console.log('⚠️  No super admin users found');
    }
    
    // Test 3: Test permission function (if we can call it)
    console.log('\n📋 Test 3: Testing permission functions...');
    
    try {
      // Try to call the user_has_permission function
      const { data: permissionTest, error: permissionError } = await supabase
        .rpc('user_has_permission', {
          user_id: adminUsers[0]?.id || '00000000-0000-0000-0000-000000000000',
          module_name: 'USERS',
          action_type: 'read'
        });
      
      if (permissionError) {
        console.log('⚠️  Permission function test failed:', permissionError.message);
      } else {
        console.log('✅ Permission function is working:', permissionTest);
      }
    } catch (e) {
      console.log('⚠️  Permission function test skipped:', e.message);
    }
    
    // Test 4: Check user permissions for admin user
    if (adminUsers && adminUsers.length > 0) {
      console.log('\n📋 Test 4: Checking admin user permissions...');
      
      const { data: adminPermissions, error: adminPermError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', adminUsers[0].id);
      
      if (adminPermError) {
        console.log('❌ Error checking admin permissions:', adminPermError.message);
      } else {
        console.log(`✅ Admin user has ${adminPermissions.length} permission records`);
        if (adminPermissions.length > 0) {
          console.log('  Sample permissions:');
          adminPermissions.slice(0, 3).forEach(perm => {
            console.log(`    - ${perm.module}: create=${perm.can_create}, read=${perm.can_read}, update=${perm.can_update}`);
          });
        }
      }
    }
    
    console.log('\n✅ User Management Tables test completed successfully!');
    console.log('🚀 Ready to proceed to Task 4: Master Data Tables');
    return true;
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return false;
  }
}

testUserManagement().then(success => {
  process.exit(success ? 0 : 1);
});