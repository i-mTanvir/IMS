import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, Users, Truck, FileText, Bell, Activity, Settings, Circle as HelpCircle, LogOut, Search, Calendar, Moon, Sun, TrendingUp, DollarSign, TriangleAlert as AlertTriangle, ChevronRight, ChartBar as BarChart3, ChartPie as PieChartIcon, Menu, X } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import SharedLayout from '@/components/SharedLayout';
import PieChart from 'react-native-pie-chart';
import MiniCalendarModal from '@/components/calendar/MiniCalendarModal';
import { CalendarEventData } from '@/utils/calendarUtils';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

// Add interfaces for KPI data
interface KPIValueChange {
  value: number;
  change: number;
}

interface KPIDataPeriod {
  '1D': KPIValueChange;
  '1W': KPIValueChange;
  '1M': KPIValueChange;
  '1Y': KPIValueChange;
}

interface KPIStockData {
  value: number;
  change: number;
  period: string;
  trend: 'up' | 'down';
}

interface KPIData {
  totalSales: KPIDataPeriod;
  profitMargin: KPIDataPeriod;
  totalStock: KPIStockData;
  lowStock: KPIStockData;
}

// Mock data with period-specific values
const kpiData: KPIData = {
  totalSales: { 
    '1D': { value: 12500, change: 250 },
    '1W': { value: 48988, change: 975 },
    '1M': { value: 185000, change: 12500 },
    '1Y': { value: 2200000, change: 180000 }
  },
  profitMargin: { 
    '1D': { value: 2100, change: 150 },
    '1W': { value: 8988, change: 533 },
    '1M': { value: 35000, change: 2800 },
    '1Y': { value: 420000, change: 35000 }
  },
  totalStock: { value: 4826, change: 153, period: '', trend: 'up' },
  lowStock: { value: 12, change: -2, period: '', trend: 'down' },
};

