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
  Users,
  Crown,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Clock,
  UserX,
  UserCheck,
  Star,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';
import CustomerAddForm from '@/components/forms/CustomerAddForm';

// Interfaces
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customerType: 'VIP' | 'Regular' | 'Wholesale';
  creditLimit: number;
  paymentTerms: number;
  registrationDate: Date;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: Date;
  purchaseFrequency: number;
  isActive: boolean;
  isRedListed: boolean;
  redListDate?: Date;
  redListReason?: string;
  paymentStatus: 'Good' | 'Warning' | 'Overdue' | 'Red Listed';
  outstandingAmount: number;
  daysPastDue: number;
  communicationPreferences: string[];
  notes: string;
  createdBy: string;
  lastUpdated: Date;
}

interface PurchaseHistory {
  id: string;
  customerId: string;
  saleId: string;
  saleNumber: string;
  purchaseDate: Date;
  products: {
    productId: string;
    productName: string;
    productCode: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'Good' | 'Warning' | 'Overdue' | 'Red Listed';
  dueDate?: Date;
  paidAmount: number;
  remainingAmount: number;
  notes: string;
}

interface CustomerFilters {
  search?: string;
  customerType?: 'VIP' | 'Regular' | 'Wholesale';
  paymentStatus?: 'Good' | 'Warning' | 'Overdue' | 'Red Listed';
  isRedListed?: boolean;
  isActive?: boolean;
}

// Mock data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rahman Furniture',
    email: 'contact@rahmanfurniture.com',
    phone: '+880-1234-567890',
    address: 'Gulshan-2, Dhaka, Bangladesh',
    customerType: 'VIP',
    creditLimit: 500000,
    paymentTerms: 30,
    registrationDate: new Date('2024-01-15'),
    totalPurchases: 45,
    totalSpent: 2500000,
    averageOrderValue: 55555,
    lastPurchaseDate: new Date('2025-01-05'),
    purchaseFrequency: 3.2,
    isActive: true,
    isRedListed: false,
    paymentStatus: 'Good',
    outstandingAmount: 0,
    daysPastDue: 0,
    communicationPreferences: ['Email', 'Phone'],
    notes: 'Premium customer with excellent payment history',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Elite Interiors',
    email: 'info@eliteinteriors.bd',
    phone: '+880-1234-567891',
    address: 'Dhanmondi, Dhaka, Bangladesh',
    customerType: 'Regular',
    creditLimit: 200000,
    paymentTerms: 15,
    registrationDate: new Date('2024-02-01'),
    totalPurchases: 28,
    totalSpent: 850000,
    averageOrderValue: 30357,
    lastPurchaseDate: new Date('2025-01-08'),
    purchaseFrequency: 2.1,
    isActive: true,
    isRedListed: false,
    paymentStatus: 'Warning',
    outstandingAmount: 26400,
    daysPastDue: 5,
    communicationPreferences: ['Email', 'SMS'],
    notes: 'Regular customer, sometimes delays payments',
    createdBy: 'Sales User',
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Modern Home Decor',
    email: 'orders@modernhomedecor.com',
    phone: '+880-1234-567892',
    address: 'Uttara, Dhaka, Bangladesh',
    customerType: 'Wholesale',
    creditLimit: 1000000,
    paymentTerms: 45,
    registrationDate: new Date('2024-01-10'),
    totalPurchases: 67,
    totalSpent: 4200000,
    averageOrderValue: 62686,
    lastPurchaseDate: new Date('2024-11-15'),
    purchaseFrequency: 4.8,
    isActive: true,
    isRedListed: true,
    redListDate: new Date('2024-12-30'),
    redListReason: 'Payment overdue for 65 days',
    paymentStatus: 'Red Listed',
    outstandingAmount: 104000,
    daysPastDue: 65,
    communicationPreferences: ['Email', 'Phone', 'WhatsApp'],
    notes: 'High volume customer but payment issues',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Comfort Living Ltd',
    email: 'sales@comfortliving.bd',
    phone: '+880-1234-567893',
    address: 'Banani, Dhaka, Bangladesh',
    customerType: 'VIP',
    creditLimit: 750000,
    paymentTerms: 30,
    registrationDate: new Date('2023-12-01'),
    totalPurchases: 52,
    totalSpent: 3200000,
    averageOrderValue: 61538,
    lastPurchaseDate: new Date('2025-01-03'),
    purchaseFrequency: 3.8,
    isActive: true,
    isRedListed: false,
    paymentStatus: 'Good',
    outstandingAmount: 0,
    daysPastDue: 0,
    communicationPreferences: ['Email', 'Phone'],
    notes: 'Excellent customer with consistent orders',
    createdBy: 'Admin User',
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Budget Furniture House',
    email: 'info@budgetfurniture.com',
    phone: '+880-1234-567894',
    address: 'Mirpur, Dhaka, Bangladesh',
    customerType: 'Regular',
    creditLimit: 150000,
    paymentTerms: 15,
    registrationDate: new Date('2024-03-15'),
    totalPurchases: 18,
    totalSpent: 420000,
    averageOrderValue: 23333,
    lastPurchaseDate: new Date('2024-12-20'),
    purchaseFrequency: 1.8,
    isActive: true,
    isRedListed: false,
    paymentStatus: 'Overdue',
    outstandingAmount: 45000,
    daysPastDue: 25,
    communicationPreferences: ['Phone', 'SMS'],
    notes: 'Small orders, occasional payment delays',
    createdBy: 'Sales User',
    lastUpdated: new Date(),
  },
];

