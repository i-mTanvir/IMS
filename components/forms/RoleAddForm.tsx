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
  Image,
} from 'react-native';
import {
  X,
  ChevronDown,
  Camera,
  Upload,
  User,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { FormService, type UserFormData as FormServiceUserData } from '@/lib/services/formService';

const { height: screenHeight } = Dimensions.get('window');

interface RoleFormData {
  profileImage: string | null;
  userName: string;
  email: string;
  mobileNumber: string;
  role: 'Admin' | 'Sales Manager' | 'Investor' | '';
  password: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [formData, setFormData] = useState<RoleFormData>({
    profileImage: null,
    userName: '',
    email: '',
    mobileNumber: '',
    role: '',
    password: '',
    locations: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManageRoles = hasPermission('settings', 'userManagement');

  const roleOptions = ['Admin', 'Sales Manager', 'Investor'];
  const locationOptions = ['Warehouse 1', 'Warehouse 2', 'Showroom 1', 'Showroom 2'];

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  // Generate random password
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    try {
      // For React Native, we'll use a more functional approach
      if (Platform.OS === 'web') {
        // Web clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(formData.password);
          showToastMessage('Password copied to clipboard!');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = formData.password;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
          showToastMessage('Password copied to clipboard!');
        }
      } else {
        // For React Native mobile, you would use @react-native-clipboard/clipboard
        // import Clipboard from '@react-native-clipboard/clipboard';
        // await Clipboard.setString(formData.password);
        showToastMessage('Password copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      showToastMessage('Failed to copy password');
    }
  };

  // Handle image picker
  const handleImagePicker = () => {
    if (Platform.OS === 'web') {
      // Web file input approach
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          // Check file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            Alert.alert('Error', 'File size must be less than 5MB');
            return;
          }
          
          // Check file type
          if (!file.type.startsWith('image/')) {
            Alert.alert('Error', 'Please select a valid image file');
            return;
          }

          const reader = new FileReader();
          reader.onload = (e: any) => {
            const imageUri = e.target.result;
            
            // Create an image element to get dimensions for cropping
            const img = new window.Image();
            img.onload = () => {
              // Create canvas for 1:1 cropping
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate crop dimensions (1:1 ratio)
              const size = Math.min(img.width, img.height);
              const offsetX = (img.width - size) / 2;
              const offsetY = (img.height - size) / 2;
              
              // Set canvas size (resize to 300x300 for optimization)
              canvas.width = 300;
              canvas.height = 300;
              
              // Draw cropped and resized image
              ctx?.drawImage(img, offsetX, offsetY, size, size, 0, 0, 300, 300);
              
              // Convert to base64 with compression
              const croppedImageUri = canvas.toDataURL('image/jpeg', 0.8);
              setFormData(prev => ({ ...prev, profileImage: croppedImageUri }));
            };
            img.src = imageUri;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Mobile approach - show options
      Alert.alert('Select Profile Picture', 'Choose an option', [
        { 
          text: 'Camera', 
          onPress: () => {
            // For React Native mobile, you would use react-native-image-picker
            // import {launchCamera} from 'react-native-image-picker';
            // const options = {
            //   mediaType: 'photo',
            //   includeBase64: true,
            //   maxHeight: 300,
            //   maxWidth: 300,
            //   quality: 0.8,
            // };
            // launchCamera(options, (response) => {
            //   if (response.assets && response.assets[0]) {
            //     setFormData(prev => ({ ...prev, profileImage: response.assets[0].uri }));
            //   }
            // });
            console.log('Camera selected');
            // Mock setting an image for demo
            setFormData(prev => ({ ...prev, profileImage: 'data:image/jpeg;base64,mock-image-data' }));
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            // For React Native mobile, you would use react-native-image-picker
            // import {launchImageLibrary} from 'react-native-image-picker';
            // const options = {
            //   mediaType: 'photo',
            //   includeBase64: true,
            //   maxHeight: 300,
            //   maxWidth: 300,
            //   quality: 0.8,
            // };
            // launchImageLibrary(options, (response) => {
            //   if (response.assets && response.assets[0]) {
            //     setFormData(prev => ({ ...prev, profileImage: response.assets[0].uri }));
            //   }
            // });
            console.log('Gallery selected');
            // Mock setting an image for demo
            setFormData(prev => ({ ...prev, profileImage: 'data:image/jpeg;base64,mock-image-data' }));
          }
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

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
          profileImage: null,
          userName: '',
          email: '',
          mobileNumber: '',
          role: '',
          password: '',
          locations: [],
        });
      }
      setErrors({});
      setShowRoleDropdown(false);
      setShowPassword(false);
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

  const handleSubmit = async () => {
    if (!canManageRoles) {
      Alert.alert('Permission Denied', 'You do not have permission to manage roles.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Prepare user data for Supabase
      const userData: FormServiceUserData = {
        name: formData.userName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role.toLowerCase().replace(' ', '_') as 'super_admin' | 'admin' | 'sales_manager' | 'investor',
        assigned_location_id: formData.locations.length > 0 ? parseInt(formData.locations[0]) : undefined,
        phone: formData.phone?.trim() || undefined,
      };

      // Get current user from auth context
      const { user } = useAuth();
      if (!user?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Create user using FormService
      const result = await FormService.createUser(userData, user.id);

      if (result.success && result.data) {
        Alert.alert(
          'Success',
          `User "${result.data.name}" has been created successfully!`,
          [{ text: 'OK', onPress: () => { onSubmit(result.data); onClose(); } }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('User creation error:', error);
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleClose = () => {
    setFormData({
      profileImage: null,
      userName: '',
      email: '',
      mobileNumber: '',
      role: '',
      password: '',
      locations: [],
    });
    setErrors({});
    setShowRoleDropdown(false);
    setShowPassword(false);
    onClose();
  };

  const handleRoleSelect = (role: 'Admin' | 'Sales Manager' | 'Investor') => {
    setFormData(prev => ({ ...prev, role, locations: [] }));
    setShowRoleDropdown(false);
  };

  // Generate password when email or mobile is filled
  useEffect(() => {
    if ((formData.email.trim() || formData.mobileNumber.trim()) && !formData.password) {
      const newPassword = generatePassword();
      setFormData(prev => ({ ...prev, password: newPassword }));
    }
  }, [formData.email, formData.mobileNumber]);

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
    // Profile Image Upload Styles
    imageUploadContainer: {
      height: 120,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#3B82F608',
      marginBottom: 8,
    },
    imageUploadContent: {
      alignItems: 'center',
    },
    imageUploadIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    imageUploadText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    imageUploadSubtext: {
      fontSize: 11,
      marginBottom: 10,
      textAlign: 'center',
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 2,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    uploadButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    profileImageContainer: {
      alignItems: 'center',
    },
    imagePreviewWrapper: {
      position: 'relative',
      marginBottom: 8,
    },
    profileImagePreview: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeImageButton: {
      position: 'absolute',
      top: -5,
      right: -5,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    imageSelectedText: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
    },
    // Password Field Styles
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    passwordInput: {
      flex: 1,
      borderWidth: 2,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'monospace',
    },
    passwordButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    passwordHint: {
      fontSize: 11,
      marginTop: 6,
      fontStyle: 'italic',
    },
    // Toast Styles
    toastContainer: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      zIndex: 99999,
      elevation: 1000,
    },
    toast: {
      backgroundColor: '#10B981',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
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
                  contentContainerStyle={{ paddingBottom: 100 }}
                  keyboardShouldPersistTaps="handled"
                  bounces={false}
                >
                  {/* Profile Picture Upload */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                      Profile Picture
                    </Text>
                    <TouchableOpacity
                      style={[styles.imageUploadContainer, { borderColor: theme.colors.primary + '40' }]}
                      onPress={handleImagePicker}
                    >
                      <View style={styles.imageUploadContent}>
                        {formData.profileImage ? (
                          <View style={styles.profileImageContainer}>
                            <View style={styles.imagePreviewWrapper}>
                              {formData.profileImage.startsWith('data:') || formData.profileImage.startsWith('http') ? (
                                <Image 
                                  source={{ uri: formData.profileImage }} 
                                  style={styles.profileImagePreview}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View style={[styles.profileImagePreview, { backgroundColor: theme.colors.primary + '20' }]}>
                                  <User size={40} color={theme.colors.primary} />
                                </View>
                              )}
                              <TouchableOpacity
                                style={[styles.removeImageButton, { backgroundColor: theme.colors.status.error }]}
                                onPress={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                              >
                                <Trash2 size={16} color="#FFFFFF" />
                              </TouchableOpacity>
                            </View>
                            <Text style={[styles.imageSelectedText, { color: theme.colors.primary }]}>
                              Tap to change image
                            </Text>
                          </View>
                        ) : (
                          <>
                            <View style={[styles.imageUploadIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                              <Camera size={32} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.imageUploadText, { color: theme.colors.text.primary }]}>
                              Add profile picture
                            </Text>
                            <Text style={[styles.imageUploadSubtext, { color: theme.colors.text.muted }]}>
                              PNG, JPG • 1:1 ratio • Max 5MB
                            </Text>
                            <View style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}>
                              <Upload size={16} color="#FFFFFF" />
                              <Text style={styles.uploadButtonText}>Choose Photo</Text>
                            </View>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

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

                  {/* Auto-generated Password - Show when email or mobile is filled */}
                  {(formData.email.trim() || formData.mobileNumber.trim()) && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: theme.colors.text.primary }]}>
                        Auto-generated Password
                      </Text>
                      <View style={styles.passwordContainer}>
                        <TextInput
                          style={[styles.passwordInput, {
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.backgroundTertiary,
                            color: theme.colors.text.primary
                          }]}
                          value={formData.password}
                          secureTextEntry={!showPassword}
                          editable={false}
                          selectTextOnFocus={true}
                        />
                        <TouchableOpacity
                          style={[styles.passwordButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={20} color={theme.colors.text.muted} />
                          ) : (
                            <Eye size={20} color={theme.colors.text.muted} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.passwordButton, { backgroundColor: theme.colors.primary }]}
                          onPress={copyPassword}
                        >
                          <Copy size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.passwordHint, { color: theme.colors.text.muted }]}>
                        Password automatically generated when email or mobile is entered
                      </Text>
                    </View>
                  )}

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

              {/* Toast Message */}
              {showToast && (
                <Animated.View 
                  style={[
                    styles.toastContainer,
                    { opacity: toastOpacity }
                  ]}
                >
                  <View style={styles.toast}>
                    <Check size={18} color="#FFFFFF" />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                  </View>
                </Animated.View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}