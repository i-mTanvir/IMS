import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Modal,
  Animated,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {
  Search,
  Filter,
  ArrowRight,
  Package,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Repeat,
  ChevronDown,
  X,
  Send,
  AlertTriangle,
  Calendar,
  BarChart,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';
import TransferForm from '@/components/forms/TransferForm';
import TransferRequestForm from '@/components/forms/TransferRequestForm';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

// Types
interface Product {
  id: string;
  name: string;
  productCode: string;
  image?: string;
  stock: number;
  location: string;
  category: string;
  lot?: string;
}

interface TransferRequest {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sourceLocation: string;
  destinationLocation: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Sofa Fabric',
    productCode: 'SF-1001',
    image: 'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    stock: 120,
    location: 'Main Warehouse',
    category: 'Sofa Fabrics',
    lot: 'LOT-A1',
  },
  {
    id: '2',
    name: 'Luxury Curtain Material',
    productCode: 'CM-2002',
    image: 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    stock: 85,
    location: 'Main Warehouse',
    category: 'Curtain Fabrics',
    lot: 'LOT-B2',
  },
  {
    id: '3',
    name: 'Artificial Leather - Brown',
    productCode: 'AL-3003',
    image: 'https://images.pexels.com/photos/5816934/pexels-photo-5816934.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    stock: 50,
    location: 'Secondary Warehouse',
    category: 'Artificial Leather',
    lot: 'LOT-C3',
  },
  {
    id: '4',
    name: 'Cotton Blend - White',
    productCode: 'GB-4004',
    image: 'https://images.pexels.com/photos/4792088/pexels-photo-4792088.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
    stock: 200,
    location: 'Main Warehouse',
    category: 'Garments',
    lot: 'LOT-D4',
  },
];

const mockTransferRequests: TransferRequest[] = [
  {
    id: 'TR-001',
    productId: '1',
    productName: 'Premium Sofa Fabric',
    quantity: 20,
    sourceLocation: 'Main Warehouse',
    destinationLocation: 'Showroom A',
    requestedBy: 'John Doe',
    requestedAt: new Date('2024-05-10T10:30:00'),
    status: 'pending',
  },
  {
    id: 'TR-002',
    productId: '2',
    productName: 'Luxury Curtain Material',
    quantity: 15,
    sourceLocation: 'Main Warehouse',
    destinationLocation: 'Showroom B',
    requestedBy: 'Jane Smith',
    requestedAt: new Date('2024-05-09T14:45:00'),
    status: 'approved',
  },
  {
    id: 'TR-003',
    productId: '3',
    productName: 'Artificial Leather - Brown',
    quantity: 10,
    sourceLocation: 'Secondary Warehouse',
    destinationLocation: 'Showroom C',
    requestedBy: 'Mike Johnson',
    requestedAt: new Date('2024-05-08T09:15:00'),
    status: 'completed',
  },
];

const locations = [
  'Main Warehouse',
  'Secondary Warehouse',
  'Showroom A',
  'Showroom B',
  'Showroom C',
];

