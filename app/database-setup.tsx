import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Clipboard,
  Modal,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setupWizard, SetupStep } from '../lib/database/setup-wizard';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle, AlertCircle, Clock, Copy, ExternalLink } from 'lucide-react-native';

export default function DatabaseSetupScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [progress, setProgress] = useState(0);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<SetupStep | null>(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    setIsLoading(true);
    try {
      const status = await setupWizard.checkAllSteps();
      setSteps(setupWizard.getSteps());
      setProgress(setupWizard.getProgress());
    } catch (error) {
      console.error('Error loading setup steps:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testStep = async (stepId: string) => {
    setIsLoading(true);
    try {
      const result = await setupWizard.testStep(stepId);
      setSteps(setupWizard.getSteps());
      setProgress(setupWizard.getProgress());
      
      if (result) {
        Alert.alert('Success', 'Step completed successfully!');
      } else {
        Alert.alert('Not Ready', 'This step is not completed yet. Please follow the manual instructions.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test step');
      console.error('Test step error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'SQL copied to clipboard');
  };

  const openSupabaseDashboard = () => {
    Alert.alert(
      'Open Supabase Dashboard',
      'Please open your Supabase dashboard in a web browser:\n\nhttps://supabase.com/dashboard/project/wfecqahlnfnczhkxvcjv',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} color={theme.colors.status.success} />;
      case 'failed':
        return <AlertCircle size={24} color={theme.colors.status.error} />;
      case 'in_progress':
        return <Clock size={24} color={theme.colors.status.warning} />;
      default:
        return <Clock size={24} color={theme.colors.text.muted} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.status.success;
      case 'failed':
        return theme.colors.status.error;
      case 'in_progress':
        return theme.colors.status.warning;
      default:
        return theme.colors.text.muted;
    }
  };

  const renderStep = (step: SetupStep, index: number) => (
    <View key={step.id} style={[styles.stepCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.stepHeader}>
        <View style={styles.stepInfo}>
          <View style={styles.stepNumber}>
            <Text style={[styles.stepNumberText, { color: theme.colors.text.inverse }]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
              {step.title}
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
              {step.description}
            </Text>
          </View>
        </View>
        {getStatusIcon(step.status)}
      </View>

      <View style={styles.stepActions}>
        {step.action && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => testStep(step.id)}
            disabled={isLoading}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text.inverse }]}>
              Test Step
            </Text>
          </TouchableOpacity>
        )}

        {step.sql && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => {
              setSelectedStep(step);
              setShowSqlModal(true);
            }}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text.inverse }]}>
              View SQL
            </Text>
          </TouchableOpacity>
        )}

        {step.manualInstructions && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.status.info }]}
            onPress={openSupabaseDashboard}
          >
            <ExternalLink size={16} color={theme.colors.text.inverse} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text.inverse, marginLeft: 8 }]}>
              Dashboard
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.statusBar, { backgroundColor: getStatusColor(step.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(step.status) }]}>
          Status: {step.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Database Setup Wizard
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Follow these steps to set up your Supabase database
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: theme.colors.text.primary }]}>
              Setup Progress
            </Text>
            <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${progress}%`
                }
              ]} 
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.refreshButton, { 
            backgroundColor: theme.colors.primary,
            opacity: isLoading ? 0.6 : 1 
          }]}
          onPress={loadSteps}
          disabled={isLoading}
        >
          <Text style={[styles.refreshButtonText, { color: theme.colors.text.inverse }]}>
            {isLoading ? 'Checking Status...' : 'Refresh Status'}
          </Text>
        </TouchableOpacity>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => renderStep(step, index))}
        </View>
      </ScrollView>

      {/* SQL Modal */}
      <Modal
        visible={showSqlModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              {selectedStep?.title} - SQL
            </Text>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.colors.border }]}
              onPress={() => setShowSqlModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: theme.colors.text.primary }]}>
                Close
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.sqlContainer}>
            <View style={[styles.sqlBox, { backgroundColor: theme.colors.backgroundSecondary }]}>
              <Text style={[styles.sqlText, { color: theme.colors.text.primary }]}>
                {selectedStep?.sql}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => selectedStep?.sql && copyToClipboard(selectedStep.sql)}
            >
              <Copy size={16} color={theme.colors.text.inverse} />
              <Text style={[styles.copyButtonText, { color: theme.colors.text.inverse }]}>
                Copy SQL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dashboardButton, { backgroundColor: theme.colors.primary }]}
              onPress={openSupabaseDashboard}
            >
              <ExternalLink size={16} color={theme.colors.text.inverse} />
              <Text style={[styles.dashboardButtonText, { color: theme.colors.text.inverse }]}>
                Open Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  refreshButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBar: {
    padding: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sqlContainer: {
    flex: 1,
    padding: 20,
  },
  sqlBox: {
    padding: 16,
    borderRadius: 8,
    minHeight: 200,
  },
  sqlText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dashboardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  dashboardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});