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
  Image,
  Platform,
  KeyboardAvoidingView,
  Animated,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import {
  X,
  Camera,
  Upload,
  Package,
  DollarSign,
  MapPin,
  User,
  Calendar,
  AlertCircle,
  Check,
  ChevronDown,
  Star,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ProductFormData {
  productName: string;
  productCode: string;
  category: string;
  description: string;
  purchaseAmount: string;
  purchasePrice: string;
  sellingPrice: string;
  perMeterPrice: string;
  lotNumber: string;
  supplier: string;
  location: string;
  minimumThreshold: string;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: string;
  dueDate: string;
  productImage: string | null;
}

interface ProductAddFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  existingProduct?: any;
}

// Mock data for dropdowns - expanded for better search experience
const categories = [
  { id: '1', name: 'Sofa Fabrics', icon: '🛋️' },
  { id: '2', name: 'Curtain Fabrics', icon: '🪟' },
  { id: '3', name: 'Artificial Leather', icon: '👜' },
  { id: '4', name: 'Garments', icon: '👕' },
  { id: '5', name: 'Upholstery Fabrics', icon: '🪑' },
  { id: '6', name: 'Denim Fabrics', icon: '👖' },
  { id: '7', name: 'Cotton Fabrics', icon: '🌿' },
  { id: '8', name: 'Silk Fabrics', icon: '🎀' },
  { id: '9', name: 'Wool Fabrics', icon: '🐑' },
  { id: '10', name: 'Linen Fabrics', icon: '🌾' },
  { id: '11', name: 'Polyester Fabrics', icon: '🧵' },
  { id: '12', name: 'Velvet Fabrics', icon: '✨' },
  { id: '13', name: 'Canvas Fabrics', icon: '🎨' },
  { id: '14', name: 'Mesh Fabrics', icon: '🕸️' },
  { id: '15', name: 'Lace Fabrics', icon: '🌸' },
];

const suppliers = [
  { id: '1', name: 'Textile Mills Ltd', company: 'Premium Fabrics Co.', rating: 4.8 },
  { id: '2', name: 'Global Textiles', company: 'International Suppliers', rating: 4.6 },
  { id: '3', name: 'Local Fabric House', company: 'Dhaka Textiles', rating: 4.9 },
  { id: '4', name: 'Asian Textile Corp', company: 'Quality Fabrics Ltd', rating: 4.7 },
  { id: '5', name: 'Modern Fabrics', company: 'Contemporary Textiles', rating: 4.5 },
  { id: '6', name: 'Heritage Textiles', company: 'Traditional Fabrics', rating: 4.8 },
  { id: '7', name: 'Eco Fabrics Ltd', company: 'Sustainable Textiles', rating: 4.9 },
  { id: '8', name: 'Luxury Textiles', company: 'Premium Materials', rating: 4.6 },
  { id: '9', name: 'Industrial Fabrics', company: 'Heavy Duty Textiles', rating: 4.4 },
  { id: '10', name: 'Fashion Fabrics', company: 'Trendy Textiles', rating: 4.7 },
];

