import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import BottomNavBar from '@/components/BottomNavBar';
import TopNavBar from '@/components/TopNavBar';

export default function ProfileScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },

    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <TopNavBar
        title="Profile"
        showBackButton={true}
      />
      <View style={styles.content}>
        <Text style={styles.subtitle}>Manage your account and settings</Text>
      </View>
      <BottomNavBar activeTab="profile" />
    </SafeAreaView>
  );
} 