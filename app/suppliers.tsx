import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Plus,
  Search,
  Filter,
  Download,
  Truck,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Building,
  User,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';
import TopNavBar from '@/components/TopNavBar';

// Interfaces
interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  supplierType: 'Manufacturer' | 'Distributor' | 'Wholesaler' | 'Retailer';
  paymentTerms: number;
  creditLimit: number;
  registrationDate: Date;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  isActive: boolean;
  rating: number;
  notes: string;
  createdBy: string;
  lastUpdated: Date;
}

interface SupplierFilters {
  search?: string;
  supplierType?: 'Manufacturer' | 'Distributor' | 'Wholesaler' | 'Retailer';
  isActive?: boolean;
  rating?: number;
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Ahmed Textiles',
    companyName: 'Ahmed Textiles Ltd.',
    email: 'contact@ahmedtextiles.com',
    phone: '+880-1234-567890',
    address: 'Dhaka Industrial Area, Bangladesh',
    contactPerson: 'Mr. Ahmed Rahman',
    supplierType: 'Manufacturer',
    paymentTerms: 30,
    creditLimit: 500000,
    registrationDate: new Date('2024-01-15'),
    totalOrders: 45,
    totalSpent: 2500000,
    averageOrderValue: 55555,
    lastOrderDate: new Date('2025-01-05'),
    isActive: true,
    rating: 4.8,
    notes: 'Excellent quality fabrics, reliable delivery',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Bengal Fabrics',
    companyName: 'Bengal Fabrics Corporation',
    email: 'info@bengalfabrics.bd',
    phone: '+880-1234-567891',
    address: 'Chittagong, Bangladesh',
    contactPerson: 'Ms. Fatima Khan',
    supplierType: 'Distributor',
    paymentTerms: 15,
    creditLimit: 300000,
    registrationDate: new Date('2024-02-01'),
    totalOrders: 28,
    totalSpent: 850000,
    averageOrderValue: 30357,
    lastOrderDate: new Date('2025-01-08'),
    isActive: true,
    rating: 4.2,
    notes: 'Good variety of curtain materials',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Modern Leather Co.',
    companyName: 'Modern Leather Company',
    email: 'orders@modernleather.com',
    phone: '+880-1234-567892',
    address: 'Savar, Dhaka, Bangladesh',
    contactPerson: 'Mr. Karim Hassan',
    supplierType: 'Manufacturer',
    paymentTerms: 45,
    creditLimit: 750000,
    registrationDate: new Date('2024-01-10'),
    totalOrders: 32,
    totalSpent: 1200000,
    averageOrderValue: 37500,
    lastOrderDate: new Date('2024-12-20'),
    isActive: false,
    rating: 3.8,
    notes: 'Quality issues in recent orders',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Premium Silk Mills',
    companyName: 'Premium Silk Mills Ltd.',
    email: 'sales@premiumsilk.com',
    phone: '+880-1234-567893',
    address: 'Rajshahi, Bangladesh',
    contactPerson: 'Mr. Nasir Ahmed',
    supplierType: 'Manufacturer',
    paymentTerms: 30,
    creditLimit: 600000,
    registrationDate: new Date('2023-11-20'),
    totalOrders: 38,
    totalSpent: 1800000,
    averageOrderValue: 47368,
    lastOrderDate: new Date('2025-01-02'),
    isActive: true,
    rating: 4.5,
    notes: 'High quality silk products, premium pricing',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Budget Textiles',
    companyName: 'Budget Textiles Co.',
    email: 'info@budgettextiles.bd',
    phone: '+880-1234-567894',
    address: 'Gazipur, Bangladesh',
    contactPerson: 'Ms. Rashida Begum',
    supplierType: 'Wholesaler',
    paymentTerms: 15,
    creditLimit: 200000,
    registrationDate: new Date('2024-04-10'),
    totalOrders: 22,
    totalSpent: 480000,
    averageOrderValue: 21818,
    lastOrderDate: new Date('2024-12-15'),
    isActive: true,
    rating: 3.9,
    notes: 'Cost-effective options, average quality',
    createdBy: 'Sales User',
    lastUpdated: new Date(),
  },
];

