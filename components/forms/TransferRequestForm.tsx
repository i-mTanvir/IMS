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
  Package,
  Send,
  Check,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronDown,
  Search,
  User,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TransferRequestData {
  productId: string;
  productName: string;
  requestedQuantity: string;
  sourceLocation: string;
  destinationLocation: string;
  requestDate: Date;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  notes: string;
  lotNumber: string;
  requestedBy: string;
}

interface TransferRequestFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TransferRequestData) => void;
  product: any;
  locations: string[];
}

// Enhanced location data with icons and types
const enhancedLocations = [
  { id: '1', name: 'Warehouse 1', type: 'warehouse', icon: '🏭' },
  { id: '2', name: 'Warehouse 2', type: 'warehouse', icon: '🏭' },
  { id: '3', name: 'Warehouse 3', type: 'warehouse', icon: '🏭' },
  { id: '4', name: 'Showroom 1', type: 'showroom', icon: '🏪' },
  { id: '5', name: 'Showroom 2', type: 'showroom', icon: '🏪' },
  { id: '6', name: 'Storage A', type: 'storage', icon: '📦' },
  { id: '7', name: 'Storage B', type: 'storage', icon: '📦' },
  { id: '8', name: 'Main Store', type: 'store', icon: '🏬' },
  { id: '9', name: 'Branch Store', type: 'store', icon: '🏬' },
  { id: '10', name: 'Online Warehouse', type: 'warehouse', icon: '💻' },
];



const transferReasons = [
  { id: '1', name: 'Customer Demand', description: 'High customer demand in showroom' },
  { id: '2', name: 'Low Stock', description: 'Running low on inventory' },
  { id: '3', name: 'Seasonal Display', description: 'Seasonal product display' },
  { id: '4', name: 'Promotional Event', description: 'Special promotion or sale' },
  { id: '5', name: 'New Product Launch', description: 'Introducing new product line' },
  { id: '6', name: 'Restock', description: 'Regular restocking' },
  { id: '7', name: 'Customer Order', description: 'Specific customer order fulfillment' },
  { id: '8', name: 'Other', description: 'Other reason (specify in notes)' },
];

