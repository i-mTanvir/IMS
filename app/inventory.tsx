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
  ArrowRightLeft,
  Warehouse,
  Store,
  AlertTriangle,
  TrendingUp,
  Package,
  MapPin,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import BottomNavBar from '@/components/BottomNavBar';
import TopNavBar from '@/components/TopNavBar';

// Interfaces
interface Location {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'showroom';
  address: string;
  capacity: number;
  currentStock: number;
  manager: string;
  phone: string;
  isActive: boolean;
  createdDate: Date;
}

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  locationId: string;
  locationName: string;
  locationType: 'warehouse' | 'showroom';
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumThreshold: number;
  maximumCapacity: number;
  lastUpdated: Date;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Transfer in Progress' | 'Reserved';
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  productId: string;
  productName: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  quantity: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'In Transit' | 'Completed' | 'Cancelled';
  requestedBy: string;
  approvedBy?: string;
  requestDate: Date;
  approvedDate?: Date;
  completedDate?: Date;
  notes?: string;
}

interface InventoryFilters {
  search?: string;
  location?: string;
  locationType?: 'warehouse' | 'showroom';
  status?: string;
  lowStockOnly?: boolean;
}

// Mock data
const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Main Warehouse',
    code: 'WH001',
    type: 'warehouse',
    address: 'Dhaka Industrial Area, Bangladesh',
    capacity: 10000,
    currentStock: 7500,
    manager: 'Ahmed Rahman',
    phone: '+880-1234-567890',
    isActive: true,
    createdDate: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Gulshan Showroom',
    code: 'SR001',
    type: 'showroom',
    address: 'Gulshan Avenue, Dhaka',
    capacity: 2000,
    currentStock: 1800,
    manager: 'Fatima Khan',
    phone: '+880-1234-567891',
    isActive: true,
    createdDate: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Dhanmondi Showroom',
    code: 'SR002',
    type: 'showroom',
    address: 'Dhanmondi Road 27, Dhaka',
    capacity: 1500,
    currentStock: 1200,
    manager: 'Karim Hassan',
    phone: '+880-1234-567892',
    isActive: true,
    createdDate: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Chittagong Warehouse',
    code: 'WH002',
    type: 'warehouse',
    address: 'Chittagong Port Area',
    capacity: 8000,
    currentStock: 5200,
    manager: 'Nasir Ahmed',
    phone: '+880-1234-567893',
    isActive: true,
    createdDate: new Date('2024-02-15'),
  },
];

const mockStockItems: StockItem[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Premium Velvet Sofa Fabric',
    productCode: '#LWIL02012',
    locationId: '1',
    locationName: 'Main Warehouse',
    locationType: 'warehouse',
    quantity: 450,
    reservedQuantity: 50,
    availableQuantity: 400,
    minimumThreshold: 100,
    maximumCapacity: 500,
    lastUpdated: new Date(),
    status: 'In Stock',
  },
  {
    id: '2',
    productName: 'Silk Curtain Material',
    productId: '2',
    productCode: '#LWIL02013',
    locationId: '2',
    locationName: 'Gulshan Showroom',
    locationType: 'showroom',
    quantity: 25,
    reservedQuantity: 5,
    availableQuantity: 20,
    minimumThreshold: 30,
    maximumCapacity: 100,
    lastUpdated: new Date(),
    status: 'Low Stock',
  },
  {
    id: '3',
    productName: 'Leather Upholstery',
    productId: '3',
    productCode: '#LWIL02014',
    locationId: '3',
    locationName: 'Dhanmondi Showroom',
    locationType: 'showroom',
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    minimumThreshold: 20,
    maximumCapacity: 80,
    lastUpdated: new Date(),
    status: 'Out of Stock',
  },
  {
    id: '4',
    productName: 'Cotton Blend Fabric',
    productId: '4',
    productCode: '#LWIL02015',
    locationId: '4',
    locationName: 'Chittagong Warehouse',
    locationType: 'warehouse',
    quantity: 320,
    reservedQuantity: 20,
    availableQuantity: 300,
    minimumThreshold: 50,
    maximumCapacity: 400,
    lastUpdated: new Date(),
    status: 'In Stock',
  },
  {
    id: '5',
    productName: 'Decorative Curtain Fabric',
    productId: '5',
    productCode: '#LWIL02016',
    locationId: '1',
    locationName: 'Main Warehouse',
    locationType: 'warehouse',
    quantity: 180,
    reservedQuantity: 30,
    availableQuantity: 150,
    minimumThreshold: 80,
    maximumCapacity: 200,
    lastUpdated: new Date(),
    status: 'In Stock',
  },
];

