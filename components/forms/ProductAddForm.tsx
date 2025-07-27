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
import { productService, CreateProductRequest, Category, Supplier, Location } from '@/lib/database/product-service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ProductFormData {
  productName: string;
  productCode: string;
  categoryId: string;
  description: string;
  purchaseAmount: string;
  purchasePrice: string;
  sellingPrice: string;
  perMeterPrice: string;
  lotNumber: string;
  supplierId: string;
  locationId: string;
  minimumThreshold: string;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paidAmount: string;
  dueDate: string;
  productImage: string | null;
  initialQuantity: string;
  purchaseDate: string;
  color: string;
  material: string;
  width: string;
  weight: string;
  unitOfMeasure: 'meter' | 'piece' | 'roll' | 'yard' | 'kilogram';
}

interface ProductAddFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest & { initial_quantity: number; purchase_date: string; lot_number?: string }) => void;
  existingProduct?: any;
}

// Icon mapping for categories
const categoryIcons: Record<string, string> = {
  'Sofa Fabrics': '🛋️',
  'Curtain Fabrics': '🪟',
  'Artificial Leather': '👜',
  'Garments': '👕',
  'Upholstery Fabrics': '🪑',
  'Denim Fabrics': '👖',
  'Cotton Fabrics': '🌿',
  'Silk Fabrics': '🎀',
  'Wool Fabrics': '🐑',
  'Linen Fabrics': '🌾',
  'Polyester Fabrics': '🧵',
  'Velvet Fabrics': '✨',
  'Canvas Fabrics': '🎨',
  'Mesh Fabrics': '🕸️',
  'Lace Fabrics': '🌸',
};

// Icon mapping for locations
const locationIcons: Record<string, string> = {
  'warehouse': '🏭',
  'showroom': '🏪',
  'storage': '📦',
  'store': '🏬',
};

