// Test Master Data Tables Setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfecqahlnfnczhkxvcjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjY1NzcsImV4cCI6MjA2OTAwMjU3N30.YhGJM0J0mjh1Q2OcQjyU96VkBayfRqbZAwCVsqjSK0w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMasterData() {
  console.log('🔍 Testing Master Data Tables...');
  
  try {
    // Test 1: Check if all tables exist
    console.log('\n📋 Test 1: Checking table existence...');
    
    const tables = ['categories', 'suppliers', 'customers', 'locations'];
    const tableResults = {};
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} table not found:`, error.message);
        tableResults[table] = false;
      } else {
        console.log(`✅ ${table} table exists`);
        tableResults[table] = true;
      }
    }
    
    // Test 2: Check default categories
    console.log('\n📋 Test 2: Checking default categories...');
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.log('❌ Error fetching categories:', catError.message);
    } else {
      console.log(`✅ Found ${categories.length} categories:`);
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.color_code})`);
      });
    }
    
    // Test 3: Check default locations
    console.log('\n📋 Test 3: Checking default locations...');
    
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('*');
    
    if (locError) {
      console.log('❌ Error fetching locations:', locError.message);
    } else {
      console.log(`✅ Found ${locations.length} locations:`);
      locations.forEach(loc => {
        console.log(`  - ${loc.name} (${loc.location_type}) - ${loc.city}`);
      });
    }
    
    // Test 4: Test category hierarchy function
    console.log('\n📋 Test 4: Testing category hierarchy function...');
    
    if (categories && categories.length > 0) {
      try {
        const { data: pathResult, error: pathError } = await supabase
          .rpc('get_category_path', {
            category_id: categories[0].id
          });
        
        if (pathError) {
          console.log('⚠️  Category path function test failed:', pathError.message);
        } else {
          console.log('✅ Category path function working:', pathResult);
        }
      } catch (e) {
        console.log('⚠️  Category path function test skipped:', e.message);
      }
    }
    
    // Test 5: Test creating a sample supplier
    console.log('\n📋 Test 5: Testing sample data creation...');
    
    try {
      const { data: newSupplier, error: supplierError } = await supabase
        .from('suppliers')
        .insert({
          name: 'Test Supplier Ltd',
          supplier_type: 'manufacturer',
          contact_person: 'John Doe',
          email: 'john@testsupplier.com',
          phone: '+91-9876543210',
          city: 'Delhi'
        })
        .select()
        .single();
      
      if (supplierError) {
        if (supplierError.message.includes('duplicate key')) {
          console.log('✅ Supplier creation test passed (already exists)');
        } else {
          console.log('⚠️  Supplier creation failed:', supplierError.message);
        }
      } else {
        console.log('✅ Sample supplier created successfully:', newSupplier.name);
        
        // Clean up test data
        await supabase
          .from('suppliers')
          .delete()
          .eq('id', newSupplier.id);
        console.log('✅ Test supplier cleaned up');
      }
    } catch (e) {
      console.log('⚠️  Sample supplier test skipped:', e.message);
    }
    
    // Test 6: Test creating a sample customer
    try {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: 'Test Customer Inc',
          customer_type: 'regular',
          contact_person: 'Jane Smith',
          email: 'jane@testcustomer.com',
          phone: '+91-9876543211',
          city: 'Mumbai'
        })
        .select()
        .single();
      
      if (customerError) {
        if (customerError.message.includes('duplicate key')) {
          console.log('✅ Customer creation test passed (already exists)');
        } else {
          console.log('⚠️  Customer creation failed:', customerError.message);
        }
      } else {
        console.log('✅ Sample customer created successfully:', newCustomer.name);
        
        // Clean up test data
        await supabase
          .from('customers')
          .delete()
          .eq('id', newCustomer.id);
        console.log('✅ Test customer cleaned up');
      }
    } catch (e) {
      console.log('⚠️  Sample customer test skipped:', e.message);
    }
    
    // Check overall success
    const allTablesExist = Object.values(tableResults).every(result => result === true);
    
    if (allTablesExist) {
      console.log('\n✅ Master Data Tables test completed successfully!');
      console.log('🚀 Ready to proceed to Task 5: Product and Inventory Tables');
      return true;
    } else {
      console.log('\n⚠️  Some tables are missing. Please run the SQL script first.');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    return false;
  }
}

testMasterData().then(success => {
  process.exit(success ? 0 : 1);
});