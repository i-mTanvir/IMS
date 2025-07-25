import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Eye,
  Save,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { UserService, CreateUserData } from '@/lib/services/UserService';
import { LocationService, Location } from '@/lib/services/LocationService';

interface AddUserFormProps {
  visible: boolean;
  onClose: () => void;
  onUserAdded: (user: any) => void;
  currentUserId: string;
}

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'sales_manager' | 'investor';
  assigned_locations: string[];
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  assigned_locations?: string;
}

const ROLES = [
  {
    id: 'admin' as const,
    label: 'Admin',
    description: 'Can manage products, sales, and view reports. Limited to assigned locations.',
    icon: Shield,
  },
  {
    id: 'sales_manager' as const,
    label: 'Sales Manager',
    description: 'Can manage sales and customers. Limited to one location.',
    icon: User,
  },
  {
    id: 'investor' as const,
    label: 'Investor',
    description: 'Read-only access to dashboard and reports.',
    icon: Eye,
  },
];

export default function AddUserForm({ visible, onClose, onUserAdded, currentUserId }: AddUserFormProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    role: 'sales_manager',
    assigned_locations: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load locations when component mounts
  useEffect(() => {
    if (visible) {
      loadLocations();
    }
  }, [visible]);

  const loadLocations = async () => {
    try {
      const locationData = await LocationService.getAllLocations();
      setLocations(locationData);
    } catch (error) {
      console.error('Failed to load locations:', error);
      Alert.alert('Error', 'Failed to load locations');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password will be set to default "Admin123!" - no validation needed

    // Location validation
    if (formData.role === 'sales_manager' && formData.assigned_locations.length !== 1) {
      newErrors.assigned_locations = 'Sales Manager must be assigned to exactly one location';
    } else if (formData.role === 'admin' && formData.assigned_locations.length === 0) {
      newErrors.assigned_locations = 'Admin must be assigned to at least one location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData: CreateUserData = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        assigned_locations: formData.assigned_locations,
      };

      const newUser = await UserService.createUser(userData, currentUserId);
      
      Alert.alert(
        'Success',
        `User ${newUser.full_name} has been created successfully!\n\nDefault password: Admin123!\nPlease ask the user to change their password after first login.`,
        [{ text: 'OK', onPress: () => {
          onUserAdded(newUser);
          handleClose();
        }}]
      );
    } catch (error: any) {
      console.error('Failed to create user:', error);
      Alert.alert('Error', error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'sales_manager',
      assigned_locations: [],
    });
    setErrors({});
    onClose();
  };

  const toggleLocationSelection = (locationId: string) => {
    setFormData(prev => {
      const currentLocations = prev.assigned_locations;
      
      if (prev.role === 'sales_manager') {
        // Sales manager can only have one location
        return { ...prev, assigned_locations: [locationId] };
      } else if (prev.role === 'admin') {
        // Admin can have multiple locations
        const isSelected = currentLocations.includes(locationId);
        return {
          ...prev,
          assigned_locations: isSelected
            ? currentLocations.filter(id => id !== locationId)
            : [...currentLocations, locationId]
        };
      } else {
        // Investor doesn't need locations
        return { ...prev, assigned_locations: [] };
      }
    });
  };

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 500,
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollContainer: {
      maxHeight: 400,
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.input,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputWrapperError: {
      borderColor: theme.colors.status.error,
    },
    inputIcon: {
      marginRight: 12,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    errorText: {
      fontSize: 12,
      color: theme.colors.status.error,
      marginTop: 4,
    },
    passwordInfoContainer: {
      backgroundColor: theme.colors.status?.info ? theme.colors.status.info + '10' : theme.colors.primary + '10',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.status?.info ? theme.colors.status.info + '30' : theme.colors.primary + '30',
    },
    passwordInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    passwordInfoText: {
      fontSize: 14,
      color: theme.colors.text.primary,
      marginLeft: 8,
    },
    passwordInfoBold: {
      fontWeight: 'bold',
      color: theme.colors.status?.info || theme.colors.primary,
    },
    passwordInfoSubtext: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginLeft: 24,
    },
    roleContainer: {
      marginBottom: 16,
    },
    roleOptions: {
      gap: 12,
    },
    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    roleOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    roleIcon: {
      marginRight: 12,
    },
    roleInfo: {
      flex: 1,
    },
    roleLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    roleDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    locationContainer: {
      marginBottom: 24,
    },
    locationOptions: {
      gap: 8,
    },
    locationOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    locationOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    locationInfo: {
      flex: 1,
      marginLeft: 12,
    },
    locationName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    locationDetails: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text.secondary,
    },
    saveButtonText: {
      color: theme.colors.text.inverse,
    },
    disabledButton: {
      opacity: 0.6,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modal}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New User</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputWrapper, errors.full_name && styles.inputWrapperError]}>
                <User size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter full name"
                  placeholderTextColor={theme.colors.text.muted}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                  editable={!loading}
                />
              </View>
              {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                <Mail size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter email address"
                  placeholderTextColor={theme.colors.text.muted}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={[styles.inputWrapper, errors.phone && styles.inputWrapperError]}>
                <Phone size={20} color={theme.colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.colors.text.muted}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Password Info */}
            <View style={styles.passwordInfoContainer}>
              <View style={styles.passwordInfo}>
                <Shield size={16} color={theme.colors.status?.info || theme.colors.primary} />
                <Text style={styles.passwordInfoText}>
                  Default password will be set to: <Text style={styles.passwordInfoBold}>Admin123!</Text>
                </Text>
              </View>
              <Text style={styles.passwordInfoSubtext}>
                User will be asked to change password on first login
              </Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <Text style={styles.label}>Role *</Text>
              <View style={styles.roleOptions}>
                {ROLES.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = formData.role === role.id;
                  
                  return (
                    <TouchableOpacity
                      key={role.id}
                      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                      onPress={() => setFormData(prev => ({ 
                        ...prev, 
                        role: role.id,
                        assigned_locations: role.id === 'investor' ? [] : prev.assigned_locations
                      }))}
                      disabled={loading}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? theme.colors.primary : theme.colors.text.secondary}
                        style={styles.roleIcon}
                      />
                      <View style={styles.roleInfo}>
                        <Text style={styles.roleLabel}>{role.label}</Text>
                        <Text style={styles.roleDescription}>{role.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            {/* Location Assignment */}
            {formData.role !== 'investor' && (
              <View style={styles.locationContainer}>
                <Text style={styles.label}>
                  Assigned Locations * 
                  {formData.role === 'sales_manager' && ' (Select one)'}
                  {formData.role === 'admin' && ' (Select one or more)'}
                </Text>
                <View style={styles.locationOptions}>
                  {locations.map((location) => {
                    const isSelected = formData.assigned_locations.includes(location.id);
                    
                    return (
                      <TouchableOpacity
                        key={location.id}
                        style={[styles.locationOption, isSelected && styles.locationOptionSelected]}
                        onPress={() => toggleLocationSelection(location.id)}
                        disabled={loading}
                      >
                        <MapPin
                          size={16}
                          color={isSelected ? theme.colors.primary : theme.colors.text.secondary}
                        />
                        <View style={styles.locationInfo}>
                          <Text style={styles.locationName}>{location.name}</Text>
                          <Text style={styles.locationDetails}>
                            {location.location_type.charAt(0).toUpperCase() + location.location_type.slice(1)}
                            {location.city && ` • ${location.city}`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.assigned_locations && <Text style={styles.errorText}>{errors.assigned_locations}</Text>}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.text.inverse} />
              ) : (
                <Save size={20} color={theme.colors.text.inverse} />
              )}
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {loading ? 'Creating...' : 'Create User'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}