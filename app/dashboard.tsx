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
import { TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import SharedLayout from '@/components/SharedLayout';

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

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, router]);

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
        <View style={styles.kpiGrid}>
          <KPICard
            title="TOTAL SALES"
            value={kpiData.totalSales.value}
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
            title="TOTAL STOCK"
            value={kpiData.totalStock.value}
            change={kpiData.totalStock.change}
            icon={Package}
            color={theme.colors.status.info}
          />
          <KPICard
            title="LOW STOCK"
            value={kpiData.lowStock.value}
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