const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: '1',
    customerId: '1',
    saleId: 'SAL-2025-001',
    saleNumber: 'SAL-2025-001',
    purchaseDate: new Date('2025-01-05'),
    products: [
      {
        productId: '1',
        productName: 'Premium Velvet Sofa Fabric',
        productCode: '#LWIL02012',
        category: 'Sofa Fabrics',
        quantity: 50,
        unitPrice: 1200,
        totalPrice: 60000,
      }
    ],
    subtotal: 60000,
    discountAmount: 3000,
    taxAmount: 5700,
    totalAmount: 62700,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Good',
    paidAmount: 62700,
    remainingAmount: 0,
    notes: 'Premium customer order',
  },
  {
    id: '2',
    customerId: '2',
    saleId: 'SAL-2025-002',
    saleNumber: 'SAL-2025-002',
    purchaseDate: new Date('2025-01-08'),
    products: [
      {
        productId: '2',
        productName: 'Silk Curtain Material',
        productCode: '#LWIL02013',
        category: 'Curtains',
        quantity: 30,
        unitPrice: 800,
        totalPrice: 24000,
      }
    ],
    subtotal: 24000,
    discountAmount: 0,
    taxAmount: 2400,
    totalAmount: 26400,
    paymentMethod: 'Cash',
    paymentStatus: 'Warning',
    dueDate: new Date('2025-01-23'),
    paidAmount: 0,
    remainingAmount: 26400,
    notes: 'Payment pending',
  },
];

