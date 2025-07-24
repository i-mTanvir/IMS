import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Switch,
  StatusBar,
} from 'react-native';
import {
  X,
  UserPlus,
  Shield,
  ChevronRight,
  ChevronDown,
  Settings,
  Users,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RoleFormData {
  roleName: string;
  description: string;
  isActive: boolean;
  permissions: {
    dashboard: boolean;
    products: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    inventory: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      transfer: boolean;
    };
    sales: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
      invoice: boolean;
    };
    customers: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    suppliers: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    samples: {
      view: boolean;
      add: boolean;
      edit: boolean;
      delete: boolean;
    };
    reports: {
      view: boolean;
      export: boolean;
    };
    settings: {
      view: boolean;
      userManagement: boolean;
      systemSettings: boolean;
    };
  };
}

interface RoleAddFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
  existingRole?: any;
}

export default function RoleAddForm({ visible, onClose, onSubmit, existingRole }: RoleAddFormProps) {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    products: false,
    inventory: false,
    sales: false,
    customers: false,
    suppliers: false,
    samples: false,
    reports: false,
    settings: false,
  });

  const [formData, setFormData] = useState<RoleFormData>({
    roleName: '',
    description: '',
    isActive: true,
    permissions: {
      dashboard: false,
      products: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      inventory: {
        view: false,
        add: false,
        edit: false,
        delete: false,
        transfer: false,
      },
      sales: {
        view: false,
        add: false,
        edit: false,
        delete: false,
        invoice: false,
      },
      customers: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      suppliers: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      samples: {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
      reports: {
        view: false,
        export: false,
      },
      settings: {
        view: false,
        userManagement: false,
        systemSettings: false,
      },
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const canManageRoles = hasPermission('settings', 'userManagement');

  // Form steps for better UX
  const steps = [
    { title: 'Basic Info', icon: UserPlus },
    { title: 'Dashboard', icon: Settings },
    { title: 'Permissions', icon: Shield },
  ];

  // Enhanced animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, overlayOpacity, slideAnim, scaleAnim]);

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      if (!existingRole) {
        setFormData({
          roleName: '',
          description: '',
          isActive: true,
          permissions: {
            dashboard: false,
            products: {
              view: false,
              add: false,
              edit: false,
              delete: false,
            },
            inventory: {
              view: false,
              add: false,
              edit: false,
              delete: false,
              transfer: false,
            },
            sales: {
              view: false,
              add: false,
              edit: false,
              delete: false,
              invoice: false,
            },
            customers: {
              view: false,
              add: false,
              edit: false,
              delete: false,
            },
            suppliers: {
              view: false,
              add: false,
              edit: false,
              delete: false,
            },
            samples: {
              view: false,
              add: false,
              edit: false,
              delete: false,
            },
            reports: {
              view: false,
              export: false,
            },
            settings: {
              view: false,
              userManagement: false,
              systemSettings: false,
            },
          },
        });
      }
      setErrors({});
      setCurrentStep(0);
    }
  }, [visible, existingRole]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roleName.trim()) {
      newErrors.roleName = 'Role name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!canManageRoles) {
      Alert.alert('Permission Denied', 'You do not have permission to manage roles.');
      return;
    }

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      roleName: '',
      description: '',
      isActive: true,
      permissions: {
        dashboard: false,
        products: {
          view: false,
          add: false,
          edit: false,
          delete: false,
        },
        inventory: {
          view: false,
          add: false,
          edit: false,
          delete: false,
          transfer: false,
        },
        sales: {
          view: false,
          add: false,
          edit: false,
          delete: false,
          invoice: false,
        },
        customers: {
          view: false,
          add: false,
          edit: false,
          delete: false,
        },
        suppliers: {
          view: false,
          add: false,
          edit: false,
          delete: false,
        },
        samples: {
          view: false,
          add: false,
          edit: false,
          delete: false,
        },
        reports: {
          view: false,
          export: false,
        },
        settings: {
          view: false,
          userManagement: false,
          systemSettings: false,
        },
      },
    });
    setErrors({});
    onClose();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updatePermission = (module: string, action: string, value: boolean) => {
    setFormData(prev => {
      const newPermissions = { ...prev.permissions };
      
      if (action === 'all') {
        // Set all permissions for this module
        const modulePermissions = newPermissions[module as keyof typeof newPermissions] as Record<string, boolean>;
        Object.keys(modulePermissions).forEach(key => {
          (modulePermissions)[key] = value;
        });
      } else {
        // Set specific permission
        const modulePermissions = newPermissions[module as keyof typeof newPermissions] as Record<string, boolean>;
        modulePermissions[action] = value;
      }
      
      return {
        ...prev,
        permissions: newPermissions,
      };
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep && styles.stepCircleActive
          ]}>
            <step.icon 
              size={16} 
              color={index <= currentStep ? '#FFFFFF' : theme.colors.text.muted} 
            />
          </View>
          <Text style={[
            styles.stepText,
            index <= currentStep && styles.stepTextActive
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              index < currentStep && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderDashboardStep();
      case 2:
        return renderPermissionsStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Sparkles size={18} color={theme.colors.primary} /> Basic Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Role Name *</Text>
          <TextInput
            style={[styles.input, errors.roleName && styles.inputError]}
            value={formData.roleName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, roleName: text }))}
            placeholder="Enter role name"
            placeholderTextColor={theme.colors.text.muted}
          />
          {errors.roleName && <Text style={styles.errorText}>{errors.roleName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter role description"
            placeholderTextColor={theme.colors.text.muted}
            multiline
          />
        </View>

        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Active Role</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={formData.isActive ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderDashboardStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Settings size={18} color={theme.colors.primary} /> Dashboard Access
        </Text>
        
        <View style={styles.permissionCard}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionLabel}>Access Dashboard</Text>
            <Switch
              value={formData.permissions.dashboard}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                permissions: { ...prev.permissions, dashboard: value }
              }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
              thumbColor={formData.permissions.dashboard ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPermissionsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Shield size={18} color={theme.colors.primary} /> Module Permissions
        </Text>
        
        {renderPermissionSection('products', 'Products', [
          { key: 'view', label: 'View Products' },
          { key: 'add', label: 'Add Products' },
          { key: 'edit', label: 'Edit Products' },
          { key: 'delete', label: 'Delete Products' },
        ])}
        
        {renderPermissionSection('inventory', 'Inventory', [
          { key: 'view', label: 'View Inventory' },
          { key: 'add', label: 'Add Inventory' },
          { key: 'edit', label: 'Edit Inventory' },
          { key: 'delete', label: 'Delete Inventory' },
          { key: 'transfer', label: 'Transfer Inventory' },
        ])}
        
        {renderPermissionSection('sales', 'Sales', [
          { key: 'view', label: 'View Sales' },
          { key: 'add', label: 'Add Sales' },
          { key: 'edit', label: 'Edit Sales' },
          { key: 'delete', label: 'Delete Sales' },
          { key: 'invoice', label: 'Manage Invoices' },
        ])}
        
        {renderPermissionSection('customers', 'Customers', [
          { key: 'view', label: 'View Customers' },
          { key: 'add', label: 'Add Customers' },
          { key: 'edit', label: 'Edit Customers' },
          { key: 'delete', label: 'Delete Customers' },
        ])}
        
        {renderPermissionSection('suppliers', 'Suppliers', [
          { key: 'view', label: 'View Suppliers' },
          { key: 'add', label: 'Add Suppliers' },
          { key: 'edit', label: 'Edit Suppliers' },
          { key: 'delete', label: 'Delete Suppliers' },
        ])}
        
        {renderPermissionSection('samples', 'Samples', [
          { key: 'view', label: 'View Samples' },
          { key: 'add', label: 'Add Samples' },
          { key: 'edit', label: 'Edit Samples' },
          { key: 'delete', label: 'Delete Samples' },
        ])}
        
        {renderPermissionSection('reports', 'Reports', [
          { key: 'view', label: 'View Reports' },
          { key: 'export', label: 'Export Reports' },
        ])}
        
        {renderPermissionSection('settings', 'Settings', [
          { key: 'view', label: 'View Settings' },
          { key: 'userManagement', label: 'User Management' },
          { key: 'systemSettings', label: 'System Settings' },
        ])}
      </View>
    </View>
  );

  const renderPermissionSection = (module: string, title: string, actions: { key: string, label: string }[]) => {
    const isExpanded = expandedSections[module];
    
    return (
      <View style={styles.permissionSection}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(module)}
        >
          <Text style={styles.sectionHeaderTitle}>{title}</Text>
          {isExpanded ? (
            <ChevronDown size={20} color={theme.colors.text.secondary} />
          ) : (
            <ChevronRight size={20} color={theme.colors.text.secondary} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.permissionsList}>
            {/* All permissions toggle */}
            <View style={[styles.permissionItem, styles.allPermissionsItem]}>
              <Text style={styles.allPermissionsLabel}>All Permissions</Text>
              <Switch
                value={Object.values(formData.permissions[module as keyof typeof formData.permissions]).every(val => val === true)}
                onValueChange={(value) => updatePermission(module, 'all', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={Object.values(formData.permissions[module as keyof typeof formData.permissions]).every(val => val === true) ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
            
            {/* Individual permissions */}
            {actions.map(action => (
              <View key={`${module}-${action.key}`} style={styles.permissionIndent}>
                <View style={styles.permissionItem}>
                  <Text style={styles.permissionLabel}>{action.label}</Text>
                  <Switch
                    value={(formData.permissions[module as keyof typeof formData.permissions] as Record<string, boolean>)[action.key]}
                    onValueChange={(value) => updatePermission(module, action.key, value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                    thumbColor={(formData.permissions[module as keyof typeof formData.permissions] as Record<string, boolean>)[action.key] ? theme.colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      paddingTop: 50,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginHorizontal: 8,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.primary,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    stepItem: {
      flex: 1,
      alignItems: 'center',
      position: 'relative',
    },
    stepCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepCircleActive: {
      backgroundColor: theme.colors.primary,
    },
    stepText: {
      fontSize: 12,
      color: theme.colors.text.muted,
      textAlign: 'center',
      fontWeight: '500',
    },
    stepTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    stepLine: {
      position: 'absolute',
      top: 20,
      right: -50,
      width: 100,
      height: 2,
      backgroundColor: theme.colors.border,
      zIndex: -1,
    },
    stepLineActive: {
      backgroundColor: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
    stepContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      letterSpacing: 0.3,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    requiredLabel: {
      color: theme.colors.status.error,
    },
    input: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.backgroundTertiary,
      fontWeight: '500',
    },
    inputError: {
      borderColor: theme.colors.status.error,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.status.error,
      marginTop: 6,
      fontWeight: '500',
    },
    toggleContainer: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    permissionCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    permissionSection: {
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundTertiary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    sectionHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    permissionsList: {
      padding: 16,
    },
    permissionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    allPermissionsItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 16,
      marginBottom: 12,
    },
    allPermissionsLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    permissionIndent: {
      marginLeft: 16,
    },
    permissionLabel: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    footer: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      borderTopWidth: 2,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    backButton: {
      backgroundColor: theme.colors.backgroundTertiary,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    submitButton: {
      backgroundColor: '#10B981',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
  });

  if (!canManageRoles) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.container,
                { 
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ] 
                }
              ]}
            >
              <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>✨ Add New Role</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Content */}
                <ScrollView 
                  style={styles.content} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {renderCurrentStep()}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  {currentStep > 0 ? (
                    <TouchableOpacity 
                      style={[styles.button, styles.backButton]} 
                      onPress={() => setCurrentStep(prev => prev - 1)}
                    >
                      <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.button, styles.backButton]} 
                      onPress={handleClose}
                    >
                      <Text style={styles.backButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <TouchableOpacity 
                      style={[styles.button, styles.nextButton]} 
                      onPress={() => setCurrentStep(prev => prev + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.button, styles.submitButton]} 
                      onPress={handleSubmit}
                      disabled={isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? '⏳ Adding...' : '🚀 Add Role'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}