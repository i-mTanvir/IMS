import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { TrendingUp, DollarSign, Package, AlertTriangle, Database, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import SharedLayout from '@/components/SharedLayout';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

// Simplified KPI data
const kpiData = {
  totalSales: { value: 48988, change: 975 },
  profitMargin: { value: 8988, change: 533 },
  totalStock: { value: 4826, change: 153 },
  lowStock: { value: 12, change: -2 },
};

const Dashboard = React.memo(function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false); // Always false for instant loading
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, router]);

  // Check Supabase connection and fetch dashboard stats
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Test connection by fetching dashboard stats
        const { data, error } = await supabase.rpc('get_dashboard_stats');

        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus('disconnected');
        } else {
          setSupabaseStatus('connected');
          setDashboardStats(data);
        }
      } catch (error) {
        console.error('Failed to connect to Supabase:', error);
        setSupabaseStatus('disconnected');
      }
    };

    if (user) {
      checkSupabaseConnection();
    }
  }, [user]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    kpiTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    kpiValue: {
      fontSize: isMobile ? 18 : 22,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    kpiChange: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.status.success,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }), [theme, isMobile]);

  const KPICard = React.memo(({ title, value, change, icon: Icon, color }: any) => (
    <View style={[styles.kpiCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value.toLocaleString()}</Text>
      <Text style={[styles.kpiChange, { color: change > 0 ? theme.colors.status.success : theme.colors.status.error }]}>
        {change > 0 ? '+' : ''}{change.toLocaleString()}
      </Text>
    </View>
  ));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, color: theme.colors.text.secondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SharedLayout title="Dashboard" onLogout={handleLogout}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Supabase Connection Status */}
        <View style={[styles.kpiCard, {
          backgroundColor: supabaseStatus === 'connected' ? theme.colors.status.success + '20' : theme.colors.status.error + '20',
          borderLeftColor: supabaseStatus === 'connected' ? theme.colors.status.success : theme.colors.status.error,
          borderLeftWidth: 3,
          marginBottom: 16
        }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.kpiTitle}>Supabase Database</Text>
            {supabaseStatus === 'checking' ? (
              <ActivityIndicator size={16} color={theme.colors.primary} />
            ) : (
              <CheckCircle
                size={16}
                color={supabaseStatus === 'connected' ? theme.colors.status.success : theme.colors.status.error}
              />
            )}
          </View>
          <Text style={[styles.kpiValue, { fontSize: 16 }]}>
            {supabaseStatus === 'connected' ? 'Connected' :
             supabaseStatus === 'checking' ? 'Checking...' : 'Disconnected'}
          </Text>
          <Text style={[styles.kpiChange, {
            color: supabaseStatus === 'connected' ? theme.colors.status.success : theme.colors.status.error
          }]}>
            Project: dbwoaiihjffzfqsozgjn
          </Text>
        </View>

        {/* User Information */}
        {user && (
          <View style={[styles.kpiCard, {
            backgroundColor: theme.colors.primary + '10',
            borderLeftColor: theme.colors.primary,
            borderLeftWidth: 3,
            marginBottom: 16
          }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.kpiTitle}>Current User</Text>
              <Database size={16} color={theme.colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { fontSize: 16 }]}>{user.name}</Text>
            <Text style={[styles.kpiChange, { color: theme.colors.primary }]}>
              Role: {user.role.toUpperCase()} | ID: {user.id}
            </Text>
          </View>
        )}

        <View style={styles.kpiGrid}>
          <KPICard
            title="TOTAL SALES"
            value={dashboardStats?.total_sales_today || kpiData.totalSales.value}
            change={kpiData.totalSales.change}
            icon={DollarSign}
            color={theme.colors.primary}
          />
          <KPICard
            title="PROFIT MARGIN"
            value={kpiData.profitMargin.value}
            change={kpiData.profitMargin.change}
            icon={TrendingUp}
            color={theme.colors.status.success}
          />
          <KPICard
            title="TOTAL PRODUCTS"
            value={dashboardStats?.total_products || kpiData.totalStock.value}
            change={kpiData.totalStock.change}
            icon={Package}
            color={theme.colors.status.info}
          />
          <KPICard
            title="LOW STOCK"
            value={dashboardStats?.low_stock_products || kpiData.lowStock.value}
            change={kpiData.lowStock.change}
            icon={AlertTriangle}
            color={theme.colors.status.warning}
          />
        </View>
      </ScrollView>
    </SharedLayout>
  );
});

export default Dashboard;