export default function CustomersPage() {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'customers' | 'purchase-history' | 'red-list' | 'top-customers'>('customers');
  const [customers] = useState<Customer[]>(mockCustomers);
  const [purchaseHistory] = useState<PurchaseHistory[]>(mockPurchaseHistory);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (filters.search && 
          !customer.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !customer.email.toLowerCase().includes(filters.search.toLowerCase()) &&
          !customer.phone.includes(filters.search)) {
        return false;
      }
      if (filters.customerType && customer.customerType !== filters.customerType) {
        return false;
      }
      if (filters.paymentStatus && customer.paymentStatus !== filters.paymentStatus) {
        return false;
      }
      if (filters.isRedListed !== undefined && customer.isRedListed !== filters.isRedListed) {
        return false;
      }
      if (filters.isActive !== undefined && customer.isActive !== filters.isActive) {
        return false;
      }
      return true;
    });
  }, [customers, filters]);

  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const vipCustomers = customers.filter(c => c.customerType === 'VIP').length;
    const redListedCustomers = customers.filter(c => c.isRedListed).length;
    const averageCustomerValue = customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers;
    const topCustomersByRevenue = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      redListedCustomers,
      averageCustomerValue,
      topCustomersByRevenue,
    };
  }, [customers]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return theme.colors.status.success;
      case 'Warning': return theme.colors.status.warning;
      case 'Overdue': return theme.colors.status.error;
      case 'Red Listed': return theme.colors.status.error;
      default: return theme.colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Good': return CheckCircle;
      case 'Warning': return AlertTriangle;
      case 'Overdue': return Clock;
      case 'Red Listed': return XCircle;
      default: return Clock;
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'VIP': return theme.colors.status.warning;
      case 'Wholesale': return theme.colors.primary;
      case 'Regular': return theme.colors.status.info;
      default: return theme.colors.text.secondary;
    }
  };

  const handleAction = (action: string, item: any) => {
    switch (action) {
      case 'view':
        Alert.alert('View Details', `Viewing details for ${item.name || item.saleNumber}`);
        break;
      case 'edit':
        if (!hasPermission('customers', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to edit customers.');
          return;
        }
        Alert.alert('Edit Customer', `Editing ${item.name || item.saleNumber}`);
        break;
      case 'redlist':
        if (!hasPermission('customers', 'edit')) {
          Alert.alert('Permission Denied', 'You do not have permission to manage red list.');
          return;
        }
        const action = item.isRedListed ? 'Remove from' : 'Add to';
        Alert.alert(`${action} Red List`, `${action} red list for ${item.name}`);
        break;
      case 'reminder':
        Alert.alert('Send Reminder', `Sending payment reminder to ${item.name}`);
        break;
    }
  };

  const handleAddCustomer = () => {
    if (!hasPermission('customers', 'add')) {
      Alert.alert('Permission Denied', 'You do not have permission to add customers.');
      return;
    }
    setShowCustomerForm(true);
  };

  const handleCustomerSubmit = (data: any) => {
    console.log('Customer form submitted:', data);
    // Here you would normally add the customer to your database
    Alert.alert('Success', 'Customer added successfully!');
    setShowCustomerForm(false);
  };

  const renderKPICards = () => (
    <View style={styles.kpiContainer}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            <Users size={24} color={theme.colors.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.totalCustomers}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Total Customers</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.warning + '20' }]}>
            <Crown size={24} color={theme.colors.status.warning} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.vipCustomers}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>VIP Customers</Text>
        </View>
      </View>
      
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.error + '20' }]}>
            <AlertTriangle size={24} color={theme.colors.status.error} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>{analytics.redListedCustomers}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Red Listed</Text>
        </View>
        
        <View style={[styles.kpiCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.kpiIcon, { backgroundColor: theme.colors.status.success + '20' }]}>
            <DollarSign size={24} color={theme.colors.status.success} />
          </View>
          <Text style={[styles.kpiValue, { color: theme.colors.text.primary }]}>৳{Math.round(analytics.averageCustomerValue).toLocaleString()}</Text>
          <Text style={[styles.kpiLabel, { color: theme.colors.text.secondary }]}>Avg Customer Value</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'customers' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('customers')}
      >
        <Users size={16} color={activeTab === 'customers' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'customers' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'purchase-history' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('purchase-history')}
      >
        <Package size={16} color={activeTab === 'purchase-history' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'purchase-history' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          History
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'red-list' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('red-list')}
      >
        <AlertTriangle size={16} color={activeTab === 'red-list' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'red-list' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          Red List
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'top-customers' && { borderBottomColor: theme.colors.primary }]}
        onPress={() => setActiveTab('top-customers')}
      >
        <Star size={16} color={activeTab === 'top-customers' ? theme.colors.primary : theme.colors.text.secondary} />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'top-customers' ? theme.colors.primary : theme.colors.text.secondary }
        ]}>
          Top
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const StatusIcon = getStatusIcon(item.paymentStatus);
    
    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={styles.customerAvatar}>
            <View style={[
              styles.avatar,
              { backgroundColor: item.isRedListed ? theme.colors.status.error : getCustomerTypeColor(item.customerType) }
            ]}>
              <Text style={[styles.avatarText, { color: theme.colors.text.inverse }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={[
                styles.customerName, 
                { color: item.isRedListed ? theme.colors.status.error : theme.colors.text.primary }
              ]}>
                {item.name}
                {item.isRedListed && (
                  <Text style={[styles.redListBadge, { color: theme.colors.status.error }]}>
                    {' '}[RED LIST]
                  </Text>
                )}
              </Text>
              <View style={styles.customerTypeContainer}>
                <Text style={[
                  styles.customerType,
                  { 
                    color: getCustomerTypeColor(item.customerType),
                    backgroundColor: getCustomerTypeColor(item.customerType) + '20'
                  }
                ]}>
                  {item.customerType === 'VIP' && '👑 '}
                  {item.customerType}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <StatusIcon size={12} color={getStatusColor(item.paymentStatus)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.contactInfo}>
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
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Spent</Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                ৳{item.totalSpent.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Orders</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {item.totalPurchases}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Outstanding</Text>
              <Text style={[
                styles.statValue, 
                { color: item.outstandingAmount > 0 ? theme.colors.status.error : theme.colors.status.success }
              ]}>
                ৳{item.outstandingAmount.toLocaleString()}
              </Text>
            </View>
          </View>
          
          {item.daysPastDue > 0 && (
            <View style={styles.overdueContainer}>
              <AlertTriangle size={12} color={theme.colors.status.error} />
              <Text style={[styles.overdueText, { color: theme.colors.status.error }]}>
                {item.daysPastDue} days overdue
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Last Purchase:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {item.lastPurchaseDate ? item.lastPurchaseDate.toLocaleDateString() : 'Never'}
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
          
          {hasPermission('customers', 'edit') && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
                onPress={() => handleAction('edit', item)}
              >
                <Edit size={16} color={theme.colors.status.warning} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: item.isRedListed ? theme.colors.status.success + '20' : theme.colors.status.error + '20' 
                }]}
                onPress={() => handleAction('redlist', item)}
              >
                {item.isRedListed ? 
                  <UserCheck size={16} color={theme.colors.status.success} /> :
                  <UserX size={16} color={theme.colors.status.error} />
                }
              </TouchableOpacity>
            </>
          )}
          
          {item.outstandingAmount > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
              onPress={() => handleAction('reminder', item)}
            >
              <Clock size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderPurchaseHistoryItem = ({ item }: { item: PurchaseHistory }) => {
    const customer = customers.find(c => c.id === item.customerId);
    const StatusIcon = getStatusIcon(item.paymentStatus);
    
    return (
      <View style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
              {item.saleNumber}
            </Text>
            <Text style={[styles.itemCode, { color: theme.colors.text.secondary }]}>
              {customer?.name}
            </Text>
            <View style={styles.customerTypeContainer}>
              <Text style={[
                styles.customerType,
                { 
                  color: getCustomerTypeColor(customer?.customerType || 'Regular'),
                  backgroundColor: getCustomerTypeColor(customer?.customerType || 'Regular') + '20'
                }
              ]}>
                {customer?.customerType || 'Regular'}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <StatusIcon size={12} color={getStatusColor(item.paymentStatus)} />
            <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {item.purchaseDate.toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Products:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {item.products.length} item(s)
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Amount:</Text>
            <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
              ৳{item.totalAmount.toLocaleString()}
            </Text>
          </View>
          
          {item.discountAmount > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Discount:</Text>
              <Text style={[styles.discountValue, { color: theme.colors.status.success }]}>
                -৳{item.discountAmount.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>Outstanding:</Text>
            <Text style={[
              styles.detailValue, 
              { color: item.remainingAmount > 0 ? theme.colors.status.error : theme.colors.status.success }
            ]}>
              ৳{item.remainingAmount.toLocaleString()}
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
        </View>
      </View>
    );
  };

  type CustomerItem = Customer | PurchaseHistory;

  const getCurrentData = (): CustomerItem[] => {
    switch (activeTab) {
      case 'customers':
        return filteredCustomers;
      case 'purchase-history':
        return purchaseHistory;
      case 'red-list':
        return customers.filter(c => c.isRedListed);
      case 'top-customers':
        return analytics.topCustomersByRevenue;
      default:
        return [];
    }
  };

  const renderCustomersItem = ({ item }: { item: CustomerItem }) => {
    if ('saleNumber' in item) {
      return renderPurchaseHistoryItem({ item: item as PurchaseHistory });
    } else {
      return renderCustomerItem({ item: item as Customer });
    }
  };

  return (
    <SharedLayout title="Customers">
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.colors.backgroundSecondary }]}
        >
          <Download size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        {hasPermission('customers', 'add') && (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleAddCustomer}
          >
            <Plus size={20} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>

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
              placeholder="Search customers..."
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

        {/* Red List Warning */}
        {activeTab === 'red-list' && (
          <View style={[styles.warningContainer, { 
            backgroundColor: theme.colors.status.error + '10',
            borderColor: theme.colors.status.error + '30'
          }]}>
            <View style={styles.warningHeader}>
              <AlertTriangle size={20} color={theme.colors.status.error} />
              <Text style={[styles.warningTitle, { color: theme.colors.status.error }]}>
                Red Listed Customers ({customers.filter(c => c.isRedListed).length})
              </Text>
            </View>
            <Text style={[styles.warningText, { color: theme.colors.text.secondary }]}>
              Customers with payments overdue for more than 60 days require immediate attention.
            </Text>
          </View>
        )}

        {/* Data List */}
        <FlatList<CustomerItem>
          data={getCurrentData()}
          renderItem={renderCustomersItem}
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
              <Users size={48} color={theme.colors.text.muted} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No {activeTab.replace('-', ' ')} found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text.muted }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </ScrollView>

      {/* Customer Add Form */}
      <CustomerAddForm
        visible={showCustomerForm}
        onClose={() => setShowCustomerForm(false)}
        onSubmit={handleCustomerSubmit}
      />
    </SharedLayout>
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
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
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
  warningContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  customerAvatar: {
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
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  redListBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  customerTypeContainer: {
    flexDirection: 'row',
  },
  customerType: {
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
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  overdueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  discountValue: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 14,
    marginBottom: 6,
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