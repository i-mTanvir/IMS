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
  StatusBar,
} from 'react-native';
import {
  X,
  ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { height: screenHeight } = Dimensions.get('window');

interface RoleFormData {
  userName: string;
  email: string;
  mobileNumber: string;
  role: 'Admin' | 'Sales Manager' | 'Investor' | '';
  locations: string[];
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

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    userName: '',
    email: '',
    mobileNumber: '',
    role: '',
    locations: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManageRoles = hasPermission('settings', 'userManagement');

  const roleOptions = ['Admin', 'Sales Manager', 'Investor'];
  const locationOptions = ['Warehouse 1', 'Warehouse 2', 'Showroom 1', 'Showroom 2'];

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
          userName: '',
          email: '',
          mobileNumber: '',
          role: '',
          locations: [],
        });
      }
      setErrors({});
      setShowRoleDropdown(false);
    }
  }, [visible, existingRole]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'User name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if ((formData.role === 'Admin' || formData.role === 'Sales Manager') && formData.locations.length === 0) {
      newErrors.locations = 'Please select at least one location';
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
      userName: '',
      email: '',
      mobileNumber: '',
      role: '',
      locations: [],
    });
    setErrors({});
    setShowRoleDropdown(false);
    onClose();
  };

  const handleRoleSelect = (role: 'Admin' | 'Sales Manager' | 'Investor') => {
    setFormData(prev => ({ ...prev, role, locations: [] }));
    setShowRoleDropdown(false);
  };

  const handleLocationToggle = (location: string) => {
    if (formData.role === 'Admin') {
      // Multiple selection for Admin
      setFormData(prev => ({
        ...prev,
        locations: prev.locations.includes(location)
          ? prev.locations.filter(l => l !== location)
          : [...prev.locations, location]
      }));
    } else if (formData.role === 'Sales Manager') {
      // Single selection for Sales Manager
      setFormData(prev => ({
        ...prev,
        locations: [location]
      }));
    }
  };

  const renderLocationOptions = () => {
    // Only show location options if a role is selected AND it's not Investor
    if (!formData.role || formData.role === 'Investor') return null;

    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, styles.requiredLabel]}>
          {formData.role === 'Admin' ? 'Select Locations (Multiple)' : 'Select Location (Single)'}
        </Text>
        <View style={styles.locationContainer}>
          {locationOptions.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.locationOption,
                {
                  backgroundColor: formData.locations.includes(location)
                    ? theme.colors.primary + '20'
                    : theme.colors.backgroundSecondary,
                  borderColor: formData.locations.includes(location)
                    ? theme.colors.primary
                    : theme.colors.border,
                }
              ]}
              onPress={() => handleLocationToggle(location)}
            >
              <View style={[
                styles.locationCheckbox,
                {
                  backgroundColor: formData.locations.includes(location)
                    ? theme.colors.primary
                    : 'transparent',
                  borderColor: theme.colors.primary,
                }
              ]}>
                {formData.locations.includes(location) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.locationText,
                {
                  color: formData.locations.includes(location)
                    ? theme.colors.primary
                    : theme.colors.text.primary
                }
              ]}>
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.locations && <Text style={styles.errorText}>{errors.locations}</Text>}
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
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    inputGroup: {
      marginBottom: 20,
      // Remove zIndex from here as it can interfere
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
    errorText: {
      fontSize: 12,
      color: theme.colors.status.error,
      marginTop: 6,
      fontWeight: '500',
    },
    dropdown: {
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundTertiary,
      position: 'relative',
      zIndex: 999, // High z-index for dropdown container
    },
    dropdownButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    dropdownText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    dropdownPlaceholder: {
      color: theme.colors.text.muted,
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 12,
      marginTop: 4,
      zIndex: 99999, // Extremely high z-index for dropdown list
      elevation: 50, // Very high elevation for Android
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    dropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    locationContainer: {
      gap: 12,
      zIndex: 1, // Lower z-index for location container
    },
    locationOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      gap: 12,
    },
    locationCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    locationText: {
      fontSize: 16,
      fontWeight: '500',
    },
    footer: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      borderTopWidth: 2,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundSecondary,
      zIndex: 1, // Lower z-index for footer
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
    cancelButton: {
      backgroundColor: theme.colors.backgroundTertiary,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
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
                  <Text style={styles.headerTitle}>✨ Add New User</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                  style={styles.content}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {/* User Name */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, styles.requiredLabel]}>User Name *</Text>
                    <TextInput
                      style={[styles.input, errors.userName && styles.inputError]}
                      value={formData.userName}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, userName: text }))}
                      placeholder="Enter user name"
                      placeholderTextColor={theme.colors.text.muted}
                    />
                    {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, styles.requiredLabel]}>Email *</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      value={formData.email}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                      placeholder="Enter email address"
                      placeholderTextColor={theme.colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Mobile Number */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, styles.requiredLabel]}>Mobile Number *</Text>
                    <TextInput
                      style={[styles.input, errors.mobileNumber && styles.inputError]}
                      value={formData.mobileNumber}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, mobileNumber: text }))}
                      placeholder="Enter mobile number"
                      placeholderTextColor={theme.colors.text.muted}
                      keyboardType="phone-pad"
                    />
                    {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
                  </View>

                  {/* Role Dropdown */}
                  <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                    <Text style={[styles.label, styles.requiredLabel]}>Role *</Text>
                    <View style={[styles.dropdown, errors.role && styles.inputError]}>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                      >
                        <Text style={[
                          styles.dropdownText,
                          !formData.role && styles.dropdownPlaceholder
                        ]}>
                          {formData.role || 'Select Role'}
                        </Text>
                        <ChevronDown size={20} color={theme.colors.text.secondary} />
                      </TouchableOpacity>

                      {showRoleDropdown && (
                        <View style={styles.dropdownList}>
                          {roleOptions.map((role) => (
                            <TouchableOpacity
                              key={role}
                              style={styles.dropdownItem}
                              onPress={() => handleRoleSelect(role as 'Admin' | 'Sales Manager' | 'Investor')}
                            >
                              <Text style={styles.dropdownItemText}>{role}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
                  </View>

                  {/* Location Options */}
                  <View style={{ zIndex: 1 }}>
                    {renderLocationOptions()}
                  </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.submitButton]}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>Save User</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}