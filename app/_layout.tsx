import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  // All hooks must be called at the top level, before any conditional logic
  const frameworkReady = useFrameworkReady();
  
  // This useEffect hook will always run, no conditional logic before it
  useEffect(() => {
    if (window.frameworkReady) {
      window.frameworkReady();
    }
  }, []);

  return (
    <>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="search" />
              <Stack.Screen name="products" />
              <Stack.Screen name="history" />
              <Stack.Screen name="inventory" />
              <Stack.Screen name="sales" />
              <Stack.Screen name="customers" />
              <Stack.Screen name="suppliers" />
              <Stack.Screen name="notification" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="reports" />
              <Stack.Screen name="samples" />
              <Stack.Screen name="logs" />
              <Stack.Screen name="support" />
              <Stack.Screen name="transfer" />
              <Stack.Screen name="categories" />
              <Stack.Screen name="database-setup" />
              <Stack.Screen name="database-test" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </>
  );
}
