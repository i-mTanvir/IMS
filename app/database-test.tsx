import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectionTester, ConnectionTestResult } from '../lib/database/connection-test';
import { useTheme } from '../contexts/ThemeContext';

interface TestResults {
  connection: ConnectionTestResult;
  auth: ConnectionTestResult;
  permissions: ConnectionTestResult;
}

export default function DatabaseTestScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [overallStatus, setOverallStatus] = useState<boolean | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults(null);
    setOverallStatus(null);

    try {
      const results = await ConnectionTester.runAllTests();
      setTestResults(results.results);
      setOverallStatus(results.overall);
    } catch (error) {
      Alert.alert('Test Error', 'Failed to run connection tests');
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTestResult = (title: string, result: ConnectionTestResult) => (
    <View style={[styles.testResult, { backgroundColor: theme.colors.card }]}>
      <View style={styles.testHeader}>
        <Text style={[styles.testTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.testStatus, { 
          color: result.success ? theme.colors.status.success : theme.colors.status.error 
        }]}>
          {result.success ? '✅ PASS' : '❌ FAIL'}
        </Text>
      </View>
      
      <Text style={[styles.testMessage, { color: theme.colors.text.secondary }]}>
        {result.message}
      </Text>
      
      <Text style={[styles.testTimestamp, { color: theme.colors.text.muted }]}>
        {new Date(result.timestamp).toLocaleTimeString()}
      </Text>
      
      {result.details && (
        <View style={styles.testDetails}>
          <Text style={[styles.detailsTitle, { color: theme.colors.text.secondary }]}>
            Details:
          </Text>
          <Text style={[styles.detailsText, { color: theme.colors.text.muted }]}>
            {JSON.stringify(result.details, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Supabase Connection Test
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Test database connectivity and permissions
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, { 
            backgroundColor: theme.colors.primary,
            opacity: isLoading ? 0.6 : 1 
          }]}
          onPress={runTests}
          disabled={isLoading}
        >
          <Text style={[styles.testButtonText, { color: theme.colors.text.inverse }]}>
            {isLoading ? 'Running Tests...' : 'Run Connection Tests'}
          </Text>
        </TouchableOpacity>

        {overallStatus !== null && (
          <View style={[styles.overallStatus, { 
            backgroundColor: overallStatus ? 
              theme.colors.status.success + '20' : 
              theme.colors.status.error + '20',
            borderColor: overallStatus ? 
              theme.colors.status.success : 
              theme.colors.status.error
          }]}>
            <Text style={[styles.overallStatusText, { 
              color: overallStatus ? 
                theme.colors.status.success : 
                theme.colors.status.error 
            }]}>
              {overallStatus ? 
                '🎉 All tests passed! Database is ready.' : 
                '⚠️ Some tests failed. Check details below.'}
            </Text>
          </View>
        )}

        {testResults && (
          <View style={styles.results}>
            {renderTestResult('Database Connection', testResults.connection)}
            {renderTestResult('Authentication', testResults.auth)}
            {renderTestResult('Permissions', testResults.permissions)}
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
            Connection Information
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            URL: https://wfecqahlnfnczhkxvcjv.supabase.co
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            Project: Serrano Tex IMS
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            Environment: Development
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  testButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  overallStatus: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  overallStatusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  results: {
    marginBottom: 30,
  },
  testResult: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  testStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  testMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  testTimestamp: {
    fontSize: 12,
    marginBottom: 8,
  },
  testDetails: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  info: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});