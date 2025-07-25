import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CustomerService } from '@/lib/services/CustomerService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function CustomerDebugTest() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);

  const testCustomerCreation = async () => {
    setTesting(true);
    try {
      console.log('=== CUSTOMER DEBUG TEST ===');
      console.log('User:', user);
      console.log('User ID:', user?.id);

      const testData = {
        name: `Test Customer ${Date.now()}`, // Unique name to avoid conflicts
        customer_type: 'regular' as const,
        email: `test${Date.now()}@example.com`,
        phone: `+880-${Date.now().toString().slice(-10)}`,
        address: 'Test Address',
        city: 'Dhaka',
        country: 'Bangladesh',
      };

      console.log('Test data:', testData);

      const result = await CustomerService.createCustomer(testData, user?.id || null);
      
      console.log('Success! Customer created:', result);
      Alert.alert('Success', `Customer created with ID: ${result.id}`);

    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const testCustomerFetch = async () => {
    try {
      console.log('=== CUSTOMER FETCH TEST ===');
      const customers = await CustomerService.getAllCustomers();
      console.log('Fetched customers:', customers);
      Alert.alert('Success', `Found ${customers.length} customers`);
    } catch (error) {
      console.error('Fetch test failed:', error);
      Alert.alert('Error', `Fetch failed: ${error.message}`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    disabledButton: {
      backgroundColor: theme.colors.border,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Debug Test</Text>
      
      <TouchableOpacity
        style={[styles.button, testing && styles.disabledButton]}
        onPress={testCustomerCreation}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Testing...' : 'Test Customer Creation'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={testCustomerFetch}
      >
        <Text style={styles.buttonText}>Test Customer Fetch</Text>
      </TouchableOpacity>
    </View>
  );
}