import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { shouldShowVisualMonitor } from '@/utils/performanceConfig';
import '@/utils/performanceSummary'; // Initialize performance optimizations

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
        <PerformanceProvider>
          <ThemeProvider>
            <AuthProvider>
              <Stack screenOptions={{
                headerShown: false,
                animation: 'none',
                animationDuration: 0,
                gestureEnabled: false,
                animationTypeForReplace: 'push',
              }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen name="dashboard" options={{ animation: 'none' }} />
                <Stack.Screen name="search" options={{ animation: 'none' }} />
                <Stack.Screen name="products" options={{ animation: 'none' }} />
                <Stack.Screen name="history" options={{ animation: 'none' }} />
                <Stack.Screen name="inventory" options={{ animation: 'none' }} />
                <Stack.Screen name="sales" options={{ animation: 'none' }} />
                <Stack.Screen name="customers" options={{ animation: 'none' }} />
                <Stack.Screen name="suppliers" options={{ animation: 'none' }} />
                <Stack.Screen name="notification" options={{ animation: 'none' }} />
                <Stack.Screen name="settings" options={{ animation: 'none' }} />
                <Stack.Screen name="reports" options={{ animation: 'none' }} />
                <Stack.Screen name="samples" options={{ animation: 'none' }} />
                <Stack.Screen name="logs" options={{ animation: 'none' }} />
                <Stack.Screen name="support" options={{ animation: 'none' }} />
                <Stack.Screen name="transfer" options={{ animation: 'none' }} />
                <Stack.Screen name="categories" options={{ animation: 'none' }} />

                <Stack.Screen name="+not-found" options={{ animation: 'none' }} />
              </Stack>

              {/* Performance Monitor - Temporarily disabled to avoid theme errors */}
              {/* {shouldShowVisualMonitor() && <PerformanceMonitor />} */}
            </AuthProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </>
  );
}
