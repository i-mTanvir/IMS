import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Alert,
    RefreshControl,
    Switch,
    Image,
    Modal,
} from 'react-native';
import {
    Settings,
    Users,
    User,
    Shield,
    Palette,
    Globe,
    Moon,
    Sun,
    Monitor,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Camera,
    Save,
    X,
    Bell,
    Lock,
    Smartphone,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    Languages,
    Clock,
    Download,
    Upload,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SharedLayout from '@/components/SharedLayout';

// Types
interface RoleManagement {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
    profilePicture?: string;
    isActive: boolean;
    permissions: string[];
    createdAt: Date;
    createdBy: string;
    lastUpdated: Date;
}

interface AccountSettings {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    profilePicture?: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    language: 'en' | 'bn' | 'hi';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    currency: 'BDT' | 'USD' | 'EUR';
}

interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    colorPalette: 'default' | 'blue' | 'green' | 'purple';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    sidebarCollapsed: boolean;
}

const ROLE_LABELS = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    sales_manager: 'Sales Manager',
    investor: 'Investor',
};

// Mock data
const mockRoleManagement: RoleManagement[] = [
    {
        id: '1',
        userId: '1',
        fullName: 'Super Administrator',
        email: 'admin@gmail.com',
        phone: '+880-1234-567890',
        role: 'super_admin',
        profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        isActive: true,
        permissions: ['all'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'system',
        lastUpdated: new Date(),
    },
    {
        id: '2',
        userId: '2',
        fullName: 'System Admin',
        email: 'admin@serranotex.com',
        phone: '+880-1234-567891',
        role: 'admin',
        isActive: true,
        permissions: ['manage_products', 'manage_sales', 'view_reports'],
        createdAt: new Date('2024-01-15'),
        createdBy: 'Super Administrator',
        lastUpdated: new Date(),
    },
    {
        id: '3',
        userId: '3',
        fullName: 'Sales Manager',
        email: 'sales@serranotex.com',
        phone: '+880-1234-567892',
        role: 'sales_manager',
        isActive: true,
        permissions: ['view_reports'],
        createdAt: new Date('2024-02-01'),
        createdBy: 'Super Administrator',
        lastUpdated: new Date(),
    },
];

const COLOR_PALETTES = [
    {
        id: 'default',
        name: 'Default',
        primary: '#3B82F6',
        secondary: '#64748B',
        accent: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    },
    {
        id: 'blue',
        name: 'Ocean Blue',
        primary: '#0EA5E9',
        secondary: '#0284C7',
        accent: '#06B6D4',
        success: '#059669',
        warning: '#D97706',
        error: '#DC2626',
    },
    {
        id: 'green',
        name: 'Forest Green',
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981',
        success: '#065F46',
        warning: '#92400E',
        error: '#B91C1C',
    },
    {
        id: 'purple',
        name: 'Royal Purple',
        primary: '#7C3AED',
        secondary: '#6D28D9',
        accent: '#8B5CF6',
        success: '#047857',
        warning: '#B45309',
        error: '#C2410C',
    },
];

export default function SettingsPage() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, hasPermission } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'role-management' | 'account' | 'appearance' | 'system'>('account');
    const [roles, setRoles] = useState<RoleManagement[]>(mockRoleManagement);
    const [showAddRoleModal, setShowAddRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleManagement | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [accountSettings, setAccountSettings] = useState<AccountSettings>({
        id: '1',
        userId: user?.email || '1', // Using email as unique identifier since there's no id
        fullName: user?.name || 'User',
        email: user?.email || 'user@serranotex.com',
        phone: '+880-1234-567890',
        profilePicture: undefined, // UserSession doesn't have avatar property
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        currency: 'BDT',
    });

    const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
        theme: isDark ? 'dark' : 'light',
        colorPalette: 'default',
        fontSize: 'medium',
        compactMode: false,
        sidebarCollapsed: false,
    });

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleSaveAccount = () => {
        Alert.alert('Success', 'Account settings saved successfully!');
    };

    const handleSaveAppearance = () => {
        Alert.alert('Success', 'Appearance settings saved successfully!');
    };

    const handleAddUser = () => {
        Alert.alert('Add User', 'Add new user functionality');
        setShowAddRoleModal(false);
    };

    const handleEditRole = (role: RoleManagement) => {
        Alert.alert('Edit Role', `Edit ${role.fullName}`);
    };

    const handleDeleteRole = (role: RoleManagement) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${role.fullName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        setRoles(prev => prev.filter(r => r.id !== role.id));
                    }
                },
            ]
        );
    };

    const renderTabs = () => (
        <View style={[styles.tabContainer, { borderBottomColor: theme.colors.border }]}>
            {user?.role === 'super_admin' && (
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'role-management' && { borderBottomColor: theme.colors.primary }]}
                    onPress={() => setActiveTab('role-management')}
                >
                    <Users size={16} color={activeTab === 'role-management' ? theme.colors.primary : theme.colors.text.secondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'role-management' ? theme.colors.primary : theme.colors.text.secondary }
                    ]}>
                        Users
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.tab, activeTab === 'account' && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab('account')}
            >
                <User size={16} color={activeTab === 'account' ? theme.colors.primary : theme.colors.text.secondary} />
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'account' ? theme.colors.primary : theme.colors.text.secondary }
                ]}>
                    Account
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === 'appearance' && { borderBottomColor: theme.colors.primary }]}
                onPress={() => setActiveTab('appearance')}
            >
                <Palette size={16} color={activeTab === 'appearance' ? theme.colors.primary : theme.colors.text.secondary} />
                <Text style={[
                    styles.tabText,
                    { color: activeTab === 'appearance' ? theme.colors.primary : theme.colors.text.secondary }
                ]}>
                    Theme
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderRoleManagement = () => {
        if (!hasPermission('canManageUsers') && user?.role !== 'super_admin') {
            return (
                <View style={styles.accessDeniedContainer}>
                    <Shield size={64} color={theme.colors.status.error} />
                    <Text style={[styles.accessDeniedTitle, { color: theme.colors.text.primary }]}>
                        Access Denied
                    </Text>
                    <Text style={[styles.accessDeniedText, { color: theme.colors.text.secondary }]}>
                        Only Super Administrators can manage user roles.
                    </Text>
                </View>
            );
        }

        return (
            <View>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Role Management
                    </Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => setShowAddRoleModal(true)}
                    >
                        <Plus size={20} color={theme.colors.text.inverse} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rolesContainer}>
                    {roles.map((role) => (
                        <View key={role.id} style={[styles.roleCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <View style={styles.roleHeader}>
                                <View style={styles.roleInfo}>
                                    <View style={styles.avatarContainer}>
                                        {role.profilePicture ? (
                                            <Image source={{ uri: role.profilePicture }} style={styles.avatar} />
                                        ) : (
                                            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                                                <Text style={[styles.avatarText, { color: theme.colors.text.inverse }]}>
                                                    {role.fullName.charAt(0)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.roleDetails}>
                                        <Text style={[styles.roleName, { color: theme.colors.text.primary }]}>
                                            {role.fullName}
                                        </Text>
                                        <Text style={[styles.roleEmail, { color: theme.colors.text.secondary }]}>
                                            {role.email}
                                        </Text>
                                        <Text style={[styles.rolePhone, { color: theme.colors.text.muted }]}>
                                            {role.phone}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.roleBadges}>
                                    <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                        <Text style={[styles.roleBadgeText, { color: theme.colors.primary }]}>
                                            {ROLE_LABELS[role.role]}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: role.isActive ? theme.colors.status.success + '20' : theme.colors.status.error + '20' }
                                    ]}>
                                        <Text style={[
                                            styles.statusBadgeText,
                                            { color: role.isActive ? theme.colors.status.success : theme.colors.status.error }
                                        ]}>
                                            {role.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.roleActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.colors.status.warning + '20' }]}
                                    onPress={() => handleEditRole(role)}
                                >
                                    <Edit size={16} color={theme.colors.status.warning} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.colors.status.error + '20' }]}
                                    onPress={() => handleDeleteRole(role)}
                                >
                                    <Trash2 size={16} color={theme.colors.status.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderAccountSettings = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Account Settings
            </Text>

            {/* Profile Section */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    Profile Information
                </Text>

                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {accountSettings.profilePicture ? (
                            <Image source={{ uri: accountSettings.profilePicture }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImageFallback, { backgroundColor: theme.colors.primary }]}>
                                <Text style={[styles.profileImageText, { color: theme.colors.text.inverse }]}>
                                    {accountSettings.fullName.charAt(0)}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}>
                            <Camera size={16} color={theme.colors.text.inverse} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
                            {accountSettings.fullName}
                        </Text>
                        <Text style={[styles.profileRole, { color: theme.colors.text.secondary }]}>
                            {user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : 'User'}
                        </Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Full Name</Text>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                        value={accountSettings.fullName}
                        onChangeText={(text) => setAccountSettings(prev => ({ ...prev, fullName: text }))}
                        placeholderTextColor={theme.colors.text.muted}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Email Address</Text>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                        value={accountSettings.email}
                        onChangeText={(text) => setAccountSettings(prev => ({ ...prev, email: text }))}
                        keyboardType="email-address"
                        placeholderTextColor={theme.colors.text.muted}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Phone Number</Text>
                    <TextInput
                        style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                        value={accountSettings.phone}
                        onChangeText={(text) => setAccountSettings(prev => ({ ...prev, phone: text }))}
                        keyboardType="phone-pad"
                        placeholderTextColor={theme.colors.text.muted}
                    />
                </View>
            </View>

            {/* Security Section */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                        Security Settings
                    </Text>
                    <TouchableOpacity
                        style={[styles.changePasswordButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                        onPress={() => setShowPasswordFields(!showPasswordFields)}
                    >
                        <Text style={[styles.changePasswordText, { color: theme.colors.primary }]}>
                            {showPasswordFields ? 'Cancel' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showPasswordFields && (
                    <View style={styles.passwordSection}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Current Password</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                value={accountSettings.currentPassword}
                                onChangeText={(text) => setAccountSettings(prev => ({ ...prev, currentPassword: text }))}
                                secureTextEntry
                                placeholder="Enter current password"
                                placeholderTextColor={theme.colors.text.muted}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>New Password</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                value={accountSettings.newPassword}
                                onChangeText={(text) => setAccountSettings(prev => ({ ...prev, newPassword: text }))}
                                secureTextEntry
                                placeholder="Enter new password"
                                placeholderTextColor={theme.colors.text.muted}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Confirm New Password</Text>
                            <TextInput
                                style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                value={accountSettings.confirmPassword}
                                onChangeText={(text) => setAccountSettings(prev => ({ ...prev, confirmPassword: text }))}
                                secureTextEntry
                                placeholder="Confirm new password"
                                placeholderTextColor={theme.colors.text.muted}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Two-Factor Authentication
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Add an extra layer of security to your account
                        </Text>
                    </View>
                    <Switch
                        value={accountSettings.twoFactorEnabled}
                        onValueChange={(value) => setAccountSettings(prev => ({ ...prev, twoFactorEnabled: value }))}
                        trackColor={{ false: theme.colors.backgroundSecondary, true: theme.colors.primary + '40' }}
                        thumbColor={accountSettings.twoFactorEnabled ? theme.colors.primary : theme.colors.text.muted}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Email Notifications
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Receive notifications via email
                        </Text>
                    </View>
                    <Switch
                        value={accountSettings.emailNotifications}
                        onValueChange={(value) => setAccountSettings(prev => ({ ...prev, emailNotifications: value }))}
                        trackColor={{ false: theme.colors.backgroundSecondary, true: theme.colors.primary + '40' }}
                        thumbColor={accountSettings.emailNotifications ? theme.colors.primary : theme.colors.text.muted}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            SMS Notifications
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Receive notifications via SMS
                        </Text>
                    </View>
                    <Switch
                        value={accountSettings.smsNotifications}
                        onValueChange={(value) => setAccountSettings(prev => ({ ...prev, smsNotifications: value }))}
                        trackColor={{ false: theme.colors.backgroundSecondary, true: theme.colors.primary + '40' }}
                        thumbColor={accountSettings.smsNotifications ? theme.colors.primary : theme.colors.text.muted}
                    />
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveAccount}
            >
                <Save size={20} color={theme.colors.text.inverse} />
                <Text style={[styles.saveButtonText, { color: theme.colors.text.inverse }]}>
                    Save Changes
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderAppearanceSettings = () => (
        <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Appearance Settings
            </Text>

            {/* Theme Mode */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    Theme Mode
                </Text>

                <View style={styles.themeOptions}>
                    {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Monitor },
                    ].map((themeOption) => {
                        const IconComponent = themeOption.icon;
                        const isSelected = appearanceSettings.theme === themeOption.id;

                        return (
                            <TouchableOpacity
                                key={themeOption.id}
                                style={[
                                    styles.themeOption,
                                    {
                                        backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.backgroundSecondary,
                                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                    }
                                ]}
                                onPress={() => {
                                    setAppearanceSettings(prev => ({ ...prev, theme: themeOption.id as any }));
                                    if (themeOption.id !== 'system') {
                                        toggleTheme();
                                    }
                                }}
                            >
                                <IconComponent
                                    size={24}
                                    color={isSelected ? theme.colors.primary : theme.colors.text.secondary}
                                />
                                <Text style={[
                                    styles.themeOptionText,
                                    { color: isSelected ? theme.colors.primary : theme.colors.text.primary }
                                ]}>
                                    {themeOption.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Color Palette */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    Color Palette
                </Text>

                <View style={styles.colorPalettes}>
                    {COLOR_PALETTES.map((palette) => {
                        const isSelected = appearanceSettings.colorPalette === palette.id;

                        return (
                            <TouchableOpacity
                                key={palette.id}
                                style={[
                                    styles.colorPalette,
                                    {
                                        backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.backgroundSecondary,
                                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                                    }
                                ]}
                                onPress={() => setAppearanceSettings(prev => ({ ...prev, colorPalette: palette.id as any }))}
                            >
                                <View style={styles.colorPreview}>
                                    {[palette.primary, palette.secondary, palette.accent, palette.success, palette.warning, palette.error].map((color, index) => (
                                        <View
                                            key={index}
                                            style={[styles.colorDot, { backgroundColor: color }]}
                                        />
                                    ))}
                                </View>
                                <Text style={[
                                    styles.colorPaletteName,
                                    { color: isSelected ? theme.colors.primary : theme.colors.text.primary }
                                ]}>
                                    {palette.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Language & Region */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    Language & Region
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Language
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Choose your preferred language
                        </Text>
                    </View>
                    <View style={[styles.dropdown, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                        <Text style={[styles.dropdownText, { color: theme.colors.text.primary }]}>
                            {accountSettings.language === 'en' ? 'English' :
                                accountSettings.language === 'bn' ? 'বাংলা' : 'हिन्दी'}
                        </Text>
                    </View>
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Date Format
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            How dates are displayed
                        </Text>
                    </View>
                    <View style={[styles.dropdown, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                        <Text style={[styles.dropdownText, { color: theme.colors.text.primary }]}>
                            {accountSettings.dateFormat}
                        </Text>
                    </View>
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Currency
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Default currency for transactions
                        </Text>
                    </View>
                    <View style={[styles.dropdown, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                        <Text style={[styles.dropdownText, { color: theme.colors.text.primary }]}>
                            {accountSettings.currency}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Display Settings */}
            <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    Display Settings
                </Text>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Compact Mode
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Reduce spacing for more content
                        </Text>
                    </View>
                    <Switch
                        value={appearanceSettings.compactMode}
                        onValueChange={(value) => setAppearanceSettings(prev => ({ ...prev, compactMode: value }))}
                        trackColor={{ false: theme.colors.backgroundSecondary, true: theme.colors.primary + '40' }}
                        thumbColor={appearanceSettings.compactMode ? theme.colors.primary : theme.colors.text.muted}
                    />
                </View>

                <View style={styles.settingRow}>
                    <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                            Font Size
                        </Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                            Adjust text size for better readability
                        </Text>
                    </View>
                    <View style={[styles.dropdown, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                        <Text style={[styles.dropdownText, { color: theme.colors.text.primary }]}>
                            {appearanceSettings.fontSize.charAt(0).toUpperCase() + appearanceSettings.fontSize.slice(1)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveAppearance}
            >
                <Save size={20} color={theme.colors.text.inverse} />
                <Text style={[styles.saveButtonText, { color: theme.colors.text.inverse }]}>
                    Save Preferences
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'role-management':
                return renderRoleManagement();
            case 'account':
                return renderAccountSettings();
            case 'appearance':
                return renderAppearanceSettings();
            default:
                return renderAccountSettings();
        }
    };

    return (
        <SharedLayout title="Settings">
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Tabs */}
                {renderTabs()}

                {/* Tab Content */}
                {renderTabContent()}
            </ScrollView>

            {/* Add Role Modal */}
            <Modal
                visible={showAddRoleModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAddRoleModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                                Add New User
                            </Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowAddRoleModal(false)}
                            >
                                <X size={24} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Full Name</Text>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                    placeholder="Enter full name"
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Email Address</Text>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Phone Number</Text>
                                <TextInput
                                    style={[styles.textInput, { backgroundColor: theme.colors.input, borderColor: theme.colors.border, color: theme.colors.text.primary }]}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>Role</Text>
                                <View style={[styles.dropdown, { backgroundColor: theme.colors.input, borderColor: theme.colors.border }]}>
                                    <Text style={[styles.dropdownText, { color: theme.colors.text.primary }]}>
                                        Select Role
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.backgroundSecondary }]}
                                onPress={() => setShowAddRoleModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleAddUser}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.colors.text.inverse }]}>
                                    Add User
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SharedLayout>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accessDeniedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
        gap: 16,
    },
    accessDeniedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    accessDeniedText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    rolesContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    roleCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    roleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarFallback: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    roleDetails: {
        flex: 1,
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    roleEmail: {
        fontSize: 14,
        marginBottom: 2,
    },
    rolePhone: {
        fontSize: 12,
    },
    roleBadges: {
        alignItems: 'flex-end',
        gap: 6,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    roleActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    changePasswordButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    changePasswordText: {
        fontSize: 12,
        fontWeight: '500',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileImageFallback: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
    },
    textInput: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 14,
    },
    passwordSection: {
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    dropdown: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
    },
    dropdownText: {
        fontSize: 12,
        textAlign: 'center',
    },
    themeOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    themeOptionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    colorPalettes: {
        gap: 12,
    },
    colorPalette: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    colorPreview: {
        flexDirection: 'row',
        gap: 4,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    colorPaletteName: {
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginVertical: 24,
        paddingVertical: 14,
        borderRadius: 12,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        margin: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalBody: {
        marginBottom: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {},
    confirmButton: {},
    modalButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
});