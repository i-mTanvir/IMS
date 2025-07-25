// Test ENUM setup for Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjY1NzcsImV4cCI6MjA2OTAwMjU3N30.YhGJM0J0mjh1Q2OcQjyU96VkBayfRqbZAwCVsqjSK0w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected ENUMs for validation
const expectedEnums = [
  'user_role', 'payment_status_enum', 'location_type_enum', 'customer_type_enum',
  'supplier_type_enum', 'unit_measure_enum', 'stock_status_enum', 'payment_method_enum',
  'delivery_status_enum', 'sale_status_enum', 'purchase_status_enum', 'approval_status_enum',
  'purchase_item_status_enum', 'quality_status_enum', 'transfer_status_enum', 'priority_enum',
  'sample_status_enum', 'return_condition_enum', 'conversion_status_enum', 'wastage_reason_enum',
  'disposal_method_enum', 'wastage_status_enum', 'transaction_type_enum', 'reference_type_enum',
  'payment_processing_status_enum', 'dispute_status_enum', 'action_type_enum', 'module_type_enum',
  'severity_enum', 'notification_type_enum'
];

async function testEnums() {
  console.log('🔍 Testing ENUM setup...');
  
  try {
    // Try to call the list_enums function
    const { data, error } = await supabase.rpc('list_enums');
    
    if (error) {
      console.log('❌ ENUMs not set up yet');
      console.log('Error:', error.message);
      console.log('\n📋 Setup Instructions:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wfecqahlnfnczhkxvcjv');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and run the content from: scripts/supabase-enum-setup-safe.sql');
      return false;
    }
    
    console.log('✅ ENUMs are set up!');
    console.log(`📊 Found ${data.length} ENUM types:`);
    
    // Check if all expected ENUMs are present
    const foundEnums = data.map(e => e.enum_name);
    const missingEnums = expectedEnums.filter(e => !foundEnums.includes(e));
    const extraEnums = foundEnums.filter(e => !expectedEnums.includes(e));
    
    if (missingEnums.length > 0) {
      console.log(`⚠️  Missing ENUMs: ${missingEnums.join(', ')}`);
    }
    
    if (extraEnums.length > 0) {
      console.log(`ℹ️  Extra ENUMs found: ${extraEnums.join(', ')}`);
    }
    
    data.forEach(enumType => {
      console.log(`  - ${enumType.enum_name}: [${enumType.enum_values.join(', ')}]`);
    });
    
    const isComplete = missingEnums.length === 0 && data.length >= expectedEnums.length;
    console.log(`\n${isComplete ? '✅' : '⚠️'} ENUM setup is ${isComplete ? 'complete' : 'incomplete'}`);
    
    return isComplete;
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return false;
  }
}

testEnums().then(success => {
  process.exit(success ? 0 : 1);
});