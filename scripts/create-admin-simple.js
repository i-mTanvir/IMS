// Simple Admin User Creation
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNjU3NywiZXhwIjoyMDY5MDAyNTc3fQ.yYxIf9W_46RUQhgxsyIhyZJWGc9v0r4EwiFgyAIYoyA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  console.log('Creating admin user...');
  
  try {
    // Try with minimal data first
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@serranotex.com',
      password: 'Admin123!',
      email_confirm: true
    });

    if (error) {
      console.error('Error:', error);
      return false;
    }

    console.log('✅ User created successfully!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    return true;
  } catch (err) {
    console.error('Caught error:', err);
    return false;
  }
}

createUser();