export default function TransferRequestForm({ visible, onClose, onSubmit, product, locations }: TransferRequestFormProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const urgencyLevels = [
    { id: 'low', name: 'Low Priority', color: theme.colors.status.success, icon: '🟢', description: 'Standard processing time' },
    { id: 'medium', name: 'Medium Priority', color: theme.colors.status.warning, icon: '🟡', description: 'Process within 24 hours' },
    { id: 'high', name: 'High Priority', color: theme.colors.status.error, icon: '🔴', description: 'Urgent - Process immediately' },
  ];

  const initialFormState: TransferRequestData = {
    productId: product?.id || '',
    productName: product?.name || '',
    requestedQuantity: '',
    sourceLocation: '',
    destinationLocation: '',
    requestDate: new Date(),
    urgency: 'medium',
    reason: '',
    notes: '',
    lotNumber: product?.lot || '',
    requestedBy: user?.name || 'Sales Manager',
  };

  const [formData, setFormData] = useState<TransferRequestData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showDropdowns, setShowDropdowns] = useState({
    sourceLocation: false,
    destinationLocation: false,
    urgency: false,
    reason: false,
  });
  const [searchTexts, setSearchTexts] = useState({
    sourceLocation: '',
    destinationLocation: '',
  });

  // Form steps for better UX
  const steps = [
    { title: 'Product Details', icon: Package },
    { title: 'Request Details', icon: Send },
    { title: 'Confirmation', icon: Check },
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
    if (visible && product) {
      setFormData({
        productId: product.id || '',
        productName: product.name || '',
        requestedQuantity: '',
        sourceLocation: '',
        destinationLocation: '',
        requestDate: new Date(),
        urgency: 'medium',
        reason: '',
        notes: '',
        lotNumber: product.lot || '',
        requestedBy: user?.name || 'Sales Manager',
      });
      setErrors({});
      setCurrentStep(0);
      setSearchTexts({ sourceLocation: '', destinationLocation: '' });
    }
  }, [visible, product, user]);

  const handlePressOutside = () => {
    setShowDropdowns({
      sourceLocation: false,
      destinationLocation: false,
      urgency: false,
      reason: false,
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.requestedQuantity.trim()) {
        newErrors.requestedQuantity = 'Requested quantity is required';
      } else if (isNaN(Number(formData.requestedQuantity)) || Number(formData.requestedQuantity) <= 0) {
        newErrors.requestedQuantity = 'Please enter a valid quantity';
      }

      if (!formData.lotNumber.trim()) {
        newErrors.lotNumber = 'Lot number is required';
      }
    } else if (currentStep === 1) {
      if (!formData.sourceLocation.trim()) {
        newErrors.sourceLocation = 'Source location is required';
      }

      if (!formData.destinationLocation.trim()) {
        newErrors.destinationLocation = 'Destination location is required';
      }

      if (formData.sourceLocation === formData.destinationLocation) {
        newErrors.destinationLocation = 'Source and destination cannot be the same';
      }

      if (!formData.reason.trim()) {
        newErrors.reason = 'Transfer reason is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep()) {
      onSubmit(formData);
      onClose();
      Alert.alert(
        'Request Submitted',
        'Your transfer request has been submitted successfully and is pending approval.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View 
            style={[
              styles.stepCircle, 
              index <= currentStep && styles.stepCircleActive
            ]}
          >
            {index < currentStep ? (
              <Check size={20} color={theme.colors.primary} />
            ) : (
              <step.icon 
                size={20} 
                color={index <= currentStep ? theme.colors.primary : theme.colors.text.muted} 
              />
            )}
          </View>
          {index < steps.length - 1 && (
            <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderProductDetailsStep = () => (
    <View style={styles.stepContent}>
      {/* Product Information Card */}
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productIconContainer}>
            <Package size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product?.name || 'Product Name'}</Text>
            <Text style={styles.productCode}>{product?.productCode || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Available Stock Information */}
      <View style={styles.stockCard}>
        <Text style={styles.stockTitle}>Available Stock</Text>
        <Text style={styles.stockAmount}>{product?.stock || 0} units</Text>
        <Text style={styles.stockLocation}>📍 {product?.location || 'Unknown Location'}</Text>
      </View>

      {/* Request Quantity */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Requested Quantity *</Text>
        <TextInput
          style={[styles.input, errors.requestedQuantity && styles.inputError]}
          placeholder="Enter quantity to request"
          value={formData.requestedQuantity}
          onChangeText={(text) => setFormData({ ...formData, requestedQuantity: text })}
          keyboardType="numeric"
          placeholderTextColor={theme.colors.text.muted}
        />
        {errors.requestedQuantity && (
          <Text style={styles.errorText}>{errors.requestedQuantity}</Text>
        )}
      </View>

      {/* Lot Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Lot Number *</Text>
        <TextInput
          style={[styles.input, errors.lotNumber && styles.inputError]}
          placeholder="Enter lot number"
          value={formData.lotNumber}
          onChangeText={(text) => setFormData({ ...formData, lotNumber: text })}
          placeholderTextColor={theme.colors.text.muted}
        />
        {errors.lotNumber && (
          <Text style={styles.errorText}>{errors.lotNumber}</Text>
        )}
      </View>
    </View>
  );

  const renderRequestDetailsStep = () => (
    <View style={styles.stepContent}>
      {/* Source Location */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Source Location *</Text>
        <TouchableOpacity
          style={[styles.dropdown, errors.sourceLocation && styles.inputError]}
          onPress={() => setShowDropdowns({ ...showDropdowns, sourceLocation: !showDropdowns.sourceLocation })}
        >
          <Text style={[styles.dropdownText, !formData.sourceLocation && styles.placeholderText]}>
            {formData.sourceLocation || 'Select source location'}
          </Text>
          <ChevronDown size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        {errors.sourceLocation && (
          <Text style={styles.errorText}>{errors.sourceLocation}</Text>
        )}

        {showDropdowns.sourceLocation && (
          <View style={styles.dropdownList}>
            <View style={styles.searchContainer}>
              <Search size={16} color={theme.colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search locations..."
                value={searchTexts.sourceLocation}
                onChangeText={(text) => setSearchTexts({ ...searchTexts, sourceLocation: text })}
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {enhancedLocations
                .filter(location => 
                  location.name.toLowerCase().includes(searchTexts.sourceLocation.toLowerCase()) ||
                  location.type.toLowerCase().includes(searchTexts.sourceLocation.toLowerCase())
                )
                .map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, sourceLocation: location.name });
                      setShowDropdowns({ ...showDropdowns, sourceLocation: false });
                      setSearchTexts({ ...searchTexts, sourceLocation: '' });
                    }}
                  >
                    <Text style={styles.locationIcon}>{location.icon}</Text>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationType}>{location.type}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Destination Location */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Destination Location *</Text>
        <TouchableOpacity
          style={[styles.dropdown, errors.destinationLocation && styles.inputError]}
          onPress={() => setShowDropdowns({ ...showDropdowns, destinationLocation: !showDropdowns.destinationLocation })}
        >
          <Text style={[styles.dropdownText, !formData.destinationLocation && styles.placeholderText]}>
            {formData.destinationLocation || 'Select destination location'}
          </Text>
          <ChevronDown size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        {errors.destinationLocation && (
          <Text style={styles.errorText}>{errors.destinationLocation}</Text>
        )}

        {showDropdowns.destinationLocation && (
          <View style={styles.dropdownList}>
            <View style={styles.searchContainer}>
              <Search size={16} color={theme.colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search locations..."
                value={searchTexts.destinationLocation}
                onChangeText={(text) => setSearchTexts({ ...searchTexts, destinationLocation: text })}
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {enhancedLocations
                .filter(location => 
                  location.name.toLowerCase().includes(searchTexts.destinationLocation.toLowerCase()) ||
                  location.type.toLowerCase().includes(searchTexts.destinationLocation.toLowerCase())
                )
                .map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, destinationLocation: location.name });
                      setShowDropdowns({ ...showDropdowns, destinationLocation: false });
                      setSearchTexts({ ...searchTexts, destinationLocation: '' });
                    }}
                  >
                    <Text style={styles.locationIcon}>{location.icon}</Text>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationType}>{location.type}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Urgency Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Priority Level</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdowns({ ...showDropdowns, urgency: !showDropdowns.urgency })}
        >
          <View style={styles.urgencyDisplay}>
            <Text style={styles.urgencyIcon}>
              {urgencyLevels.find(u => u.id === formData.urgency)?.icon}
            </Text>
            <Text style={styles.dropdownText}>
              {urgencyLevels.find(u => u.id === formData.urgency)?.name}
            </Text>
          </View>
          <ChevronDown size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        {showDropdowns.urgency && (
          <View style={styles.dropdownList}>
            {urgencyLevels.map((urgency) => (
              <TouchableOpacity
                key={urgency.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setFormData({ ...formData, urgency: urgency.id as any });
                  setShowDropdowns({ ...showDropdowns, urgency: false });
                }}
              >
                <Text style={styles.urgencyIcon}>{urgency.icon}</Text>
                <View style={styles.urgencyInfo}>
                  <Text style={styles.urgencyName}>{urgency.name}</Text>
                  <Text style={styles.urgencyDescription}>{urgency.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Transfer Reason */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Transfer Reason *</Text>
        <TouchableOpacity
          style={[styles.dropdown, errors.reason && styles.inputError]}
          onPress={() => setShowDropdowns({ ...showDropdowns, reason: !showDropdowns.reason })}
        >
          <Text style={[styles.dropdownText, !formData.reason && styles.placeholderText]}>
            {transferReasons.find(r => r.id === formData.reason)?.name || 'Select transfer reason'}
          </Text>
          <ChevronDown size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
        {errors.reason && (
          <Text style={styles.errorText}>{errors.reason}</Text>
        )}

        {showDropdowns.reason && (
          <View style={styles.dropdownList}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
              {transferReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormData({ ...formData, reason: reason.id });
                    setShowDropdowns({ ...showDropdowns, reason: false });
                  }}
                >
                  <View style={styles.reasonInfo}>
                    <Text style={styles.reasonName}>{reason.name}</Text>
                    <Text style={styles.reasonDescription}>{reason.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Additional Notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Additional Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add any additional notes about this transfer request"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholderTextColor={theme.colors.text.muted}
        />
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmationCard}>
        <View style={styles.confirmationHeader}>
          <Sparkles size={24} color={theme.colors.primary} />
          <Text style={styles.confirmationTitle}>Transfer Request Summary</Text>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>Product Information</Text>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Product:</Text>
            <Text style={styles.confirmationValue}>{formData.productName}</Text>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Requested Quantity:</Text>
            <Text style={styles.confirmationValue}>{formData.requestedQuantity} units</Text>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Lot Number:</Text>
            <Text style={styles.confirmationValue}>{formData.lotNumber}</Text>
          </View>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>Transfer Route</Text>
          <View style={styles.transferRoute}>
            <View style={styles.routeLocation}>
              <Text style={styles.routeLocationName}>{formData.sourceLocation}</Text>
              <Text style={styles.routeLocationLabel}>From</Text>
            </View>
            <ArrowRight size={20} color={theme.colors.primary} />
            <View style={styles.routeLocation}>
              <Text style={styles.routeLocationName}>{formData.destinationLocation}</Text>
              <Text style={styles.routeLocationLabel}>To</Text>
            </View>
          </View>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={styles.confirmationSectionTitle}>Request Details</Text>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Priority:</Text>
            <View style={styles.priorityDisplay}>
              <Text style={styles.priorityIcon}>
                {urgencyLevels.find(u => u.id === formData.urgency)?.icon}
              </Text>
              <Text style={styles.confirmationValue}>
                {urgencyLevels.find(u => u.id === formData.urgency)?.name}
              </Text>
            </View>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Reason:</Text>
            <Text style={styles.confirmationValue}>
              {transferReasons.find(r => r.id === formData.reason)?.name}
            </Text>
          </View>
          <View style={styles.confirmationRow}>
            <Text style={styles.confirmationLabel}>Requested By:</Text>
            <Text style={styles.confirmationValue}>{formData.requestedBy}</Text>
          </View>
        </View>

        {formData.notes && (
          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationSectionTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{formData.notes}</Text>
          </View>
        )}

        <View style={styles.confirmationAlert}>
          <AlertCircle size={18} color={theme.colors.status.warning} />
          <Text style={styles.confirmationAlertText}>
            This request will be sent to administrators for approval. You will be notified once it's processed.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderProductDetailsStep();
      case 1:
        return renderRequestDetailsStep();
      case 2:
        return renderConfirmationStep();
      default:
        return renderProductDetailsStep();
    }
  };



  // Create styles function that uses theme
  const createStyles = () => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: screenHeight * 0.95,
      minHeight: screenHeight * 0.6,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
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
      color: theme.colors.text.secondary,
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
      backgroundColor: theme.colors.background,
    },
    stepContent: {
      padding: 20,
    },
    productCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    productIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: theme.colors.backgroundTertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    productCode: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    stockCard: {
      backgroundColor: `${theme.colors.status.success}20`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: `${theme.colors.status.success}40`,
      alignItems: 'center',
    },
    stockTitle: {
      fontSize: 14,
      color: theme.colors.status.success,
      marginBottom: 4,
    },
    stockAmount: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.status.success,
      marginBottom: 4,
    },
    stockLocation: {
      fontSize: 12,
      color: theme.colors.status.success,
    },
    inputGroup: {
      marginBottom: 20,
      position: 'relative',
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
    },
    inputError: {
      borderColor: theme.colors.status.error,
      backgroundColor: `${theme.colors.status.error}10`,
    },
    errorText: {
      color: theme.colors.status.error,
      fontSize: 14,
      marginTop: 6,
      marginLeft: 4,
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.background,
    },
    dropdownText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      flex: 1,
    },
    placeholderText: {
      color: theme.colors.text.muted,
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxHeight: 200,
      zIndex: 1000,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    dropdownScroll: {
      maxHeight: 150,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.backgroundSecondary,
      gap: 12,
    },
    locationIcon: {
      fontSize: 20,
    },
    locationInfo: {
      flex: 1,
    },
    locationName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    locationType: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    },
    urgencyDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    urgencyIcon: {
      fontSize: 16,
    },
    urgencyInfo: {
      flex: 1,
    },
    urgencyName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    urgencyDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    reasonInfo: {
      flex: 1,
    },
    reasonName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    reasonDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    textArea: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    confirmationCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    confirmationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    confirmationTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    confirmationSection: {
      marginBottom: 20,
    },
    confirmationSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    confirmationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    confirmationLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    confirmationValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
      flex: 1,
      marginLeft: 12,
    },
    transferRoute: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    routeLocation: {
      alignItems: 'center',
      flex: 1,
    },
    routeLocationName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    routeLocationLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
    },
    priorityDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    priorityIcon: {
      fontSize: 16,
    },
    notesText: {
      fontSize: 15,
      color: theme.colors.text.primary,
      lineHeight: 22,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    confirmationAlert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.status.warning}20`,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: `${theme.colors.status.warning}40`,
    },
    confirmationAlertText: {
      fontSize: 14,
      color: theme.colors.status.warning,
      marginLeft: 12,
      flex: 1,
      fontWeight: '500',
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    backButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    nextButton: {
      flex: 2,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    nextButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    submitButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.status.success,
      gap: 8,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
  });

  const styles = createStyles();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
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
                  <Text style={styles.headerTitle}>📋 Transfer Request</Text>
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
                  {renderStepContent()}
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                  {currentStep > 0 ? (
                    <TouchableOpacity 
                      style={styles.backButton} 
                      onPress={handlePrevStep}
                    >
                      <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.backButton} 
                      onPress={onClose}
                    >
                      <Text style={styles.backButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <TouchableOpacity 
                      style={styles.nextButton} 
                      onPress={handleNextStep}
                    >
                      <Text style={styles.nextButtonText}>Next →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.submitButton} 
                      onPress={handleSubmit}
                    >
                      <Send size={24} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Submit Request</Text>
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