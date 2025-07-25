// Test script to check if customer insertion works
// Run this in your browser console or as a test

import { supabase } from '../lib/supabase';

export const testCustomerInsert = async () => {
  try {
    console.log('Testing customer insertion...');
    
    // Test basic insert
    const testData = {
      name: 'Test Customer',
      customer_type: 'regular',
      email: 'test@example.com',
      phone: '+880-1234-567890',
      address: 'Test Address',
      city: 'Dhaka',
      country: 'Bangladesh',
      payment_status: 'good',
      credit_limit: 0,
      current_balance: 0,
      total_sales: 0,
      total_orders: 0,
      is_red_listed: false,
      is_active: true,
      total_purchases: 0,
      total_spent: 0,
      average_order_value: 0,
      purchase_frequency: 0,
      outstanding_amount: 0,
      days_past_due: 0,
      payment_terms: 30
    };

    console.log('Inserting test data:', testData);

    const { data, error } = await supabase
      .from('customers')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('Insert failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }

    console.log('Insert successful:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error };
  }
};

// Test if we can read from customers table
export const testCustomerRead = async () => {
  try {
    console.log('Testing customer read...');
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Read failed:', error);
      return { success: false, error };
    }

    console.log('Read successful:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Read test failed:', error);
    return { success: false, error };
  }
};