const mockTransfers: StockTransfer[] = [
  {
    id: '1',
    transferNumber: 'TRF-2025-001',
    productId: '1',
    productName: 'Premium Velvet Sofa Fabric',
    fromLocationId: '1',
    fromLocationName: 'Main Warehouse',
    toLocationId: '2',
    toLocationName: 'Gulshan Showroom',
    quantity: 50,
    reason: 'Showroom stock replenishment',
    status: 'In Transit',
    requestedBy: 'Fatima Khan',
    approvedBy: 'Ahmed Rahman',
    requestDate: new Date('2025-01-08'),
    approvedDate: new Date('2025-01-08'),
    notes: 'Urgent transfer for customer display',
  },
  {
    id: '2',
    transferNumber: 'TRF-2025-002',
    productId: '2',
    productName: 'Silk Curtain Material',
    fromLocationId: '4',
    fromLocationName: 'Chittagong Warehouse',
    toLocationId: '3',
    toLocationName: 'Dhanmondi Showroom',
    quantity: 30,
    reason: 'New product introduction',
    status: 'Pending',
    requestedBy: 'Karim Hassan',
    requestDate: new Date('2025-01-09'),
    notes: 'Waiting for approval',
  },
];

export default function InventoryPage() {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stock' | 'locations' | 'transfers'>('stock');
  const [stockItems] = useState<StockItem[]>(mockStockItems);
  const [locations] = useState<Location[]>(mockLocations);
  const [transfers] = useState<StockTransfer[]>(mockTransfers);
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [refreshing, setRefreshing] = useState(false);

  const filteredStockItems = useMemo(() => {
    return stockItems.filter(item => {
      if (filters.search && 
          !item.productName.toLowerCase().includes(filters.search.toLowerCase()) && 
          !item.productCode.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.location && item.locationId !== filters.location) {
        return false;
      }
      if (filters.locationType && item.locationType !== filters.locationType) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.lowStockOnly && item.status !== 'Low Stock') {
        return false;
      }
      return true;
    });
  }, [stockItems, filters]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return theme.colors.status.success;
      case 'Low Stock': return theme.colors.status.warning;
      case 'Out of Stock': return theme.colors.status.error;
      case 'Transfer in Progress': return theme.colors.status.info;
      case 'Reserved': return theme.colors.primary;
      case 'Pending': return theme.colors.status.warning;
      case 'Approved': return theme.colors.status.success;
      case 'In Transit': return theme.colors.status.info;
      case 'Completed': return theme.colors.status.success;
      case 'Cancelled': return theme.colors.status.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock': return CheckCircle;
      case 'Low Stock': return AlertTriangle;
      case 'Out of Stock': return XCircle;
      case 'Transfer in Progress': return ArrowRightLeft;
      case 'Reserved': return Package;
      case 'Pending': return Clock;
      case 'Approved': return CheckCircle;
      case 'In Transit': return ArrowRightLeft;
      case 'Completed': return CheckCircle;
      case 'Cancelled': return XCircle;
      default: return Package;
    }
  };

  const handleAction = (action: string, item: any) => {
    switch (action) {
      case 'view':
        Alert.alert('View Details', `Viewing details for ${item.productName || item.name || item.transferNumber}`);
        break;
      case 'edit':
        if (!hasPermission('inventory', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to edit inventory.');
          return;
        }
        Alert.alert('Edit Item', `Editing ${item.productName || item.name || item.transferNumber}`);
        break;
      case 'transfer':
        if (!hasPermission('inventory', 'transfer')) {
          Alert.alert('Permission Denied', 'You do not have permission to transfer stock.');
          return;
        }
        Alert.alert('Transfer Stock', `Initiating transfer for ${item.productName}`);
        break;
      case 'approve':
        if (!hasPermission('inventory', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to approve transfers.');
          return;
        }
        Alert.alert('Approve Transfer', `Approving transfer ${item.transferNumber}`);
        break;
    }
  };

  const renderKPICards = () => (
    <View style={styles.kpiContainer}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Package size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>2,847</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Total Stock Items</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.warning + '20' }]}>
            <AlertTriangle size={24} color={theme.colors.status.warning} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>23</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Low Stock Items</Text>
        </View>
      </View>
      
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.info + '20' }]}>
            <ArrowRightLeft size={24} color={theme.colors.status.info} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>12</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Pending Transfers</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.success + '20' }]}>
            <TrendingUp size={24} color={theme.colors.status.success} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>87%</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Avg. Utilization</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'stock' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('stock')}
      >
        <Package size={18} color={activeTab === 'stock' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'stock' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          Stock Items
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'locations' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('locations')}
      >
        <MapPin size={18} color={activeTab === 'locations' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'locations' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          Locations
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'transfers' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('transfers')}
      >
        <ArrowRightLeft size={18} color={activeTab === 'transfers' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'transfers' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          Transfers
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStockItem = ({ item }: { item: StockItem }) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]} numberOfLines={2}>
              {item.productName}
            </Text>
            <Text style={[styles.itemCode, { color: theme.colors.text.secondary }]}>
              {item.productCode}
            </Text>
            <View style={styles.statusContainer}>
              <StatusIcon size={12} color={getStatusColor(item.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Location:</Text>
            <View style={styles.locationContainer}>
              {item.locationType === 'warehouse' ? 
                <Warehouse size={12} color={theme.colors.primary} /> :
                <Store size={12} color={theme.colors.status.info} />
              }
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                {item.locationName}
              </Text>
            </View>
          </View>
          
          <View style={styles.stockInfo}>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Available</Text>
              <Text style={[styles.stockValue, { color: theme.colors.primary }]}>{item.availableQuantity}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Reserved</Text>
              <Text style={[styles.stockValue, { color: theme.colors.status.warning }]}>{item.reservedQuantity}</Text>
            </View>
            <View style={styles.stockItem}>
              <Text style={[styles.stockLabel, { color: theme.colors.text.secondary }]}>Total</Text>
              <Text style={[styles.stockValue, { color: theme.colors.text.primary }]}>{item.quantity}</Text>
            </View>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.status.info + '20' }]}
            onPress={() => handleAction('view', item)}
          >
            <Eye size={16} color={theme.colors.status.info} />
          </TouchableOpacity>
          
          {hasPermission('inventory', 'edit') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
              onPress={() => handleAction('edit', item)}
            >
              <Edit size={16} color={theme.colors.status.warning} />
            </TouchableOpacity>
          )}
          
          {hasPermission('inventory', 'transfer') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={() => handleAction('transfer', item)}
            >
              <ArrowRightLeft size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderLocationItem = ({ item }: { item: Location }) => {
    const utilization = Math.round((item.currentStock / item.capacity) * 100);
    
    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
              {item.name}
            </Text>
            <Text style={[styles.itemCode, { color: theme.colors.text.secondary }]}>
              {item.code} • {item.address}
            </Text>
            <View style={styles.statusContainer}>
              {item.type === 'warehouse' ? 
                <Warehouse size={12} color={theme.colors.primary} /> :
                <Store size={12} color={theme.colors.status.info} />
              }
              <Text style={[styles.statusText, { color: item.type === 'warehouse' ? theme.colors.primary : theme.colors.status.info }]}>
                {item.type === 'warehouse' ? 'Warehouse' : 'Showroom'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Manager:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{item.manager}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Phone:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{item.phone}</Text>
          </View>
          
          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationHeader}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Utilization</Text>
              <Text style={[styles.utilizationPercent, { color: theme.colors.text.primary }]}>{utilization}%</Text>
            </View>
            <View style={[styles.utilizationBar, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <View style={[
                styles.utilizationFill,
                {
                  width: `${utilization}%`,
                  backgroundColor: utilization > 80 ? theme.colors.status.error : 
                                 utilization > 60 ? theme.colors.status.warning : theme.colors.status.success
                }
              ]} />
            </View>
            <View style={styles.capacityInfo}>
              <Text style={[styles.capacityText, { color: theme.colors.text.secondary }]}>
                {item.currentStock.toLocaleString()} / {item.capacity.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.status.info + '20' }]}
            onPress={() => handleAction('view', item)}
          >
            <Eye size={16} color={theme.colors.status.info} />
          </TouchableOpacity>
          
          {hasPermission('inventory', 'edit') && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
              onPress={() => handleAction('edit', item)}
            >
              <Edit size={16} color={theme.colors.status.warning} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderTransferItem = ({ item }: { item: StockTransfer }) => {
    const StatusIcon = getStatusIcon(item.status);
    
    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
              {item.transferNumber}
            </Text>
            <Text style={[styles.itemCode, { color: theme.colors.text.secondary }]}>
              {item.productName}
            </Text>
            <View style={styles.statusContainer}>
              <StatusIcon size={12} color={getStatusColor(item.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.transferRoute}>
            <View style={styles.transferLocation}>
              <Text style={[styles.transferLabel, { color: theme.colors.text.secondary }]}>From:</Text>
              <Text style={[styles.transferValue, { color: theme.colors.text.primary }]}>{item.fromLocationName}</Text>
            </View>
            <ArrowRightLeft size={16} color={theme.colors.text.muted} />
            <View style={styles.transferLocation}>
              <Text style={[styles.transferLabel, { color: theme.colors.text.secondary }]}>To:</Text>
              <Text style={[styles.transferValue, { color: theme.colors.text.primary }]}>{item.toLocationName}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Quantity:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.primary }]}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Requested by:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>{item.requestedBy}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {item.requestDate.toLocaleDateString()}
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
          
          {hasPermission('inventory', 'edit') && item.status === 'Pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.status.success + '20' }]}
              onPress={() => handleAction('approve', item)}
            >
              <CheckCircle size={16} color={theme.colors.status.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Union type for all possible data items
  type InventoryItem = StockItem | Location | StockTransfer;

  const getCurrentData = (): InventoryItem[] => {
    switch (activeTab) {
      case 'stock':
        return filteredStockItems;
      case 'locations':
        return locations;
      case 'transfers':
        return transfers;
      default:
        return [];
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    switch (activeTab) {
      case 'stock':
        return renderStockItem({ item: item as StockItem });
      case 'locations':
        return renderLocationItem({ item: item as Location });
      case 'transfers':
        return renderTransferItem({ item: item as StockTransfer });
      default:
        return renderStockItem({ item: item as StockItem });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TopNavBar
        title="Inventory Management"
        subtitle={`${getCurrentData().length} ${activeTab}`}
        showBackButton={true}
        rightContent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: theme.colors.backgroundSecondary }]}
            >
              <Download size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            {hasPermission('inventory', 'add') && (
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

        {/* Tabs */}
        {renderTabs()}

        {/* Search and Filters */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
            <Search size={20} color={theme.colors.text.secondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              placeholder="Search ..."
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

        {/* Data List */}
        <FlatList<InventoryItem>
          data={getCurrentData()}
          renderItem={renderInventoryItem}
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
              <Package size={48} color={theme.colors.text.muted} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No {activeTab} found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text.muted }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </ScrollView>

      <BottomNavBar activeTab="inventory" />
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
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
    gap: 12,
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCode: {
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
  itemDetails: {
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
  utilizationContainer: {
    marginTop: 8,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  utilizationBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  capacityText: {
    fontSize: 10,
  },
  transferRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 8,
  },
  transferLocation: {
    flex: 1,
    alignItems: 'center',
  },
  transferLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  transferValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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