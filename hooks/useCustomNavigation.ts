import { useEffect, useCallback } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export const useCustomNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const showExitConfirmation = useCallback(() => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit the application?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: true }
    );
  }, []);

  const handleBackPress = useCallback(() => {
    // If we're on dashboard, show exit confirmation
    if (pathname === '/dashboard') {
      showExitConfirmation();
      return true; // Prevent default back behavior
    }
    
    // For any other page, go to dashboard
    // Use replace to prevent building up navigation stack
    router.replace('/dashboard');
    return true; // Prevent default back behavior
  }, [pathname, router, showExitConfirmation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => backHandler.remove();
  }, [handleBackPress]);

  return {
    handleBackPress,
    showExitConfirmation,
  };
};