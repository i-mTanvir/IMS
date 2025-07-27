import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Package,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';
import ProductAddForm from '@/components/forms/ProductAddForm';
import OneProductAddForm from '@/components/forms/OneProductAddForm';
import { productService, Product, ProductFilters } from '@/lib/database/product-service';

// Product interfaces are now imported from product-service

export default function ProductsPage() {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSimpleForm, setShowSimpleForm] = useState(false);

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reload products when filters change
  useEffect(() => {
    if (!loading) {
      loadProducts();
    }
  }, [filters]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return theme.colors.status.success;
      case 'Low Stock': return theme.colors.status.warning;
      case 'Out of Stock': return theme.colors.status.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock': return CheckCircle;
      case 'Low Stock': return AlertTriangle;
      case 'Out of Stock': return AlertTriangle;
      default: return Package;
    }
  };

  const handleProductAction = async (action: 'view' | 'edit' | 'delete', product: Product) => {
    switch (action) {
      case 'view':
        // Navigate to product details
        Alert.alert('View Product', `Viewing ${product.name}`);
        break;
      case 'edit':
        if (!hasPermission('products', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to edit products.');
          return;
        }
        Alert.alert('Edit Product', `Editing ${product.name}`);
        break;
      case 'delete':
        if (!hasPermission('products', 'delete')) {
          Alert.alert('Permission Denied', 'You do not have permission to delete products.');
          return;
        }
        Alert.alert(
          'Delete Product',
          `Are you sure you want to delete ${product.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive', 
              onPress: async () => {
                try {
                  console.log('Deleting product:', product.name, product.id);
                  await productService.deleteProduct(product.id);
                  Alert.alert('Success', `Product "${product.name}" deleted successfully`);
                  loadProducts(); // Refresh the list
                } catch (error) {
                  console.error('Delete product error:', error);
                  const errorMessage = error?.message || 'Unknown error occurred';
                  Alert.alert('Error', `Failed to delete product: ${errorMessage}`);
                }
              }
            }
          ]
        );
        break;
    }
  };

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const StatusIcon = getStatusIcon(product.stock_status || 'In Stock');
    
    return (
      <View style={[styles.productCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.productHeader}>
          <Image 
            source={{ uri: product.product_image || 'https://via.placeholder.com/60x60?text=No+Image' }} 
            style={styles.productImage} 
          />
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.colors.text.primary }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={[styles.productCode, { color: theme.colors.text.secondary }]}>
              {product.product_code}
            </Text>
            <View style={styles.statusContainer}>
              <StatusIcon size={12} color={getStatusColor(product.stock_status || 'In Stock')} />
              <Text style={[styles.statusText, { color: getStatusColor(product.stock_status || 'In Stock') }]}>
                {product.stock_status || 'In Stock'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Category:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{product.category_name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Location:</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={theme.colors.text.secondary} />
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{product.location_name || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.stockInfo}>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Available</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.available_stock}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Current</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.current_stock}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Reserved</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.reserved_stock}</Text>
            </View>
          </View>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.status.info + '20' }]}
            onPress={() => handleProductAction('view', product)}
          >
            <Eye size={16} color={theme.colors.status.info} />
          </TouchableOpacity>
          
          {hasPermission('products', 'edit') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
              onPress={() => handleProductAction('edit', product)}
            >
              <Edit size={16} color={theme.colors.status.warning} />
            </TouchableOpacity>
          )}
          
          {hasPermission('products', 'delete') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.error + '20' }]}
              onPress={() => handleProductAction('delete', product)}
            >
              <Trash2 size={16} color={theme.colors.status.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleAddProduct = () => {
    if (!hasPermission('products', 'add')) {
      Alert.alert('Permission Denied', 'You do not have permission to add products.');
      return;
    }
    setShowProductForm(true); // Use complex form
  };

  const handleAddProductComplex = () => {
    if (!hasPermission('products', 'add')) {
      Alert.alert('Permission Denied', 'You do not have permission to add products.');
      return;
    }
    setShowProductForm(true);
  };

  const handleSimpleProductSubmit = async (productName: string) => {
    console.log('🚀 === SIMPLE PRODUCT SUBMIT ===');
    console.log('Product name:', productName);
    console.log('Current user:', user);
    
    Alert.alert('DEBUG', 'Simple product submit called!');
    
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to add products.');
      return;
    }
    
    try {
      console.log('Calling productService.createSimpleProduct...');
      const result = await productService.createSimpleProduct(productName, user.id);
      console.log('✅ Simple product created:', result);
      
      Alert.alert('Success', `Product "${productName}" added successfully!`);
      setShowSimpleForm(false);
      loadProducts(); // Refresh the list
    } catch (error) {
      console.error('=== ERROR IN SIMPLE PRODUCT SUBMISSION ===');
      console.error('Error:', error);
      Alert.alert('Error', `Failed to add product: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleProductSubmit = async (data: any) => {
    console.log('🚀 === COMPLEX FORM SUBMIT CALLED ===');
    console.log('Received data:', data);
    console.log('Current user:', user);
    console.log('User permissions:', hasPermission('products', 'add'));
    
    // Add an alert to make sure this function is being called
    Alert.alert('DEBUG', 'COMPLEX form handleProductSubmit was called!');
    
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to add products.');
      return;
    }
    
    try {
      console.log('Calling productService.createProductWithStock...');
      console.log('User ID:', user?.id);
      const result = await productService.createProductWithStock(data, user?.id);
      console.log('✅ Product created successfully:', result);
      
      Alert.alert('Success', 'Product added successfully!');
      setShowProductForm(false);
      loadProducts(); // Refresh the list
    } catch (error) {
      console.error('=== ERROR IN PRODUCT SUBMISSION ===');
      console.error('Error adding product:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Show more specific error messages
      let errorMessage = 'Unknown error occurred';
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', `Failed to add product: ${errorMessage}`);
    }
  };

  return (
    <SharedLayout title="Products">
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        >
          <Download size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        {hasPermission('products', 'add') && (
          <>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddProduct}
            >
              <Plus size={20} color={theme.colors.text.inverse} />
            </TouchableOpacity>
            
            {/* Simple form button for testing */}
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.secondary || '#6B7280' }]}
              onPress={() => setShowSimpleForm(true)}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Simple</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Search and Filters */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
          <Search size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text.primary }]}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.text.muted}
            value={filters.search || ''}
            onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        >
          <Filter size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        style={styles.productsList}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={theme.colors.text.muted} />
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              {loading ? 'Loading products...' : 'No products found'}
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text.muted }]}>
              {loading ? 'Please wait...' : 'Try adding a new product or adjusting your search'}
            </Text>
          </View>
        }
      />

      {/* Simple Product Add Form */}
      <OneProductAddForm
        visible={showSimpleForm}
        onClose={() => setShowSimpleForm(false)}
        onSubmit={handleSimpleProductSubmit}
      />

      {/* Complex Product Add Form */}
      <ProductAddForm
        visible={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSubmit={handleProductSubmit}
      />

    </SharedLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsList: {
    flex: 1,
  },
  productsContainer: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stockItem: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
}); 