export default function SuppliersPage() {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [filters, setFilters] = useState<SupplierFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      if (filters.search && 
          !supplier.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !supplier.companyName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !supplier.contactPerson.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.supplierType && supplier.supplierType !== filters.supplierType) {
        return false;
      }
      if (filters.isActive !== undefined && supplier.isActive !== filters.isActive) {
        return false;
      }
      if (filters.rating && supplier.rating < filters.rating) {
        return false;
      }
      return true;
    });
  }, [suppliers, filters]);

  const analytics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.isActive).length;
    const averageRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers;
    const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);

    return {
      totalSuppliers,
      activeSuppliers,
      averageRating,
      totalSpent,
    };
  }, [suppliers]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'Manufacturer': return theme.colors.primary;
      case 'Distributor': return theme.colors.status.info;
      case 'Wholesaler': return theme.colors.status.warning;
      case 'Retailer': return theme.colors.status.success;
      default: return theme.colors.text.secondary;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return theme.colors.status.success;
    if (rating >= 4.0) return theme.colors.status.warning;
    if (rating >= 3.5) return theme.colors.status.info;
    return theme.colors.status.error;
  };

  const handleAction = (action: string, supplier: Supplier) => {
    switch (action) {
      case 'view':
        Alert.alert('View Details', `Viewing details for ${supplier.name}`);
        break;
      case 'edit':
        if (!hasPermission('suppliers', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to edit suppliers.');
          return;
        }
        Alert.alert('Edit Supplier', `Editing ${supplier.name}`);
        break;
      case 'activate':
        if (!hasPermission('suppliers', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to manage supplier status.');
          return;
        }
        const action = supplier.isActive ? 'Deactivate' : 'Activate';
        Alert.alert(`${action} Supplier`, `${action} ${supplier.name}?`);
        break;
      case 'contact':
        Alert.alert('Contact Supplier', `Contacting ${supplier.contactPerson} at ${supplier.phone}`);
        break;
    }
  };

  const renderKPICards = () => (
    <View style={styles.kpiContainer}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Truck size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.totalSuppliers}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Total Suppliers</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.success + '20' }]}>
            <UserCheck size={24} color={theme.colors.status.success} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.activeSuppliers}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Active Suppliers</Text>
        </View>
      </View>
      
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.warning + '20' }]}>
            <Star size={24} color={theme.colors.status.warning} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.averageRating.toFixed(1)}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Average Rating</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.info + '20' }]}>
            <DollarSign size={24} color={theme.colors.status.info} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>৳{analytics.totalSpent.toLocaleString()}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Total Spent</Text>
        </View>
      </View>
    </View>
  );

  const renderStarRating = (rating: number) => (
    <View style={styles.ratingContainer}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= rating ? theme.colors.status.warning : theme.colors.text.muted}
            fill={star <= rating ? theme.colors.status.warning : 'none'}
          />
        ))}
      </View>
      <Text style={[styles.ratingText, { color: getRatingColor(rating) }]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.itemHeader}>
        <View style={styles.supplierInfo}>
          <View style={styles.supplierAvatar}>
            <View style={[
              styles.avatar,
              { backgroundColor: item.isActive ? getSupplierTypeColor(item.supplierType) : theme.colors.text.muted }
            ]}>
              <Text style={[styles.avatarText, { color: theme.colors.text.inverse }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.supplierDetails}>
              <Text style={[styles.supplierName, { 
                color: item.isActive ? theme.colors.text.primary : theme.colors.text.muted 
              }]}>
                {item.name}
              </Text>
              <Text style={[styles.companyName, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                {item.companyName}
              </Text>
              <View style={styles.supplierTypeContainer}>
                <Text style={[
                  styles.supplierType,
                  { 
                    color: getSupplierTypeColor(item.supplierType),
                    backgroundColor: getSupplierTypeColor(item.supplierType) + '20'
                  }
                ]}>
                  {item.supplierType}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statusContainer}>
            {item.isActive ? (
              <CheckCircle size={16} color={theme.colors.status.success} />
            ) : (
              <XCircle size={16} color={theme.colors.status.error} />
            )}
            <Text style={[
              styles.statusText, 
              { color: item.isActive ? theme.colors.status.success : theme.colors.status.error }
            ]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <User size={12} color={theme.colors.text.muted} />
          <Text style={[styles.contactText, { color: theme.colors.text.muted }]}>
            {item.contactPerson}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Phone size={12} color={theme.colors.text.muted} />
          <Text style={[styles.contactText, { color: theme.colors.text.muted }]}>
            {item.phone}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Mail size={12} color={theme.colors.text.muted} />
          <Text style={[styles.contactText, { color: theme.colors.text.muted }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <MapPin size={12} color={theme.colors.text.muted} />
          <Text style={[styles.contactText, { color: theme.colors.text.muted }]} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Orders</Text>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              {item.totalOrders}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Spent</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              ৳{item.totalSpent.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Avg Order</Text>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
              ৳{item.averageOrderValue.toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Rating:</Text>
          {renderStarRating(item.rating)}
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Last Order:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {item.lastOrderDate ? item.lastOrderDate.toLocaleDateString() : 'Never'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Payment Terms:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {item.paymentTerms} days
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Credit Limit:</Text>
          <Text style={[styles.detailValue, { color: theme.colors.status.info }]}>
            ৳{item.creditLimit.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.status.info + '20' }]}
          onPress={() => handleAction('view', item)}
        >
          <Eye size={16} color={theme.colors.status.info} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => handleAction('contact', item)}
        >
          <Phone size={16} color={theme.colors.primary} />
        </TouchableOpacity>
        
        {hasPermission('suppliers', 'edit') && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
              onPress={() => handleAction('edit', item)}
            >
              <Edit size={16} color={theme.colors.status.warning} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: item.isActive ? theme.colors.status.error + '20' : theme.colors.status.success + '20' 
              }]}
              onPress={() => handleAction('activate', item)}
            >
              {item.isActive ? 
                <UserX size={16} color={theme.colors.status.error} /> :
                <UserCheck size={16} color={theme.colors.status.success} />
              }
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavBar
        title="Supplier Management"
        subtitle={`${filteredSuppliers.length} suppliers`}
        showBackButton={true}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            >
              <Download size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            {hasPermission('suppliers', 'add') && (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/add')}
              >
                <Plus size={20} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        {renderKPICards()}

        {/* Search and Filters */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
            <Search size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Search suppliers..."
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

        {/* Suppliers List */}
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Truck size={48} color={theme.colors.text.muted} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No suppliers found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text.muted }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </ScrollView>

      <BottomNavBar activeTab="suppliers" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  kpiContainer: {
    padding: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
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
  listContainer: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 12,
  },
  supplierInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  supplierAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  supplierDetails: {
    flex: 1,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 12,
    marginBottom: 4,
  },
  supplierTypeContainer: {
    flexDirection: 'row',
  },
  supplierType: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    textAlign: 'center',
    overflow: 'hidden',
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
  contactInfo: {
    marginBottom: 12,
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    flex: 1,
  },
  itemDetails: {
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemActions: {
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