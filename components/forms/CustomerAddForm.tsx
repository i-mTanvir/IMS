import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Animated,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Camera,
  Check,
  Upload,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerService, CreateCustomerData } from '@/lib/services/CustomerService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomerFormData {
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  customerType: 'vip' | 'regular' | 'wholesale';
}

interface CustomerAddFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  existingCustomer?: any;
}



export default function CustomerAddForm({ visible, onClose, onSubmit, existingCustomer }: CustomerAddFormProps) {
  const { theme } = useTheme();
  const { user, hasPermission } = useAuth();
  
  // Debug authentication state
  console.log('CustomerAddForm - Auth state:', { user, hasPermission: hasPermission('customers', 'add') });
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const initialFormState: CustomerFormData = {
    customerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Bangladesh',
    postalCode: '',
    customerType: 'regular',
  };

  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const canAddCustomer = hasPermission('customers', 'add');

  // Form steps for better UX
  const steps = [
    { title: 'Basic Info', icon: User },
    { title: 'Contact', icon: Phone },
    { title: 'Address', icon: MapPin },
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
      if (existingCustomer) {
        setFormData({
          customerName: existingCustomer.name || '',
          contactPerson: existingCustomer.contact_person || '',
          email: existingCustomer.email || '',
          phone: existingCustomer.phone || '',
          address: existingCustomer.address || '',
          city: existingCustomer.city || '',
          state: existingCustomer.state || '',
          country: existingCustomer.country || 'Bangladesh',
          postalCode: existingCustomer.postal_code || '',
          customerType: existingCustomer.customer_type || 'regular',
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setCurrentStep(0);
    }
  }, [visible, existingCustomer]);

  // No longer needed since we removed delivery address functionality

  const handlePressOutside = () => {
    // Handle outside press if needed
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!canAddCustomer) {
      Alert.alert('Permission Denied', 'You do not have permission to add customers.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Debug logging
      console.log('Form data:', formData);
      console.log('User ID:', user?.id);
      console.log('User object:', user);

      const customerData: CreateCustomerData = {
        name: formData.customerName.trim(),
        customer_type: formData.customerType,
        contact_person: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || 'Bangladesh',
        postal_code: formData.postalCode.trim() || undefined,
        notes: undefined,
      };

      console.log('Customer data to be sent:', customerData);

      // Check if user exists and has an ID
      if (!user) {
        console.error('User is not authenticated');
        Alert.alert('Authentication Error', 'You must be logged in to add customers.');
        return;
      }

      const userId = user.id;
      console.log('Using user ID for creation:', userId);
      
      if (!userId) {
        console.error('User ID is missing');
        Alert.alert('Authentication Error', 'User ID is missing. Please log in again.');
        return;
      }
      
      const newCustomer = await CustomerService.createCustomer(customerData, userId);

      Alert.alert(
        'Success',
        `Customer "${newCustomer.name}" has been created successfully!`,
        [{
          text: 'OK', onPress: () => {
            onSubmit({
              customerName: newCustomer.name,
              contactPerson: newCustomer.contact_person || '',
              email: newCustomer.email || '',
              phone: newCustomer.phone || '',
              address: newCustomer.address || '',
              city: newCustomer.city || '',
              state: newCustomer.state || '',
              country: newCustomer.country || 'Bangladesh',
              postalCode: newCustomer.postal_code || '',
              customerType: newCustomer.customer_type,
            });
            handleClose();
          }
        }]
      );
    } catch (error: any) {
      console.error('Failed to create customer:', error);
      Alert.alert('Error', error.message || 'Failed to create customer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    setCurrentStep(0);
    onClose();
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
        return renderContactStep();
      case 2:
        return renderAddressStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <User size={18} color={theme.colors.primary} /> Basic Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Customer Name *</Text>
          <TextInput
            style={[styles.input, errors.customerName && styles.inputError]}
            value={formData.customerName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, customerName: text }))}
            placeholder="Enter customer name"
            placeholderTextColor={theme.colors.text.muted}
          />
          {errors.customerName && <Text style={styles.errorText}>{errors.customerName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contactPerson}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
            placeholder="Enter contact person name (optional)"
            placeholderTextColor={theme.colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Customer Type</Text>
          <View style={styles.customerTypeContainer}>
            {(['regular', 'vip', 'wholesale'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.customerTypeOption,
                  formData.customerType === type && styles.customerTypeOptionSelected
                ]}
                onPress={() => setFormData(prev => ({ ...prev, customerType: type }))}
              >
                <Text style={[
                  styles.customerTypeText,
                  formData.customerType === type && styles.customerTypeTextSelected
                ]}>
                  {type === 'vip' && '👑 '}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderContactStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Phone size={18} color={theme.colors.primary} /> Contact Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="Enter phone number"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
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
      </View>
    </View>
  );

  const renderAddressStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <MapPin size={18} color={theme.colors.primary} /> Address Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Enter address"
            placeholderTextColor={theme.colors.text.muted}
            multiline
            numberOfLines={3}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              placeholder="Enter state"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
              placeholder="Enter country"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={formData.postalCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, postalCode: text }))}
              placeholder="Enter postal code"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>
      </View>
    </View>
  );

  if (!canAddCustomer) {
    return null;
  }

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
    imageUploadContainer: {
      height: 140,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.primary + '40',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '08',
      marginBottom: 16,
    },
    imageUploadContent: {
      alignItems: 'center',
    },
    imageUploadIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    imageUploadText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: 4,
    },
    imageUploadSubtext: {
      fontSize: 12,
      color: theme.colors.text.muted,
      marginBottom: 12,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
      elevation: 2,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    uploadButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
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

    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    checkboxActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkboxLabel: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    customerTypeContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    customerTypeOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundTertiary,
      alignItems: 'center',
    },
    customerTypeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    customerTypeText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    customerTypeTextSelected: {
      color: theme.colors.primary,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    flex1: {
      flex: 1,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.container,
                {
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>✨ Add New Customer</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
                  bounces={true}
                  scrollEventThrottle={16}
                  decelerationRate="normal"
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
                      onPress={onClose}
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
                        {isLoading ? '⏳ Saving...' : '🚀 Add Customer'}
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