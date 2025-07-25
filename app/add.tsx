import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';
import {
  Package,
  Users,
  Truck,
  ShoppingCart,
  Plus,
  ArrowLeft,
} from 'lucide-react-native';

interface AddOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  permission?: string;
}

export default function AddPage() {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const router = useRouter();

  const addOptions: AddOption[] = [
    {
      id: 'product',
      title: 'Add Product',
      description: 'Add a new product to inventory',
      icon: Package,
      route: '/products',
      permission: 'products.add',
    },
    {
      id: 'customer',
      title: 'Add Customer',
      description: 'Add a new customer',
      icon: Users,
      route: '/customers',
      permission: 'customers.add',
    },
    {
      id: 'supplier',
      title: 'Add Supplier',
      description: 'Add a new supplier',
      icon: Truck,
      route: '/suppliers',
      permission: 'suppliers.add',
    },
    {
      id: 'category',
      title: 'Add Category',
      description: 'Add a new product category',
      icon: ShoppingCart,
      route: '/categories',
      permission: 'products.add',
    },
  ];

  const handleOptionPress = (option: AddOption) => {
    router.push(option.route as any);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    optionsGrid: {
      gap: 16,
    },
    optionCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.text.muted,
    },
    chevron: {
      marginLeft: 12,
    },
  });

  return (
    <SharedLayout title="Add New">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.optionsGrid}>
            {addOptions.map((option) => {
              const hasRequiredPermission = !option.permission || hasPermission(option.permission.split('.')[0], option.permission.split('.')[1]);
              
              if (!hasRequiredPermission) return null;

              const IconComponent = option.icon;
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() => handleOptionPress(option)}
                >
                  <View style={styles.optionIconContainer}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <Plus size={20} color={theme.colors.text.muted} style={styles.chevron} />
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SharedLayout>
  );
}