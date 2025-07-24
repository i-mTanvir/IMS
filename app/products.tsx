import React, { useState, useMemo } from 'react';
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

// Product interfaces
interface Product {
  id: string;
  name: string;
  productCode: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  yardPrice: number;
  currentStock: number;
  supplier: string;
  dateAdded: Date;
  isUnsold: boolean;
  wastageCount: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
  available: number;
  reserved: number;
  onHand: number;
  minimumThreshold: number;
  image: string;
}

interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  location?: string;
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Macbook Pro M1 2020',
    productCode: '#LWIL02012',
    category: 'Laptop',
    purchasePrice: 1200,
    sellingPrice: 1500,
    yardPrice: 0,
    currentStock: 120,
    supplier: 'Apple Inc',
    dateAdded: new Date('2024-01-15'),
    isUnsold: false,
    wastageCount: 0,
    status: 'In Stock',
    location: 'Warehouse 1',
    available: 120,
    reserved: 120,
    onHand: 100,
    minimumThreshold: 10,
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    productCode: '#LWIL02015',
    category: 'Accessories',
    purchasePrice: 80,
    sellingPrice: 120,
    yardPrice: 0,
    currentStock: 250,
    supplier: 'Logitech',
    dateAdded: new Date('2024-01-20'),
    isUnsold: false,
    wastageCount: 0,
    status: 'In Stock',
    location: 'Warehouse 2',
    available: 250,
    reserved: 250,
    onHand: 205,
    minimumThreshold: 20,
    image: 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '3',
    name: 'Wired Mouse',
    productCode: '#LWIL02014',
    category: 'Accessories',
    purchasePrice: 15,
    sellingPrice: 25,
    yardPrice: 0,
    currentStock: 1250,
    supplier: 'Dell',
    dateAdded: new Date('2024-01-25'),
    isUnsold: false,
    wastageCount: 0,
    status: 'Low Stock',
    location: 'Warehouse 3',
    available: 1250,
    reserved: 1250,
    onHand: 1130,
    minimumThreshold: 50,
    image: 'https://images.pexels.com/photos/2115217/pexels-photo-2115217.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '4',
    name: 'Titan Watch',
    productCode: '#LWIL02015',
    category: 'Watch',
    purchasePrice: 200,
    sellingPrice: 300,
    yardPrice: 0,
    currentStock: 600,
    supplier: 'Titan Company',
    dateAdded: new Date('2024-02-01'),
    isUnsold: false,
    wastageCount: 0,
    status: 'In Stock',
    location: 'Warehouse 4',
    available: 600,
    reserved: 600,
    onHand: 560,
    minimumThreshold: 30,
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  },
  {
    id: '5',
    name: 'Sandisk Harddisk 1 TB',
    productCode: '#LWIL02016',
    category: 'Accessories',
    purchasePrice: 60,
    sellingPrice: 90,
    yardPrice: 0,
    currentStock: 250,
    supplier: 'Sandisk',
    dateAdded: new Date('2024-02-05'),
    isUnsold: false,
    wastageCount: 0,
    status: 'Out of Stock',
    location: 'Warehouse 3',
    available: 0,
    reserved: 0,
    onHand: 0,
    minimumThreshold: 25,
    image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'
  }
];

export default function ProductsPage() {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [products] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
  const [showProductForm, setShowProductForm] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.search && 
          !product.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !product.productCode.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.status && product.status !== filters.status) {
        return false;
      }
      if (filters.location && product.location !== filters.location) {
        return false;
      }
      return true;
    });
  }, [products, filters]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
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

  const handleProductAction = (action: 'view' | 'edit' | 'delete', product: Product) => {
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
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete product') }
          ]
        );
        break;
    }
  };

  const renderProductCard = ({ item: product }: { item: Product }) => {
    const StatusIcon = getStatusIcon(product.status);
    
    return (
      <View style={[styles.productCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.productHeader}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={[styles.productName, { color: theme.colors.text.primary }]} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={[styles.productCode, { color: theme.colors.text.secondary }]}>
              {product.productCode}
            </Text>
            <View style={styles.statusContainer}>
              <StatusIcon size={12} color={getStatusColor(product.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>
                {product.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Category:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{product.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Location:</Text>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={theme.colors.text.secondary} />
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{product.location}</Text>
            </View>
          </View>
          <View style={styles.stockInfo}>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Available</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.available}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>On Hand</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.onHand}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Reserved</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{product.reserved}</Text>
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
    setShowProductForm(true);
  };

  const handleProductSubmit = (data: any) => {
    console.log('Product form submitted:', data);
    // Here you would normally add the product to your database
    Alert.alert('Success', 'Product added successfully!');
    setShowProductForm(false);
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
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddProduct}
          >
            <Plus size={20} color={theme.colors.text.inverse} />
          </TouchableOpacity>
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
        data={filteredProducts}
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
              No products found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text.muted }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      {/* Product Add Form */}
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