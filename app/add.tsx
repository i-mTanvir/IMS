import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import BottomNavBar from '@/components/BottomNavBar';
import TopNavBar from '@/components/TopNavBar';
import FloatingActionMenu from '@/components/FloatingActionMenu';
import ProductAddForm from '@/components/forms/ProductAddForm';
import CustomerAddForm from '@/components/forms/CustomerAddForm';
import CategoryAddForm from '@/components/forms/CategoryAddForm';
import SupplierAddForm from '@/components/forms/SupplierAddForm';
import RoleAddForm from '@/components/forms/RoleAddForm';

export default function AddScreen() {
  const { theme } = useTheme();
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);

  const handleMenuItemPress = (action: any) => {
    // Show the appropriate form based on the action id
    switch(action.id) {
      case 'products':
        setShowProductForm(true);
        break;
      case 'customer':
        setShowCustomerForm(true);
        break;
      case 'category':
        setShowCategoryForm(true);
        break;
      case 'suppliers':
        setShowSupplierForm(true);
        break;
      case 'role':
        setShowRoleForm(true);
        break;
    }
  };

  // Form submission handlers
  const handleProductSubmit = (data: any) => {
    console.log('Product form submitted:', data);
    setShowProductForm(false);
  };

  const handleCustomerSubmit = (data: any) => {
    console.log('Customer form submitted:', data);
    setShowCustomerForm(false);
  };

  const handleCategorySubmit = (data: any) => {
    console.log('Category form submitted:', data);
    setShowCategoryForm(false);
  };

  const handleSupplierSubmit = (data: any) => {
    console.log('Supplier form submitted:', data);
    setShowSupplierForm(false);
  };

  const handleRoleSubmit = (data: any) => {
    console.log('Role form submitted:', data);
    setShowRoleForm(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar
        title="Add New"
        showBackButton={true}
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Select an option from the menu below to add a new item</Text>
      </View>

      {/* Forms */}
      <ProductAddForm 
        visible={showProductForm} 
        onClose={() => setShowProductForm(false)} 
        onSubmit={handleProductSubmit} 
      />
      
      <CustomerAddForm 
        visible={showCustomerForm} 
        onClose={() => setShowCustomerForm(false)} 
        onSubmit={handleCustomerSubmit} 
      />
      
      <CategoryAddForm 
        visible={showCategoryForm} 
        onClose={() => setShowCategoryForm(false)} 
        onSubmit={handleCategorySubmit} 
      />
      
      <SupplierAddForm 
        visible={showSupplierForm} 
        onClose={() => setShowSupplierForm(false)} 
        onSubmit={handleSupplierSubmit} 
      />
      
      <RoleAddForm
        visible={showRoleForm}
        onClose={() => setShowRoleForm(false)}
        onSubmit={handleRoleSubmit}
      />

      <FloatingActionMenu onMenuItemPress={handleMenuItemPress} />
      <BottomNavBar activeTab="add" />
    </SafeAreaView>
  );
} 