const locations = [
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

export default function ProductAddForm({ visible, onClose, onSubmit, existingProduct }: ProductAddFormProps) {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productCode: '',
    category: '',
    description: '',
    purchaseAmount: '',
    purchasePrice: '',
    sellingPrice: '',
    perMeterPrice: '',
    lotNumber: '0',
    supplier: '',
    location: '',
    minimumThreshold: '100',
    paymentStatus: 'pending',
    paidAmount: '',
    dueDate: '',
    productImage: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdowns, setShowDropdowns] = useState({
    category: false,
    supplier: false,
    location: false,
    paymentStatus: false,
  });
  
  const [searchTexts, setSearchTexts] = useState({
    category: '',
    supplier: '',
    location: '',
  });
  const [currentStep, setCurrentStep] = useState(0);

  const canAddProduct = hasPermission('products', 'add');

  // Form steps for better UX
  const steps = [
    { title: 'Basic Info', icon: Package },
    { title: 'Pricing', icon: DollarSign },
    { title: 'Inventory', icon: MapPin },
    { title: 'Payment', icon: Calendar },
  ];

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      if (!existingProduct) {
        setFormData({
          productName: '',
          productCode: '',
          category: '',
          description: '',
          purchaseAmount: '',
          purchasePrice: '',
          sellingPrice: '',
          perMeterPrice: '',
          lotNumber: '0',
          supplier: '',
          location: '',
          minimumThreshold: '100',
          paymentStatus: 'pending',
          paidAmount: '',
          dueDate: '',
          productImage: null,
        });
      }
      setErrors({});
      setCurrentStep(0);
    }
  }, [visible, existingProduct]);

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

  // Auto-calculate per meter price
  useEffect(() => {
    if (formData.purchasePrice && formData.sellingPrice) {
      const purchasePrice = parseFloat(formData.purchasePrice) || 0;
      const sellingPrice = parseFloat(formData.sellingPrice) || 0;
      const perMeter = sellingPrice > 0 ? sellingPrice : purchasePrice;
      setFormData(prev => ({ ...prev, perMeterPrice: perMeter.toFixed(2) }));
    }
  }, [formData.purchasePrice, formData.sellingPrice]);

  const handlePerMeterPriceChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      perMeterPrice: value,
      sellingPrice: value 
    }));
  };

  const handlePressOutside = () => {
    setShowDropdowns({
      category: false,
      supplier: false,
      location: false,
      paymentStatus: false,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    if (!formData.supplier) {
      newErrors.supplier = 'Supplier is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!canAddProduct) {
      Alert.alert('Permission Denied', 'You do not have permission to add products.');
      return;
    }

    if (validateForm()) {
      onSubmit(formData);
      onClose();
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

  const renderSearchableDropdown = (
    type: 'category' | 'supplier' | 'location',
    items: any[],
    value: string,
    onSelect: (item: any) => void,
    placeholder: string
  ) => {
    const searchText = searchTexts[type];
    const filteredItems = items.filter(item => 
      (item.name || item.company || item).toLowerCase().includes(searchText.toLowerCase())
    );

    return (
      <View style={styles.dropdownContainer}>
        <View style={[
          styles.searchInputContainer,
          { borderColor: errors[type] ? theme.colors.status.error : theme.colors.primary + '30' },
          showDropdowns[type] && styles.searchInputContainerActive,
        ]}>
          <TextInput
            style={styles.searchInput}
            value={showDropdowns[type] ? searchText : value}
            onChangeText={(text) => {
              setSearchTexts(prev => ({ ...prev, [type]: text }));
              if (!showDropdowns[type]) {
                const updatedDropdowns = {
                  category: false,
                  supplier: false,
                  location: false,
                  paymentStatus: false,
                };
                setShowDropdowns({
                  ...updatedDropdowns,
                  [type]: true
                });
              }
            }}
            onFocus={() => {
              const updatedDropdowns = {
                category: false,
                supplier: false,
                location: false,
                paymentStatus: false,
              };
              setShowDropdowns({
                ...updatedDropdowns,
                [type]: true
              });
            }}
            placeholder={value || placeholder}
            placeholderTextColor={theme.colors.text.muted}
          />
          <TouchableOpacity
            onPress={() => {
              const updatedDropdowns = {
                category: false,
                supplier: false,
                location: false,
                paymentStatus: false,
              };
              setShowDropdowns({
                ...updatedDropdowns,
                [type]: !showDropdowns[type]
              });
            }}
          >
            <ChevronDown 
              size={20} 
              color={theme.colors.text.muted} 
              style={[
                styles.dropdownIcon,
                showDropdowns[type] && { transform: [{ rotate: '180deg' }] }
              ]}
            />
          </TouchableOpacity>
        </View>
        
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
              bounces={true}
              scrollEventThrottle={16}
              decelerationRate="normal"
            >
              {filteredItems.length > 0 ? filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    index === filteredItems.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setSearchTexts(prev => ({ ...prev, [type]: '' }));
                    setShowDropdowns(prev => ({ ...prev, [type]: false }));
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    {item.icon && <Text style={styles.dropdownItemIcon}>{item.icon}</Text>}
                    <View style={styles.dropdownItemTextContainer}>
                      <Text style={styles.dropdownItemText}>
                        {item.name || item.company || item}
                      </Text>
                      {item.rating && (
                        <View style={styles.ratingContainer}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
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
          const updatedDropdowns = {
            category: false,
            supplier: false,
            location: false,
            paymentStatus: false,
          };
          setShowDropdowns({
            ...updatedDropdowns,
            [type]: !showDropdowns[type]
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
            bounces={true}
            scrollEventThrottle={16}
            decelerationRate="normal"
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id || item}
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
                      {item.name || item.company || item}
                    </Text>
                    {item.rating && (
                      <View style={styles.ratingContainer}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
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
        return renderPricingStep();
      case 2:
        return renderInventoryStep();
      case 3:
        return renderPaymentStep();
      default:
        return renderBasicInfoStep();
    }
  };

  const renderBasicInfoStep = () => (
    <View style={styles.stepContent}>
      {/* Product Image */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Sparkles size={18} color={theme.colors.primary} /> Product Image
        </Text>
        <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImagePicker}>
          <View style={styles.imageUploadContent}>
            <View style={styles.imageUploadIcon}>
              <Camera size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.imageUploadText}>Add product photo</Text>
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
          <Package size={18} color={theme.colors.primary} /> Basic Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, styles.requiredLabel]}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.productName && styles.inputError]}
            value={formData.productName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, productName: text }))}
            placeholder="Enter product name"
            placeholderTextColor={theme.colors.text.muted}
          />
          {errors.productName && <Text style={styles.errorText}>{errors.productName}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Product Code</Text>
            <TextInput
              style={styles.input}
              value={formData.productCode}
              onChangeText={(text) => setFormData(prev => ({ ...prev, productCode: text }))}
              placeholder="Auto-generated"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
          
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Category *</Text>
            {renderSearchableDropdown(
              'category',
              categories,
              formData.category,
              (item) => setFormData(prev => ({ ...prev, category: item.name })),
              'Search or select category'
            )}
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Product description"
            placeholderTextColor={theme.colors.text.muted}
            multiline
          />
        </View>
      </View>
    </View>
  );

  const renderPricingStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <DollarSign size={18} color={theme.colors.primary} /> Pricing Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Purchase Amount</Text>
          <TextInput
            style={styles.input}
            value={formData.purchaseAmount}
            onChangeText={(text) => setFormData(prev => ({ ...prev, purchaseAmount: text }))}
            placeholder="Total purchase amount"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Purchase Price *</Text>
            <TextInput
              style={[styles.input, errors.purchasePrice && styles.inputError]}
              value={formData.purchasePrice}
              onChangeText={(text) => setFormData(prev => ({ ...prev, purchasePrice: text }))}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
            {errors.purchasePrice && <Text style={styles.errorText}>{errors.purchasePrice}</Text>}
          </View>
          
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Selling Price *</Text>
            <TextInput
              style={[styles.input, errors.sellingPrice && styles.inputError]}
              value={formData.sellingPrice}
              onChangeText={(text) => setFormData(prev => ({ ...prev, sellingPrice: text }))}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
            {errors.sellingPrice && <Text style={styles.errorText}>{errors.sellingPrice}</Text>}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Per Meter Price</Text>
          <TextInput
            style={styles.input}
            value={formData.perMeterPrice}
            onChangeText={handlePerMeterPriceChange}
            placeholder="Auto-calculated"
            placeholderTextColor={theme.colors.text.muted}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderInventoryStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <MapPin size={18} color={theme.colors.primary} /> Inventory Information
        </Text>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Lot Number</Text>
            <TextInput
              style={styles.input}
              value={formData.lotNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lotNumber: text }))}
              placeholder="0"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
          
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Minimum Threshold</Text>
            <TextInput
              style={styles.input}
              value={formData.minimumThreshold}
              onChangeText={(text) => setFormData(prev => ({ ...prev, minimumThreshold: text }))}
              placeholder="100"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Supplier *</Text>
            {renderSearchableDropdown(
              'supplier',
              suppliers,
              formData.supplier,
              (item) => setFormData(prev => ({ ...prev, supplier: item.company })),
              'Search or select supplier'
            )}
            {errors.supplier && <Text style={styles.errorText}>{errors.supplier}</Text>}
          </View>
          
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Location *</Text>
            {renderSearchableDropdown(
              'location',
              locations,
              formData.location,
              (item) => setFormData(prev => ({ ...prev, location: item.name })),
              'Search or select location'
            )}
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Calendar size={18} color={theme.colors.primary} /> Payment Information
        </Text>
        
        <View style={styles.paymentSection}>
          <Text style={styles.label}>Payment Status</Text>
          <View style={styles.paymentStatusButtons}>
            {[
              { key: 'paid', label: 'Paid', color: '#10B981', icon: '✅' },
              { key: 'partial', label: 'Partial', color: '#F59E0B', icon: '⏳' },
              { key: 'pending', label: 'Pending', color: '#EF4444', icon: '⭕' }
            ].map((status) => (
              <TouchableOpacity
                key={status.key}
                style={[
                  styles.paymentStatusButton,
                  formData.paymentStatus === status.key && { 
                    backgroundColor: status.color + '20',
                    borderColor: status.color,
                  },
                ]}
                onPress={() => setFormData(prev => ({ ...prev, paymentStatus: status.key as any }))}
              >
                <Text style={styles.paymentStatusIcon}>{status.icon}</Text>
                <Text style={[
                  styles.paymentStatusButtonText,
                  formData.paymentStatus === status.key && { color: status.color },
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.paymentStatus === 'partial' && (
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Paid Amount</Text>
                <TextInput
                  style={styles.input}
                  value={formData.paidAmount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, paidAmount: text }))}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.text.muted}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Due Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.dueDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.colors.text.muted}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (!canAddProduct) {
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
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    flex1: {
      flex: 1,
    },
    dropdownContainer: {
      position: 'relative',
      zIndex: 99999,
    },
    searchInputContainer: {
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.backgroundTertiary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInputContainerActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    dropdownButton: {
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.backgroundTertiary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    dropdownButtonText: {
      fontSize: 16,
      flex: 1,
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
      borderWidth: 2,
      borderColor: theme.colors.primary + '30',
      borderRadius: 12,
      marginTop: 4,
      maxHeight: 200,
      zIndex: 999999,
      elevation: 999999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    dropdownItem: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '50',
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
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    ratingText: {
      fontSize: 12,
      color: '#FFD700',
      marginLeft: 4,
      fontWeight: '600',
    },
    noResultsContainer: {
      padding: 20,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: theme.colors.text.muted,
      fontStyle: 'italic',
    },
    paymentSection: {
      backgroundColor: theme.colors.backgroundSecondary,
      padding: 20,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    paymentStatusButtons: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    paymentStatusButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
    },
    paymentStatusIcon: {
      fontSize: 16,
      marginBottom: 4,
    },
    paymentStatusButtonText: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '600',
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
                  <Text style={styles.headerTitle}>✨ Add New Product</Text>
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
                    >
                      <Text style={styles.submitButtonText}>🚀 Add Product</Text>
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