export default function TransferPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    status: '',
    dateRange: { start: null, end: null },
  });

  const isAdminOrSuperAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Create styles function that uses theme
  const createStyles = () => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    activeTabText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: theme.colors.backgroundSecondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 8,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    listContainer: {
      padding: 12,
      gap: 12,
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    productImageContainer: {
      width: 60,
      height: 60,
      borderRadius: 8,
      overflow: 'hidden',
      marginRight: 12,
    },
    productImage: {
      width: '100%',
      height: '100%',
    },
    productImagePlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    productInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    productCode: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    productMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    productMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    productMetaText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    productActions: {
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
    },
    requestCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    requestId: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    requestDetails: {
      marginTop: 12,
      gap: 8,
    },
    requestDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    requestDetailText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    requestActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
      gap: 8,
    },
    requestActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 4,
    },
    requestActionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterModalContainer: {
      width: isMobile ? '90%' : 400,
      maxHeight: '80%',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      overflow: 'hidden',
    },
    filterModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterModalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    filterModalContent: {
      padding: 16,
    },
    filterSection: {
      marginBottom: 20,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    filterOptionSelected: {
      backgroundColor: theme.colors.backgroundTertiary,
      borderColor: theme.colors.primary,
    },
    filterOptionText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    filterOptionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '500',
    },
    filterModalFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 12,
    },
    resetFilterButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    resetFilterText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    applyFilterButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    applyFilterText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.inverse,
    },
    statusContainer: {
      flex: 1,
      padding: 16,
    },
    statusSection: {
      marginBottom: 24,
    },
    statusSectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    statusCards: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statusCard: {
      flex: 1,
      minWidth: isMobile ? '45%' : 150,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    statusIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    statusValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    statusLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    activityList: {
      gap: 12,
    },
    activityItem: {
      flexDirection: 'row',
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activityIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    activitySubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    activityMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    activityTime: {
      fontSize: 12,
      color: theme.colors.text.muted,
    },
    activityStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    activityStatusText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  const styles = createStyles();

  // Filter products based on search query and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesLocation = !filters.location || product.location === filters.location;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Filter transfer requests
  const filteredRequests = mockTransferRequests.filter(request => {
    const matchesSearch =
      request.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesLocation = !filters.location ||
      request.sourceLocation === filters.location ||
      request.destinationLocation === filters.location;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleTransferPress = (product: Product) => {
    setSelectedProduct(product);
    setShowTransferForm(true);
  };

  const handleRequestPress = (product: Product) => {
    setSelectedProduct(product);
    setShowRequestForm(true);
  };

  const handleTransferSubmit = (formData: any) => {
    // In a real app, this would send the transfer data to the backend
    console.log('Transfer submitted', formData);
    setShowTransferForm(false);
  };

  const handleRequestSubmit = (formData: any) => {
    // In a real app, this would send the request data to the backend
    console.log('Request submitted', formData);
    setShowRequestForm(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would fetch fresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'products' && styles.activeTab]}
        onPress={() => setActiveTab('products')}
      >
        <Package size={20} color={activeTab === 'products' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
        onPress={() => setActiveTab('requests')}
      >
        <Send size={20} color={activeTab === 'requests' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>Transfer Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'status' && styles.activeTab]}
        onPress={() => setActiveTab('status')}
      >
        <BarChart size={20} color={activeTab === 'status' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[styles.tabText, activeTab === 'status' && styles.activeTabText]}>Status</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Search size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab === 'products' ? 'products' : 'transfer requests'}...`}
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Filter size={20} color={theme.colors.primary} />
        <ChevronDown size={16} color={theme.colors.primary} style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImagePlaceholder, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Package size={24} color={theme.colors.text.secondary} />
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCode}>{item.productCode}</Text>

        <View style={styles.productMetaRow}>
          <View style={styles.productMetaItem}>
            <MapPin size={14} color={theme.colors.text.secondary} />
            <Text style={styles.productMetaText}>{item.location}</Text>
          </View>

          <View style={styles.productMetaItem}>
            <Package size={14} color={theme.colors.text.secondary} />
            <Text style={styles.productMetaText}>Stock: {item.stock}</Text>
          </View>
        </View>
      </View>

      <View style={styles.productActions}>
        {isAdminOrSuperAdmin ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${theme.colors.primary}20` }]}
            onPress={() => handleTransferPress(item)}
          >
            <Repeat size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${theme.colors.accent}20` }]}
            onPress={() => handleRequestPress(item)}
          >
            <Send size={20} color={theme.colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRequestItem = ({ item }: { item: TransferRequest }) => {
    let statusColor;
    let StatusIcon;

    switch (item.status) {
      case 'pending':
        statusColor = theme.colors.status.warning;
        StatusIcon = Clock;
        break;
      case 'approved':
        statusColor = theme.colors.status.info;
        StatusIcon = CheckCircle;
        break;
      case 'rejected':
        statusColor = theme.colors.status.error;
        StatusIcon = XCircle;
        break;
      case 'completed':
        statusColor = theme.colors.status.success;
        StatusIcon = CheckCircle;
        break;
      default:
        statusColor = theme.colors.text.secondary;
        StatusIcon = AlertTriangle;
    }

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>

        <View style={styles.requestDetails}>
          <View style={styles.requestDetailItem}>
            <Package size={14} color={theme.colors.text.secondary} />
            <Text style={styles.requestDetailText}>Qty: {item.quantity}</Text>
          </View>

          <View style={styles.requestDetailItem}>
            <MapPin size={14} color={theme.colors.text.secondary} />
            <Text style={styles.requestDetailText}>
              {item.sourceLocation} → {item.destinationLocation}
            </Text>
          </View>

          <View style={styles.requestDetailItem}>
            <User size={14} color={theme.colors.text.secondary} />
            <Text style={styles.requestDetailText}>{item.requestedBy}</Text>
          </View>

          <View style={styles.requestDetailItem}>
            <Calendar size={14} color={theme.colors.text.secondary} />
            <Text style={styles.requestDetailText}>
              {item.requestedAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isAdminOrSuperAdmin && item.status === 'pending' && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.requestActionButton, { backgroundColor: `${theme.colors.status.success}20` }]}
            >
              <CheckCircle size={18} color={theme.colors.status.success} />
              <Text style={[styles.requestActionText, { color: theme.colors.status.success }]}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.requestActionButton, { backgroundColor: `${theme.colors.status.error}20` }]}
            >
              <XCircle size={18} color={theme.colors.status.error} />
              <Text style={[styles.requestActionText, { color: theme.colors.status.error }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <View
          style={styles.filterModalContainer}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterModalContent}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptions}>
                {['Sofa Fabrics', 'Curtain Fabrics', 'Artificial Leather', 'Garments'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      filters.category === category && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      category: prev.category === category ? '' : category
                    }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.category === category && styles.filterOptionTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.filterOptions}>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.filterOption,
                      filters.location === location && styles.filterOptionSelected
                    ]}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                      location: prev.location === location ? '' : location
                    }))}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.location === location && styles.filterOptionTextSelected
                      ]}
                    >
                      {location}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter (for requests tab) */}
            {activeTab === 'requests' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  {['pending', 'approved', 'rejected', 'completed'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterOption,
                        filters.status === status && styles.filterOptionSelected
                      ]}
                      onPress={() => setFilters(prev => ({
                        ...prev,
                        status: prev.status === status ? '' : status
                      }))}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filters.status === status && styles.filterOptionTextSelected
                        ]}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity
              style={styles.resetFilterButton}
              onPress={() => setFilters({
                category: '',
                location: '',
                status: '',
                dateRange: { start: null, end: null },
              })}
            >
              <Text style={styles.resetFilterText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyFilterButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyFilterText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderStatusTab = () => (
    <ScrollView
      style={styles.statusContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.statusSection}>
        <Text style={styles.statusSectionTitle}>Transfer Summary</Text>

        <View style={styles.statusCards}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Repeat size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.statusValue}>24</Text>
            <Text style={styles.statusLabel}>Total Transfers</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.status.success}20` }]}>
              <CheckCircle size={24} color={theme.colors.status.success} />
            </View>
            <Text style={styles.statusValue}>18</Text>
            <Text style={styles.statusLabel}>Completed</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.status.warning}20` }]}>
              <Clock size={24} color={theme.colors.status.warning} />
            </View>
            <Text style={styles.statusValue}>6</Text>
            <Text style={styles.statusLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.statusSectionTitle}>Request Summary</Text>

        <View style={styles.statusCards}>
          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.accent}20` }]}>
              <Send size={24} color={theme.colors.accent} />
            </View>
            <Text style={styles.statusValue}>32</Text>
            <Text style={styles.statusLabel}>Total Requests</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.status.info}20` }]}>
              <CheckCircle size={24} color={theme.colors.status.info} />
            </View>
            <Text style={styles.statusValue}>21</Text>
            <Text style={styles.statusLabel}>Approved</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={[styles.statusIconContainer, { backgroundColor: `${theme.colors.status.error}20` }]}>
              <XCircle size={24} color={theme.colors.status.error} />
            </View>
            <Text style={styles.statusValue}>5</Text>
            <Text style={styles.statusLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.statusSectionTitle}>Recent Activity</Text>

        <View style={styles.activityList}>
          {mockTransferRequests.map((request) => {
            let statusColor;
            let StatusIcon;

            switch (request.status) {
              case 'pending':
                statusColor = theme.colors.status.warning;
                StatusIcon = Clock;
                break;
              case 'approved':
                statusColor = theme.colors.status.info;
                StatusIcon = CheckCircle;
                break;
              case 'rejected':
                statusColor = theme.colors.status.error;
                StatusIcon = XCircle;
                break;
              case 'completed':
                statusColor = theme.colors.status.success;
                StatusIcon = CheckCircle;
                break;
              default:
                statusColor = theme.colors.text.secondary;
                StatusIcon = AlertTriangle;
            }

            return (
              <View key={request.id} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: `${statusColor}20` }]}>
                  <StatusIcon size={16} color={statusColor} />
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {request.productName} ({request.quantity} units)
                  </Text>

                  <Text style={styles.activitySubtitle}>
                    {request.sourceLocation} → {request.destinationLocation}
                  </Text>

                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTime}>
                      {request.requestedAt.toLocaleDateString()}
                    </Text>

                    <View style={[styles.activityStatus, { backgroundColor: `${statusColor}20` }]}>
                      <Text style={[styles.activityStatusText, { color: statusColor }]}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SharedLayout title="Transfer">
      <SafeAreaView style={styles.container}>
        {renderTabBar()}
        {renderSearchBar()}

        {activeTab === 'products' && (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {activeTab === 'requests' && (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {activeTab === 'status' && renderStatusTab()}

        {renderFilterModal()}

        {showTransferForm && (
          <TransferForm
            visible={showTransferForm}
            onClose={() => setShowTransferForm(false)}
            onSubmit={handleTransferSubmit}
            product={selectedProduct}
            locations={locations}
          />
        )}

        {showRequestForm && (
          <TransferRequestForm
            visible={showRequestForm}
            onClose={() => setShowRequestForm(false)}
            onSubmit={handleRequestSubmit}
            product={selectedProduct}
            locations={locations}
          />
        )}
      </SafeAreaView>
    </SharedLayout>
  );
}