export default function ProductAddForm({ visible, onClose, onSubmit, existingProduct }: ProductAddFormProps) {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  const slideAnim = useRef(new Animated.Value(-screenHeight)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productCode: '',
    categoryId: '',
    description: '',
    purchaseAmount: '',
    purchasePrice: '',
    sellingPrice: '',
    perMeterPrice: '',
    lotNumber: '1',
    supplierId: '',
    locationId: '',
    minimumThreshold: '100',
    paymentStatus: 'pending',
    paidAmount: '',
    dueDate: '',
    productImage: null,
    initialQuantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    color: '',
    material: '',
    width: '',
    weight: '',
    unitOfMeasure: 'meter',
  });

  // Database data
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDropdowns, setShowDropdowns] = useState({
    category: false,
    supplier: false,
    location: false,
    paymentStatus: false,
    unitOfMeasure: false,
  });

  const [searchTexts, setSearchTexts] = useState({
    category: '',
    supplier: '',
    location: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const canAddProduct = hasPermission('products', 'add');

  // Initial form state for resetting
  const initialFormState: ProductFormData = {
    productName: '',
    productCode: '',
    categoryId: '',
    description: '',
    purchaseAmount: '',
    purchasePrice: '',
    sellingPrice: '',
    perMeterPrice: '',
    lotNumber: '1',
    supplierId: '',
    locationId: '',
    minimumThreshold: '100',
    paymentStatus: 'pending',
    paidAmount: '',
    dueDate: '',
    productImage: null,
    initialQuantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    color: '',
    material: '',
    width: '',
    weight: '',
    unitOfMeasure: 'meter',
  };

  // Form steps for better UX
  const steps = [
    { title: 'Basic Info', icon: Package },
    { title: 'Pricing', icon: DollarSign },
    { title: 'Inventory', icon: MapPin },
    { title: 'Payment', icon: Calendar },
  ];

  // Unit of measure options
  const unitOfMeasureOptions = [
    { id: 'meter', name: 'Meter' },
    { id: 'piece', name: 'Piece' },
    { id: 'roll', name: 'Roll' },
    { id: 'yard', name: 'Yard' },
    { id: 'kilogram', name: 'Kilogram' },
  ];

  const getUnitOfMeasureName = (id: string) => {
    return unitOfMeasureOptions.find(unit => unit.id === id)?.name || 'Meter';
  };

  // Load database data
  useEffect(() => {
    if (visible) {
      loadDatabaseData();
    }
  }, [visible]);

  const loadDatabaseData = async () => {
    try {
      setLoadingData(true);
      const [categoriesData, suppliersData, locationsData] = await Promise.all([
        productService.getCategories(),
        productService.getSuppliers(),
        productService.getLocations(),
      ]);

      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading form data:', error);
      Alert.alert('Error', 'Failed to load form data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      if (!existingProduct) {
        setFormData({
          productName: '',
          productCode: '',
          categoryId: '',
          description: '',
          purchaseAmount: '',
          purchasePrice: '',
          sellingPrice: '',
          perMeterPrice: '',
          lotNumber: '1',
          supplierId: '',
          locationId: '',
          minimumThreshold: '100',
          paymentStatus: 'pending',
          paidAmount: '',
          dueDate: '',
          productImage: null,
          initialQuantity: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          color: '',
          material: '',
          width: '',
          weight: '',
          unitOfMeasure: 'meter',
        });
      }
      setErrors({});
      setCurrentStep(0);
      setShowDropdowns({
        category: false,
        supplier: false,
        location: false,
        paymentStatus: false,
        unitOfMeasure: false,
      });
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
      unitOfMeasure: false,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }

    if (!formData.initialQuantity || parseFloat(formData.initialQuantity) <= 0) {
      newErrors.initialQuantity = 'Valid initial quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('=== PRODUCT FORM SUBMISSION STARTED ===');
    console.log('Form data:', formData);

    if (!canAddProduct) {
      console.log('Permission denied - cannot add product');
      Alert.alert('Permission Denied', 'You do not have permission to add products.');
      return;
    }

    console.log('Validating form...');
    if (!validateForm()) {
      console.log('Form validation failed');
      console.log('Validation errors:', errors);
      return;
    }
    console.log('Form validation passed');

    setIsLoading(true);
    try {
      const submitData: CreateProductRequest & { initial_quantity: number; purchase_date: string } = {
        name: formData.productName,
        product_code: formData.productCode || undefined,
        category_id: formData.categoryId || undefined,
        description: formData.description || undefined,
        product_image: formData.productImage || undefined,
        purchase_amount: formData.purchaseAmount ? parseFloat(formData.purchaseAmount) : undefined,
        purchase_price: parseFloat(formData.purchasePrice),
        selling_price: parseFloat(formData.sellingPrice),
        per_meter_price: formData.perMeterPrice ? parseFloat(formData.perMeterPrice) : undefined,
        supplier_id: formData.supplierId || undefined,
        location_id: formData.locationId || undefined,
        minimum_threshold: formData.minimumThreshold ? parseFloat(formData.minimumThreshold) : undefined,
        payment_status: formData.paymentStatus,
        paid_amount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
        due_date: formData.dueDate || undefined,
        unit_of_measure: formData.unitOfMeasure,
        width: formData.width ? parseFloat(formData.width) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color || undefined,
        material: formData.material || undefined,
        notes: undefined,
        lot_number: formData.lotNumber,
        initial_quantity: parseFloat(formData.initialQuantity),
        purchase_date: formData.purchaseDate,
      };

      console.log('=== SUBMITTING TO DATABASE ===');
      console.log('Submit data:', submitData);
      console.log('onSubmit function exists:', !!onSubmit);
      console.log('onSubmit function type:', typeof onSubmit);

      // Call the onSubmit prop which will handle the database operation
      if (onSubmit) {
        console.log('Calling onSubmit handler...');
        try {
          await onSubmit(submitData);
          console.log('onSubmit completed successfully');
        } catch (onSubmitError) {
          console.error('ERROR in onSubmit handler:', onSubmitError);
          throw onSubmitError; // Re-throw to be caught by outer catch
        }
      } else {
        console.error('No submit handler provided');
        throw new Error('No submit handler provided');
      }

      console.log('=== SUBMISSION SUCCESSFUL ===');
      // Reset form and close modal
      setFormData(initialFormState);
      setErrors({});
      setCurrentStep(0);
      onClose();
    } catch (error) {
      console.error('Error in form submission:', error);

      // Type-safe error handling
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          cause: error.cause
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Error',
        `Failed to submit form: ${errorMessage}\n\nPlease check your internet connection and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
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
    try {
      const searchText = searchTexts[type] || '';

      // Debug logging
      if (type === 'supplier') {
        console.log('Supplier dropdown - items:', items);
        console.log('Supplier dropdown - value:', value);
        console.log('Supplier dropdown - searchText:', searchText);
      }

      const filteredItems = (items || []).filter(item => {
        if (!item || typeof item !== 'object') return false;
        const itemName = item?.name;
        if (!itemName || typeof itemName !== 'string') return false;
        return itemName.toLowerCase().includes(searchText.toLowerCase());
      });

      return (
        <View style={styles.dropdownContainer}>
          <View style={[
            styles.searchInputContainer,
            { borderColor: errors[type] ? theme.colors.status.error : theme.colors.primary + '30' },
            showDropdowns[type] && styles.searchInputContainerActive,
          ]}>
            <TextInput
              style={styles.searchInput}
              value={showDropdowns[type] ? searchText : String(value || '')}
              onChangeText={(text) => {
                setSearchTexts(prev => ({ ...prev, [type]: text }));
                if (!showDropdowns[type]) {
                  const updatedDropdowns = {
                    category: false,
                    supplier: false,
                    location: false,
                    paymentStatus: false,
                    unitOfMeasure: false,
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
                  unitOfMeasure: false,
                };
                setShowDropdowns({
                  ...updatedDropdowns,
                  [type]: true
                });
              }}
              placeholder={String(value || placeholder || 'Search...')}
              placeholderTextColor={theme.colors.text.muted}
            />
            <TouchableOpacity
              style={styles.dropdownIconContainer}
              onPress={() => {
                const updatedDropdowns = {
                  category: false,
                  supplier: false,
                  location: false,
                  paymentStatus: false,
                  unitOfMeasure: false,
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
                {filteredItems.length > 0 ? filteredItems.map((item, index) => {
                  if (!item || typeof item !== 'object') {
                    console.warn('Invalid item in dropdown:', item);
                    return null;
                  }

                  return (
                    <TouchableOpacity
                      key={String(item?.id || index)}
                      style={[
                        styles.dropdownItem,
                        index === filteredItems.length - 1 && { borderBottomWidth: 0 }
                      ]}
                      onPress={() => {
                        console.log('Dropdown item clicked:', type, item);
                        if (item && typeof onSelect === 'function') {
                          onSelect(item);
                          setSearchTexts(prev => ({ ...prev, [type]: '' }));
                          setShowDropdowns(prev => ({ ...prev, [type]: false }));
                        }
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        {(type === 'category' && item?.name && categoryIcons[item.name]) && (
                          <Text style={styles.dropdownItemIcon}>{String(categoryIcons[item.name] || '')}</Text>
                        )}
                        {(type === 'location' && item?.location_type && locationIcons[item.location_type]) && (
                          <Text style={styles.dropdownItemIcon}>{String(locationIcons[item.location_type] || '')}</Text>
                        )}
                        <View style={styles.dropdownItemTextContainer}>
                          <Text style={styles.dropdownItemText}>
                            {String(item?.name || 'Unknown')}
                          </Text>
                          {item?.rating && typeof item.rating !== 'undefined' && (
                            <View style={styles.ratingContainer}>
                              <Star size={12} color="#FFD700" fill="#FFD700" />
                              <Text style={styles.ratingText}>{String(item.rating)}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No results found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.error('Error in renderSearchableDropdown:', error);
      return (
        <View style={styles.dropdownContainer}>
          <Text style={styles.errorText}>Error loading dropdown</Text>
        </View>
      );
    }
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
            unitOfMeasure: false,
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
          {String(value || placeholder || 'Select option')}
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
                  {item?.icon && <Text style={styles.dropdownItemIcon}>{String(item.icon)}</Text>}
                  <View style={styles.dropdownItemTextContainer}>
                    <Text style={styles.dropdownItemText}>
                      {String(typeof item === 'string' ? item : (item?.name || 'Unknown'))}
                    </Text>
                    {item?.rating && (
                      <View style={styles.ratingContainer}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{String(item.rating || '')}</Text>
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
        <View style={styles.sectionTitleContainer}>
          <Sparkles size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Product Image</Text>
        </View>
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
        <View style={styles.sectionTitleContainer}>
          <Package size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>

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
              String(categories.find(c => c.id === formData.categoryId)?.name || ''),
              (item) => setFormData(prev => ({ ...prev, categoryId: item.id })),
              'Search or select category'
            )}
            {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
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
        <View style={styles.sectionTitleContainer}>
          <DollarSign size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Pricing Information</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
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

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Initial Quantity *</Text>
            <TextInput
              style={[styles.input, errors.initialQuantity && styles.inputError]}
              value={formData.initialQuantity}
              onChangeText={(text) => setFormData(prev => ({ ...prev, initialQuantity: text }))}
              placeholder="0"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
            {errors.initialQuantity && <Text style={styles.errorText}>{errors.initialQuantity}</Text>}
          </View>
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

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
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

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Unit of Measure</Text>
            {renderEnhancedDropdown(
              'unitOfMeasure',
              unitOfMeasureOptions,
              getUnitOfMeasureName(formData.unitOfMeasure),
              (item) => setFormData(prev => ({ ...prev, unitOfMeasure: item.id as any })),
              'Select unit'
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderInventoryStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MapPin size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Inventory Information</Text>
        </View>

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
            {/* Simple safe supplier dropdown */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  { borderColor: errors.supplierId ? theme.colors.status.error : theme.colors.primary + '30' },
                  showDropdowns.supplier && styles.dropdownButtonActive,
                ]}
                onPress={() => {
                  setShowDropdowns(prev => ({
                    category: false,
                    supplier: !prev.supplier,
                    location: false,
                    paymentStatus: false,
                    unitOfMeasure: false,
                  }));
                }}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  { color: formData.supplierId ? theme.colors.text.primary : theme.colors.text.muted }
                ]}>
                  {formData.supplierId
                    ? (suppliers?.find(s => s?.id === formData.supplierId)?.name || 'Unknown Supplier')
                    : 'Search or select supplier'
                  }
                </Text>
                <ChevronDown
                  size={20}
                  color={theme.colors.text.muted}
                  style={[
                    styles.dropdownIcon,
                    showDropdowns.supplier && { transform: [{ rotate: '180deg' }] }
                  ]}
                />
              </TouchableOpacity>

              {showDropdowns.supplier && (
                <View style={[styles.dropdownList, { backgroundColor: theme.colors.background }]}>
                  <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                    {(suppliers || []).map((supplier, index) => (
                      <TouchableOpacity
                        key={supplier?.id || index}
                        style={[
                          styles.dropdownItem,
                          index === suppliers.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, supplierId: supplier?.id || '' }));
                          setShowDropdowns(prev => ({ ...prev, supplier: false }));
                        }}
                      >
                        <View style={styles.dropdownItemContent}>
                          <View style={styles.dropdownItemTextContainer}>
                            <Text style={styles.dropdownItemText}>
                              {supplier?.name || 'Unknown Supplier'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            {errors.supplierId && <Text style={styles.errorText}>{errors.supplierId}</Text>}
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={[styles.label, styles.requiredLabel]}>Location *</Text>
            {renderSearchableDropdown(
              'location',
              locations,
              String(locations.find(l => l.id === formData.locationId)?.name || ''),
              (item) => setFormData(prev => ({ ...prev, locationId: item.id })),
              'Search or select location'
            )}
            {errors.locationId && <Text style={styles.errorText}>{errors.locationId}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              value={formData.purchaseDate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, purchaseDate: text }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Lot Number</Text>
            <TextInput
              style={styles.input}
              value={formData.lotNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lotNumber: text }))}
              placeholder="1"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={formData.color}
              onChangeText={(text) => setFormData(prev => ({ ...prev, color: text }))}
              placeholder="Product color"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Material</Text>
            <TextInput
              style={styles.input}
              value={formData.material}
              onChangeText={(text) => setFormData(prev => ({ ...prev, material: text }))}
              placeholder="Material type"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Width (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.width}
              onChangeText={(text) => setFormData(prev => ({ ...prev, width: text }))}
              placeholder="0"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
              placeholder="0"
              placeholderTextColor={theme.colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Calendar size={18} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Payment Information</Text>
        </View>

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
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
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
    dropdownIconContainer: {
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
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
                      disabled={isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? '⏳ Adding...' : '🚀 Add Product'}
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