const topCustomers = [
  { name: 'Ahmed Textiles', amount: 45000, avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
  { name: 'Dhaka Fabrics Ltd', amount: 38500, avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
  { name: 'Bengal Cotton Co', amount: 32000, avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
  { name: 'Chittagong Mills', amount: 28500, avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
  { name: 'Sylhet Textiles', amount: 25000, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
];

const salesDataByPeriod = {
  '1D': [
    { period: '6AM', sales: 2500, purchases: 1800 },
    { period: '9AM', sales: 3200, purchases: 2100 },
    { period: '12PM', sales: 4100, purchases: 2800 },
    { period: '3PM', sales: 3800, purchases: 2500 },
    { period: '6PM', sales: 2900, purchases: 2200 },
    { period: '9PM', sales: 1500, purchases: 1100 },
  ],
  '1W': [
    { period: 'Mon', sales: 12000, purchases: 8500 },
    { period: 'Tue', sales: 15000, purchases: 10200 },
    { period: 'Wed', sales: 18000, purchases: 12800 },
    { period: 'Thu', sales: 16500, purchases: 11500 },
    { period: 'Fri', sales: 14000, purchases: 9800 },
    { period: 'Sat', sales: 11000, purchases: 7500 },
    { period: 'Sun', sales: 8500, purchases: 6200 },
  ],
  '1M': [
    { period: 'W1', sales: 85000, purchases: 62000 },
    { period: 'W2', sales: 72000, purchases: 58000 },
    { period: 'W3', sales: 95000, purchases: 68000 },
    { period: 'W4', sales: 88000, purchases: 65000 },
  ],
  '1Y': [
    { period: 'Jan', sales: 185000, purchases: 142000 },
    { period: 'Feb', sales: 172000, purchases: 138000 },
    { period: 'Mar', sales: 195000, purchases: 148000 },
    { period: 'Apr', sales: 188000, purchases: 145000 },
    { period: 'May', sales: 178000, purchases: 140000 },
    { period: 'Jun', sales: 192000, purchases: 150000 },
    { period: 'Jul', sales: 185000, purchases: 143000 },
    { period: 'Aug', sales: 198000, purchases: 152000 },
    { period: 'Sep', sales: 205000, purchases: 158000 },
    { period: 'Oct', sales: 195000, purchases: 150000 },
    { period: 'Nov', sales: 188000, purchases: 145000 },
    { period: 'Dec', sales: 210000, purchases: 162000 },
  ],
};

const categoryData = [
  { category: 'Sofa Fabrics', profit: 50, color: '#8B5CF6' },      // Purple
  { category: 'Curtain Fabrics', profit: 20, color: '#60A5FA' },   // Blue  
  { category: 'Artificial Leather', profit: 20, color: '#F59E0B' }, // Orange
  { category: 'Garments', profit: 5, color: '#EF4444' },           // Red
  { category: 'Others', profit: 5, color: '#10B981' },             // Green
];

// Prepare data for react-native-pie-chart
const pieChartSeries = categoryData.map(item => ({
  value: item.profit,
  color: item.color,
}));

const summaryTabs = [
  { label: 'Suppliers', count: 45, growth: '+5' },
  { label: 'Customers', count: 234, growth: '+12' },
  { label: 'Orders', count: 89, growth: '+8' },
];

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [chartPeriod, setChartPeriod] = useState('1W');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState({
    sales: true,
    kpi: true,
    customers: true
  });
  
  // Remove artificial loading delays - data loads instantly
  useEffect(() => {
    // Data is already available, no need for loading simulation
    setIsLoading(false);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
    { icon: Package, label: 'Products', route: '/products' },
    { icon: Warehouse, label: 'Inventory', route: '/inventory' },
    { icon: ShoppingCart, label: 'Sales & Invoicing', route: '/sales' },
    { icon: Users, label: 'Customers', route: '/customers' },
    { icon: Truck, label: 'Suppliers', route: '/suppliers' },
    { icon: Package, label: 'Sample Tracking', route: '/samples' },
    { icon: FileText, label: 'Reports', route: '/reports' },
    { icon: Bell, label: 'Notifications', route: '/notification' },
    { icon: Activity, label: 'Activity Logs', route: '/logs' },
    { icon: Settings, label: 'Settings', route: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', route: '/help' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      setShowLogoutModal(false);
    }
  };

  // Calendar handlers
  const handleCalendarPress = () => {
    setShowCalendar(true);
  };

  const handleCalendarClose = () => {
    setShowCalendar(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Update dashboard data based on selected date
    console.log('Selected date:', date);
  };

  // Mock calendar event data
  const mockCalendarEvents: CalendarEventData[] = [
    {
      date: new Date(2025, 0, 15), // January 15, 2025
      type: 'sales',
      title: 'High Sales Day',
      count: 5,
    },
    {
      date: new Date(2025, 0, 18), // January 18, 2025
      type: 'inventory',
      title: 'Stock Delivery',
      count: 2,
    },
    {
      date: new Date(2025, 0, 20), // January 20, 2025
      type: 'meeting',
      title: 'Team Meeting',
      count: 1,
    },
    {
      date: new Date(2025, 0, 25), // January 25, 2025
      type: 'deadline',
      title: 'Report Due',
      count: 3,
    },
  ];

  const handleMenuItemPress = useCallback((item: typeof menuItems[0]) => {
    if (item.route) {
      router.push(item.route as any);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [router, isMobile]);

  const isMenuItemActive = (route: string) => {
    return pathname === route;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    layout: {
      flex: 1,
      flexDirection: 'row',
      marginLeft: !isMobile ? 260 : 0,
    },

    mainContent: {
      flex: 1,
    },

    content: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: isDark ? theme.colors.background : '#f8fafc',
      paddingTop: theme.spacing.md + 20, // Safe area padding
    },
    chartSection: {
      marginBottom: theme.spacing.lg,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    kpiCard: {
      width: isMobile ? '48%' : '23%',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      backgroundColor: theme.colors.card,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    kpiHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    kpiTitle: {
      fontSize: 9,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.colors.text.secondary,
    },
    kpiValue: {
      fontSize: isMobile ? 16 : 20,
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    kpiFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    changeText: {
      fontSize: 9,
      fontWeight: '500',
      marginLeft: 2,
    },
    periodText: {
      fontSize: 9,
      color: theme.colors.text.muted,
    },
    chartContainer: {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      backgroundColor: theme.colors.card,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    periodButtons: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    periodButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    periodButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    periodButtonText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    periodButtonTextActive: {
      color: theme.colors.text.inverse,
    },
    chart: {
      flexDirection: 'row',
      height: 120,
    },
    yAxis: {
      justifyContent: 'space-between',
      paddingRight: theme.spacing.sm,
      width: 35,
    },
    yAxisLabel: {
      fontSize: 9,
      color: theme.colors.text.muted,
    },
    chartBars: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    barGroup: {
      alignItems: 'center',
      flex: 1,
    },
    barPair: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 1,
      marginBottom: theme.spacing.xs,
    },
    bar: {
      width: 6,
      borderRadius: 1,
    },
    xAxisLabel: {
      fontSize: 9,
      color: theme.colors.text.muted,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendColor: {
      width: 10,
      height: 10,
      borderRadius: 2,
      marginRight: theme.spacing.xs,
    },
    legendText: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    bottomRow: {
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    pieChartContainer: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginBottom: isMobile ? theme.spacing.md : 0,
      backgroundColor: theme.colors.card,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    pieChartContent: {
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    donutChart: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    pieLegend: {
      width: '100%',
    },
    pieLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      justifyContent: 'space-between',
    },
    pieLegendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendPercentage: {
      fontSize: 12,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    totalProfit: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      alignItems: 'center',
    },
    totalProfitLabel: {
      fontSize: 12,
      color: theme.colors.text.muted,
    },
    totalProfitValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    summarySection: {
      flex: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: theme.borderRadius.sm,
      padding: 2,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    activeTabText: {
      color: theme.colors.text.inverse,
      fontWeight: '500',
    },
    tabContent: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    tabCount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    tabGrowth: {
      fontSize: 11,
      color: theme.colors.status.success,
      marginTop: theme.spacing.xs,
    },
    customersSection: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    viewAllLink: {
      fontSize: 12,
      color: theme.colors.primary,
    },
    customerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    customerAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: theme.spacing.md,
    },
    customerAvatarFallback: {
      width: 32,
      height: 32,
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    customerAvatarText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    customerInfo: {
      flex: 1,
    },
    customerName: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    customerAmount: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    investorSection: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? 'transparent' : '#e2e8f0',
    },
    commentInput: {
      marginTop: theme.spacing.md,
    },
    commentTextInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 14,
      color: theme.colors.text.primary,
      minHeight: 80,
      textAlignVertical: 'top',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.input,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignSelf: 'flex-start',
    },
    submitButtonText: {
      color: theme.colors.text.inverse,
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
      minWidth: 300,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    modalText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    modalButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      minWidth: 80,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundTertiary,
    },
    confirmButton: {
      backgroundColor: theme.colors.status.error,
    },
    modalButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    cancelButtonText: {
      color: theme.colors.text.secondary,
    },
    confirmButtonText: {
      color: theme.colors.text.inverse,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: '#64748b',
      fontSize: 14,
    },
    skeletonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    skeletonTitle: {
      width: 120,
      height: 20,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
    },
    skeletonPeriod: {
      width: 80,
      height: 20,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
    },
    skeletonChart: {
      height: 150,
      backgroundColor: '#e2e8f0',
      borderRadius: 8,
      marginBottom: 16,
    },
    skeletonLegend: {
      height: 20,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      width: '50%',
    },
    skeletonKpiCard: {
      backgroundColor: '#e2e8f0',
      height: 100,
    },
    skeletonAvatar: {
      width: 32,
      height: 32,
      backgroundColor: '#e2e8f0',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    skeletonName: {
      width: 100,
      height: 16,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      marginBottom: 4,
    },
    skeletonAmount: {
      width: 80,
      height: 16,
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
    },
  });

  // Loading indicator component
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Loading dashboard...</Text>
    </View>
  );
  
  // Skeleton loader for chart
  const ChartSkeleton = () => (
    <View style={[styles.chartContainer, { height: 240 }]}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonPeriod} />
      </View>
      <View style={styles.skeletonChart} />
      <View style={styles.skeletonLegend} />
    </View>
  );
  
  // Skeleton loader for KPI cards
  const KPISkeleton = () => (
    <View style={styles.kpiGrid}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={[styles.kpiCard, styles.skeletonKpiCard]} />
      ))}
    </View>
  );

  // Add this interface for KPICard props
  interface KPICardProps {
    title: string;
    value: number;
    change: number;
    icon: any; // Use any for the icon type to avoid TypeScript errors with Lucide icons
    trend: 'up' | 'down';
    color: string;
  }

  // Update the KPICard component with proper types
  const KPICard = React.memo(({ title, value, change, icon: Icon, trend, color }: KPICardProps) => (
    <View style={[styles.kpiCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.kpiValue}>
        {typeof value === 'number' && title.includes('SALES') ? `$${value.toLocaleString()}` : 
         typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <View style={styles.kpiFooter}>
        <View style={[styles.changeBadge, { backgroundColor: trend === 'up' ? '#dcfce7' : '#fef2f2' }]}>
          <TrendingUp 
            size={8} 
            color={trend === 'up' ? theme.colors.status.success : theme.colors.status.error}
            style={{ transform: [{ rotate: trend === 'up' ? '0deg' : '180deg' }] }}
          />
          <Text style={[styles.changeText, { 
            color: trend === 'up' ? theme.colors.status.success : theme.colors.status.error 
          }]}>
            {change > 0 ? '+' : ''}{change.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  ));

  // Add interfaces for chart data
  interface ChartDataItem {
    period: string;
    sales: number;
    purchases: number;
  }

  interface ChartDataPeriods {
    '1D': ChartDataItem[];
    '1W': ChartDataItem[];
    '1M': ChartDataItem[];
    '1Y': ChartDataItem[];
  }

  // Update the SimpleBarChart component with proper types
  const SimpleBarChart = React.memo(() => {
    const currentData: ChartDataItem[] = salesDataByPeriod[chartPeriod as keyof ChartDataPeriods] || salesDataByPeriod['1W'];
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Sales & Purchase</Text>
          <View style={styles.periodButtons}>
            {['1D', '1W', '1M', '1Y'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  chartPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => setChartPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  chartPeriod === period && styles.periodButtonTextActive
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            {['200K', '150K', '100K', '50K', '0'].map((label, index) => (
              <Text key={index} style={styles.yAxisLabel}>{label}</Text>
            ))}
          </View>
          <View style={styles.chartBars}>
            {currentData.map((data: ChartDataItem, index: number) => {
              const maxValue = Math.max(...currentData.map((d: ChartDataItem) => Math.max(d.sales, d.purchases)));
              const salesHeight = (data.sales / maxValue) * 100;
              const purchasesHeight = (data.purchases / maxValue) * 100;
              
              return (
                <View key={index} style={styles.barGroup}>
                  <View style={styles.barPair}>
                    <View style={[styles.bar, { height: salesHeight, backgroundColor: theme.colors.primary }]} />
                    <View style={[styles.bar, { height: purchasesHeight, backgroundColor: '#60a5fa' }]} />
                  </View>
                  <Text style={styles.xAxisLabel}>{data.period}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Sales</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#60a5fa' }]} />
            <Text style={styles.legendText}>Purchases</Text>
          </View>
        </View>
      </View>
    );
  });

  const DonutChart = React.memo(() => {
    const chartSize = 180;
    
    // Create series data with each slice having a value and color
    const seriesWithColors = categoryData.map(item => ({
      value: item.profit,
      color: item.color
    }));
    
    return (
      <View style={styles.pieChartContainer}>
        <Text style={styles.chartTitle}>Profit Distribution</Text>
        <View style={styles.pieChartContent}>
          <View style={styles.donutChart}>
            <PieChart 
              widthAndHeight={chartSize}
              series={seriesWithColors}
            />
          </View>
          
          <View style={styles.pieLegend}>
            {categoryData.map((item, index) => (
              <View key={index} style={styles.pieLegendItem}>
                <View style={styles.pieLegendLeft}>
                  <View style={[styles.legendColor, { backgroundColor: item.color, borderRadius: 4 }]} />
                  <Text style={styles.legendText}>{item.category}</Text>
                </View>
                <Text style={styles.legendPercentage}>{item.profit}%</Text>
              </View>
            ))}
            <View style={styles.totalProfit}>
              <Text style={styles.totalProfitLabel}>Total Profit</Text>
              <Text style={styles.totalProfitValue}>$24,567</Text>
            </View>
          </View>
        </View>
      </View>
    );
  });



  // Add interface for current KPI data
  interface CurrentKPIData {
    totalSales: KPIValueChange & { trend: 'up' | 'down' };
    profitMargin: KPIValueChange & { trend: 'up' | 'down' };
    totalStock: KPIStockData;
    lowStock: KPIStockData;
  }

  const currentKpiData: CurrentKPIData = {
    totalSales: { ...kpiData.totalSales[chartPeriod as keyof KPIDataPeriod], trend: 'up' },
    profitMargin: { ...kpiData.profitMargin[chartPeriod as keyof KPIDataPeriod], trend: 'up' },
    totalStock: kpiData.totalStock,
    lowStock: kpiData.lowStock,
  };

  return (
    <SharedLayout
      title="Dashboard"
      onLogout={() => {
        setShowLogoutModal(true);
      }}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <LoadingIndicator />
            ) : (
              <>
                <View style={styles.chartSection}>
                  {!dataLoaded.sales ? <ChartSkeleton /> : <SimpleBarChart />}
                </View>
                <View style={styles.kpiGrid}>
                  {!dataLoaded.kpi ? (
                    <KPISkeleton />
                  ) : (
                    <>
                      <KPICard
                        title="TOTAL SALES"
                        value={currentKpiData.totalSales.value}
                        change={currentKpiData.totalSales.change}
                        icon={TrendingUp}
                        trend={currentKpiData.totalSales.trend}
                        color={theme.colors.primary}
                      />
                      <KPICard
                        title="PROFIT MARGIN"
                        value={currentKpiData.profitMargin.value}
                        change={currentKpiData.profitMargin.change}
                        icon={DollarSign}
                        trend={currentKpiData.profitMargin.trend}
                        color={theme.colors.status.success}
                      />
                      <KPICard
                        title="TOTAL STOCK"
                        value={currentKpiData.totalStock.value}
                        change={currentKpiData.totalStock.change}
                        icon={Package}
                        trend={currentKpiData.totalStock.trend}
                        color={theme.colors.status.info}
                      />
                      <KPICard
                        title="LOW STOCK"
                        value={currentKpiData.lowStock.value}
                        change={currentKpiData.lowStock.change}
                        icon={AlertTriangle}
                        trend={currentKpiData.lowStock.trend}
                        color={theme.colors.status.warning}
                      />
                    </>
                  )}
                </View>
                <View style={styles.bottomRow}>
                  <DonutChart />
                  <View style={styles.summarySection}>
                    <View style={styles.tabContainer}>
                      {summaryTabs.map((tab, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[styles.tab, activeTab === index && styles.activeTab]}
                          onPress={() => setActiveTab(index)}
                        >
                          <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                            {tab.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.tabContent}>
                      <Text style={styles.tabCount}>{summaryTabs[activeTab].count}</Text>
                      <Text style={styles.tabGrowth}>{summaryTabs[activeTab].growth} this month</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.customersSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Customers</Text>
                    <TouchableOpacity>
                      <Text style={styles.viewAllLink}>View all customers</Text>
                    </TouchableOpacity>
                  </View>
                  {!dataLoaded.customers ? (
                    // Skeleton loader for customers
                    Array(5).fill(0).map((_, index) => (
                      <View key={index} style={styles.customerItem}>
                        <View style={[styles.customerAvatar, styles.skeletonAvatar]} />
                        <View style={styles.customerInfo}>
                          <View style={styles.skeletonName} />
                          <View style={styles.skeletonAmount} />
                        </View>
                      </View>
                    ))
                  ) : (
                    // Actual customer data
                    topCustomers.map((customer, index) => (
                      <View key={index} style={styles.customerItem}>
                        {customer.avatar ? (
                          <Image
                            source={{ uri: customer.avatar }}
                            style={styles.customerAvatar}
                            onError={(e) => {
                              console.log(`Failed to load image for ${customer.name}:`, e.nativeEvent.error);
                            }}
                          />
                        ) : (
                          // Text-based avatar fallback
                          <View style={[styles.customerAvatar, { backgroundColor: getRandomColor(customer.name) }]}>
                            <Text style={styles.avatarText}>
                              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.customerInfo}>
                          <Text style={styles.customerName}>{customer.name}</Text>
                          <Text style={styles.customerAmount}>${customer.amount.toLocaleString()}</Text>
                        </View>
                        <ChevronRight size={16} color={theme.colors.text.muted} />
                      </View>
                    ))
                  )}
                </View>
                {user?.role === 'Investor' && (
                  <View style={styles.investorSection}>
                    <Text style={styles.sectionTitle}>Investor Comments</Text>
                    <View style={styles.commentInput}>
                      <TextInput
                        style={styles.commentTextInput}
                        placeholder="Add your feedback..."
                        placeholderTextColor={theme.colors.text.muted}
                        multiline
                      />
                      <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
      </ScrollView>
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to logout from your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mini Calendar Modal */}
      <MiniCalendarModal
        visible={showCalendar}
        onClose={handleCalendarClose}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        eventData={mockCalendarEvents}
      />
    </SharedLayout>
  );
}

// Add this function to generate consistent colors based on customer name
const getRandomColor = (name: string): string => {
  // Generate a consistent hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB color
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];
  
  // Use the hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};