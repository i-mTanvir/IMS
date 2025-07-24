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
  Building,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  Calendar,
  Star,
  ChevronDown,
  Camera,
  Upload,
  Sparkles,
  UserPlus,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SupplierFormData {
  supplierName: string;
  supplierCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessType: string;
  taxId: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  paymentTerms: string;
  creditLimit: string;
  rating: number;
  notes: string;
  isActive: boolean;
  profileImage: string | null;
}

interface SupplierAddFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  existingSupplier?: any;
}

// Enhanced business types with icons and descriptions
const businessTypes = [
  { id: 'manufacturer', name: 'Manufacturer', icon: '🏭', description: 'Produces goods directly' },
  { id: 'distributor', name: 'Distributor', icon: '🚚', description: 'Distributes products to retailers' },
  { id: 'wholesaler', name: 'Wholesaler', icon: '📦', description: 'Sells in bulk quantities' },
  { id: 'retailer', name: 'Retailer', icon: '🏪', description: 'Sells directly to consumers' },
  { id: 'service_provider', name: 'Service Provider', icon: '🔧', description: 'Provides services and support' },
];

export default function SupplierAddForm({ visible, onClose, onSubmit, existingSupplier }: SupplierAddFormProps) {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const initialFormState: SupplierFormData = {
    supplierName: '',
    supplierCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    businessType: '',
    taxId: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    paymentTerms: '30',
    creditLimit: '0',
    rating: 5,
    notes: '',
    isActive: true,
    profileImage: null,
  };

  const [formData, setFormData] = useState<SupplierFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdowns, setShowDropdowns] = useState({
    businessType: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const canAddSupplier = hasPermission('suppliers', 'add');

  // Form steps for better UX
  const steps = [
    { title: 'Basic Info', icon: Building },
    { title: 'Contact', icon: Phone },
    { title: 'Address', icon: MapPin },
    { title: 'Financial', icon: CreditCard },
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
      if (existingSupplier) {
        setFormData({
          supplierName: existingSupplier.supplierName || '',
          supplierCode: existingSupplier.supplierCode || '',
          contactPerson: existingSupplier.contactPerson || '',
          email: existingSupplier.email || '',
          phone: existingSupplier.phone || '',
          alternatePhone: existingSupplier.alternatePhone || '',
          address: existingSupplier.address || '',
          city: existingSupplier.city || '',
          state: existingSupplier.state || '',
          zipCode: existingSupplier.zipCode || '',
          country: existingSupplier.country || 'Pakistan',
          businessType: existingSupplier.businessType || '',
          taxId: existingSupplier.taxId || '',
          bankName: existingSupplier.bankName || '',
          accountNumber: existingSupplier.accountNumber || '',
          routingNumber: existingSupplier.routingNumber || '',
          paymentTerms: existingSupplier.paymentTerms?.toString() || '30',
          creditLimit: existingSupplier.creditLimit?.toString() || '0',
          rating: existingSupplier.rating || 5,
          notes: existingSupplier.notes || '',
          isActive: existingSupplier.isActive !== undefined ? existingSupplier.isActive : true,
          profileImage: existingSupplier.profileImage || null,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setCurrentStep(0);
    }
  }, [visible, existingSupplier]);

  // Auto-generate supplier code when name changes
  useEffect(() => {
    if (formData.supplierName && !existingSupplier) {
      const code = generateSupplierCode(formData.supplierName);
      setFormData(prev => ({ ...prev, supplierCode: code }));
    }
  }, [formData.supplierName, existingSupplier]);

  const generateSupplierCode = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `SUP-${cleanName.slice(0, 3)}${timestamp}`;
  };

  const handlePressOutside = () => {
    setShowDropdowns({
      businessType: false,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Business type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!canAddSupplier) {
      Alert.alert('Permission Denied', 'You do not have permission to add suppliers.');
      return;
    }

    if (validateForm()) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onSubmit(formData);
        Alert.alert('Success', 'Supplier added successfully!');
        onClose();
      } catch (error) {
        Alert.alert('Error', 'Failed to add supplier. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
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

  const renderEnhancedDropdown = (
    type: keyof typeof showDropdowns,
    items: any[],
    value: string,
    onSelect: (item: any) => void,
    placeholder: string
  ) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { borderColor: errors[type] ? theme.colors.status.error : theme.colors.primary + '30' },
          showDropdowns[type] && styles.dropdownButtonActive,
        ]}
        onPress={() => {
          setShowDropdowns(prev => {
            const newState = { businessType: false };
            newState[type] = !prev[type];
            return newState;
          });
        }}
      >
        <Text style={[
          styles.dropdownButtonText,
          { color: value ? theme.colors.text.primary : theme.colors.text.muted }
        ]}>
          {value || placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={theme.colors.text.muted}
          style={[
            styles.dropdownIcon,
            showDropdowns[type] && { transform: [{ rotate: '180deg' }] }
          ]}
        />
      </TouchableOpacity>

      {showDropdowns[type] && (
        <View
          style={[
            styles.dropdownList,
            { backgroundColor: theme.colors.background }
          ]}
        >
          <ScrollView
            nestedScrollEnabled={true}
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  index === items.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => {
                  onSelect(item);
                  setShowDropdowns(prev => ({ ...prev, [type]: false }));
                }}
              >
                <View style={styles.dropdownItemContent}>
                  {item.icon && <Text style={styles.dropdownItemIcon}>{item.icon}</Text>}
                  <View style={styles.dropdownItemTextContainer}>
                    <Text style={styles.dropdownItemText}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={styles.dropdownItemDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

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
      case 3:
        return renderFinancialStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      {/* Profile Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Sparkles size={18} color={theme.colors.primary} /> Company Logo
        </Text>
        <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImagePicker}>
          <View style={styles.imageUploadContent}>
            <View style={styles.imageUploadIcon}>
              <Camera size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.imageUploadText}>Add company logo</Text>
            <Text style={styles.imageUploadSubtext}>PNG, JPG up to 10MB</Text>
            <View style={styles.uploadButton}>
              <Upload size={16} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Choose File</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Building size={18} color={theme.colors.primary} /> Basic Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Supplier Name *</Text>
          <TextInput
            style={[styles.input, errors.supplierName && styles.inputError]}
            value={formData.supplierName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, supplierName: text }))}
            placeholder="Enter supplier name"
            placeholderTextColor={theme.colors.text.muted}
          />
          {errors.supplierName && <Text style={styles.errorText}>{errors.supplierName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Supplier Code</Text>
          <TextInput
            style={[styles.input, { opacity: 0.7 }]}
            value={formData.supplierCode}
            onChangeText={(text) => setFormData(prev => ({ ...prev, supplierCode: text }))}
            placeholder="Auto-generated"
            placeholderTextColor={theme.colors.text.muted}
            editable={!!existingSupplier}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Contact Person *</Text>
          <TextInput
            style={[styles.input, errors.contactPerson && styles.inputError]}
            value={formData.contactPerson}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactPerson: text }))}
            placeholder="Enter contact person name"
            placeholderTextColor={theme.colors.text.muted}
          />
          {errors.contactPerson && <Text style={styles.errorText}>{errors.contactPerson}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Business Type *</Text>
          {renderEnhancedDropdown(
            'businessType',
            businessTypes,
            businessTypes.find(type => type.id === formData.businessType)?.name || '',
            (item) => setFormData(prev => ({ ...prev, businessType: item.id })),
            'Select business type'
          )}
          {errors.businessType && <Text style={styles.errorText}>{errors.businessType}</Text>}
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
          <Text style={[styles.label, styles.requiredLabel]}>Phone Number *</Text>
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
          <Text style={styles.label}>Alternate Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.alternatePhone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, alternatePhone: text }))}
            placeholder="Enter alternate phone number"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Email Address *</Text>
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

        {/* Supplier Rating */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Supplier Rating</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setFormData(prev => ({ ...prev, rating: star }))}
                style={styles.starButton}
              >
                <Star
                  size={32}
                  color={star <= formData.rating ? '#FFD700' : theme.colors.text.muted}
                  fill={star <= formData.rating ? '#FFD700' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
            <Text style={styles.ratingText}>
              ({formData.rating}/5)
            </Text>
          </View>
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
          <Text style={[styles.label, styles.requiredLabel]}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Enter full address"
            placeholderTextColor={theme.colors.text.muted}
            multiline
            numberOfLines={3}
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.addressRow}>
          <View style={styles.addressInput}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="Enter city"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
          <View style={styles.addressInput}>
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

        <View style={styles.addressRow}>
          <View style={styles.addressInput}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, zipCode: text }))}
              placeholder="Enter ZIP code"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.addressInput}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
              placeholder="Enter country"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tax ID</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={(text) => setFormData(prev => ({ ...prev, taxId: text }))}
            placeholder="Enter tax identification number"
            placeholderTextColor={theme.colors.text.muted}
          />
        </View>
      </View>
    </View>
  );

  const renderFinancialStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <CreditCard size={18} color={theme.colors.primary} /> Financial Information
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={formData.bankName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bankName: text }))}
            placeholder="Enter bank name"
            placeholderTextColor={theme.colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Number</Text>
          <TextInput
            style={styles.input}
            value={formData.accountNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, accountNumber: text }))}
            placeholder="Enter account number"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Routing Number</Text>
          <TextInput
            style={styles.input}
            value={formData.routingNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, routingNumber: text }))}
            placeholder="Enter routing number"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.addressRow}>
          <View style={styles.addressInput}>
            <Text style={styles.label}>Payment Terms (Days)</Text>
            <TextInput
              style={styles.input}
              value={formData.paymentTerms}
              onChangeText={(text) => setFormData(prev => ({ ...prev, paymentTerms: text }))}
              placeholder="30"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.addressInput}>
            <Text style={styles.label}>Credit Limit</Text>
            <TextInput
              style={styles.input}
              value={formData.creditLimit}
              onChangeText={(text) => setFormData(prev => ({ ...prev, creditLimit: text }))}
              placeholder="0"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Enter additional notes (optional)"
            placeholderTextColor={theme.colors.text.muted}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>
    </View>
  );

  if (!canAddSupplier) {
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
      right: -25,
      width: 50,
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
      height: 80,
      textAlignVertical: 'top',
    },
    errorText: {
      color: theme.colors.status.error,
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    dropdownContainer: {
      position: 'relative',
      zIndex: 1000,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.backgroundTertiary,
    },
    dropdownButtonActive: {
      borderColor: theme.colors.primary,
    },
    dropdownButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    dropdownIcon: {
      marginLeft: 8,
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      borderRadius: 12,
      marginTop: 4,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      zIndex: 1001,
    },
    dropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dropdownItemIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    dropdownItemTextContainer: {
      flex: 1,
    },
    dropdownItemText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    dropdownItemDescription: {
      fontSize: 12,
      color: theme.colors.text.muted,
      marginTop: 2,
    },
    addressRow: {
      flexDirection: 'row',
      gap: 12,
    },
    addressInput: {
      flex: 1,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    starButton: {
      marginRight: 4,
    },
    ratingText: {
      fontSize: 14,
      color: theme.colors.text.muted,
      marginLeft: 12,
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
                  <Text style={styles.headerTitle}>✨ Add New Supplier</Text>
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
                        {isLoading ? '⏳ Adding...' : '🚀 Add Supplier'}
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