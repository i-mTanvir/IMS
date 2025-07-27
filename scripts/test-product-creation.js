// Test script to verify product creation works
// Run this in your development environment to test the database connection

import { productService } from '../lib/database/product-service.js';

async function testProductCreation() {
  try {
    console.log('Testing product creation...');
    
    // Test data
    const testProduct = {
      name: 'Test Fabric Product',
      description: 'A test fabric for development',
      purchase_price: 25.00,
      selling_price: 35.00,
      per_meter_price: 35.00,
      minimum_threshold: 50,
      payment_status: 'pending',
      paid_amount: 0,
      unit_of_measure: 'meter',
      color: 'Blue',
      material: 'Cotton',
      width: 150,
      weight: 0.5,
      initial_quantity: 100,
      purchase_date: new Date().toISOString().split('T')[0],
    };

    // Create product with stock
    const result = await productService.createProductWithStock(testProduct);
    console.log('Product created successfully:', result);
    
    // Test fetching products
    const products = await productService.getProducts();
    console.log('Total products in database:', products.length);
    
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Export for use in other scripts
export { testProductCreation };

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testProductCreation()
    .then(() => console.log('Test completed successfully'))
    .catch(() => console.log('Test failed'));
}