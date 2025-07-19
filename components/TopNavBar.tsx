import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Menu,
  Calendar,
  Bell,
  Sun,
  Moon,
  Search,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface TopNavBarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showSearch?: boolean;
  showCalendar?: boolean;
  showNotifications?: boolean;
  showThemeToggle?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCalendarPress?: () => void;
  onNotificationPress?: () => void;
  rightContent?: React.ReactNode;
  backgroundColor?: string;
}

export default function TopNavBar({
  title = '',
  subtitle = '',
  showBackButton = false,
  showMenuButton = true,
  showSearch = false,
  showCalendar = true,
  showNotifications = true,
  showThemeToggle = true,
  onMenuPress,
  onSearchPress,
  onCalendarPress,
  onNotificationPress,
  rightContent,
  backgroundColor,
}: TopNavBarProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: backgroundColor || theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
      zIndex: 1000,
    },
    topNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      minHeight: 56,
    },
    topNavLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    topNavActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.xs,
    },
    iconButton: {
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchButton: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    notificationBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.status.error,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <View style={styles.topNavLeft}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ) : showMenuButton ? (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Menu size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.titleContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        <View style={styles.topNavActions}>
          {rightContent || (
            <>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
              
              {showSearch && (
                <TouchableOpacity
                  style={[styles.iconButton, styles.searchButton]}
                  onPress={onSearchPress}
                  activeOpacity={0.7}
                >
                  <Search size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}

              {showCalendar && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onCalendarPress}
                  activeOpacity={0.7}
                >
                  <Calendar size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              )}

              {showNotifications && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onNotificationPress || (() => router.push('/notification'))}
                  activeOpacity={0.7}
                >
                  <Bell size={20} color={theme.colors.text.secondary} />
                  {/* You can add notification badge here */}
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              )}

              {showThemeToggle && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                >
                  {isDark ? (
                    <Sun size={20} color={theme.colors.text.secondary} />
                  ) : (
                    <Moon size={20} color={theme.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
} 