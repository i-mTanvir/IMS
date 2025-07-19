import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { Plus, Package, Users, Tag, Truck, UserPlus, LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface FloatingActionMenuProps {
  onMenuItemPress: (action: MenuAction) => void;
}

interface AnimationValues {
  overlayOpacity: Animated.Value;
  menuScale: Animated.Value;
  buttonOpacities: Animated.Value[];
  buttonScales: Animated.Value[];
  centerButtonRotation: Animated.Value;
}

interface MenuState {
  isOpen: boolean;
  isAnimating: boolean;
  activeButton: string | null;
}

export default function FloatingActionMenu({ onMenuItemPress }: FloatingActionMenuProps) {
  const { theme } = useTheme();
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    isAnimating: false,
    activeButton: null,
  });

  // Menu actions configuration
  const menuActions: MenuAction[] = [
    { id: 'products', label: 'Add Products', icon: Package, color: '#3b82f6' },
    { id: 'customer', label: 'Customer', icon: Users, color: '#10b981' },
    { id: 'category', label: 'Category', icon: Tag, color: '#f59e0b' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, color: '#ef4444' },
    { id: 'role', label: 'New Role', icon: UserPlus, color: '#8b5cf6' }
  ];

  // Animation values
  const animationValues = useRef<AnimationValues>({
    overlayOpacity: new Animated.Value(0),
    menuScale: new Animated.Value(0),
    buttonOpacities: Array(5).fill(0).map(() => new Animated.Value(0)),
    buttonScales: Array(5).fill(0).map(() => new Animated.Value(0)),
    centerButtonRotation: new Animated.Value(0),
  }).current;

  const toggleMenu = () => {
    if (menuState.isAnimating) return;

    setMenuState(prev => ({ ...prev, isAnimating: true }));

    if (menuState.isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Cleanup function to reset animation values
  const resetAnimationValues = () => {
    animationValues.overlayOpacity.setValue(0);
    animationValues.menuScale.setValue(0);
    animationValues.centerButtonRotation.setValue(0);
    animationValues.buttonOpacities.forEach(opacity => opacity.setValue(0));
    animationValues.buttonScales.forEach(scale => scale.setValue(0));
  };

  const openMenu = () => {
    setMenuState(prev => ({ ...prev, isOpen: true }));

    // Animate overlay fade in
    Animated.timing(animationValues.overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate center button rotation
    Animated.timing(animationValues.centerButtonRotation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate menu scale
    Animated.spring(animationValues.menuScale, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animate menu buttons with stagger
    const buttonAnimations = animationValues.buttonOpacities.map((opacity, index) => {
      return Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(animationValues.buttonScales[index], {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(buttonAnimations).start(() => {
      setMenuState(prev => ({ ...prev, isAnimating: false }));
    });
  };

  const closeMenu = () => {
    // Animate overlay fade out
    Animated.timing(animationValues.overlayOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Animate center button rotation back
    Animated.timing(animationValues.centerButtonRotation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Animate menu scale down
    Animated.timing(animationValues.menuScale, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Animate menu buttons out
    const buttonAnimations = animationValues.buttonOpacities.map((opacity, index) => {
      return Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animationValues.buttonScales[index], {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(buttonAnimations).start(() => {
      setMenuState(prev => ({ ...prev, isOpen: false, isAnimating: false }));
    });
  };

  const handleOverlayPress = () => {
    if (menuState.isOpen) {
      closeMenu();
    }
  };

  const handleMenuItemPress = (action: MenuAction) => {
    onMenuItemPress(action);
    closeMenu();
  };

  // Calculate half-donut position for menu buttons (perfect semicircle above plus button)
  const getHalfDonutPosition = (index: number, totalButtons: number, radius: number = 100) => {
    // Create a beautiful half-donut arc above the plus button
    // Start from left side and curve to right side in a perfect semicircle
    const startAngle = Math.PI; // Start from left (180°)
    const endAngle = 0; // End at right (0°)
    const angleStep = Math.PI / (totalButtons - 1); // Divide semicircle evenly
    const angle = startAngle - (index * angleStep);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius - 40; // Position nicely above plus button

    return { x, y };
  };

  const renderMenuButton = (action: MenuAction, index: number) => {
    const position = getHalfDonutPosition(index, menuActions.length);
    const IconComponent = action.icon;

    return (
      <Animated.View
        key={action.id}
        style={[
          styles.menuButton,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { scale: animationValues.buttonScales[index] },
            ],
            opacity: animationValues.buttonOpacities[index],
          },
        ]}
        testID={`floating-menu-button-${action.id}`}
      >
        <View style={[styles.menuButtonContainer, { backgroundColor: action.color }]}>
          <TouchableOpacity
            style={styles.menuButtonTouchable}
            onPress={() => handleMenuItemPress(action)}
            activeOpacity={0.8}
            testID={`floating-menu-button-touchable-${action.id}`}
          >
            <IconComponent size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.menuButtonLabel, { color: '#FFFFFF' }]}>{action.label}</Text>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 80, // Position perfectly above the navigation bar
      left: 0,
      right: 0,
      height: 160, // Optimized height for half-donut
      alignItems: 'center',
      justifyContent: 'flex-end',
      zIndex: 1000,
      pointerEvents: 'box-none', // Allow touches to pass through empty areas
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      width: 280, // Wider for better visual impact
      height: 150, // Taller for better semicircle
      marginLeft: -140, // Center the half-donut perfectly
      backgroundColor: 'rgba(0, 0, 0, 0.15)', // Subtle dark overlay
      borderTopLeftRadius: 140,
      borderTopRightRadius: 140,
      zIndex: 999,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    menuContainer: {
      position: 'absolute',
      bottom: 20, // Perfect positioning relative to container
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1001,
    },
    centerButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.navigation.active,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -20,
      shadowColor: theme.colors.navigation.active,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
      zIndex: 1002,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    menuButton: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuButtonContainer: {
      width: 56, // Slightly smaller for better proportion
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    menuButtonTouchable: {
      width: '100%',
      height: '100%',
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuButtonLabel: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
      maxWidth: 65,
      letterSpacing: 0.3,
    },
  });

  return (
    <>
      {menuState.isOpen && (
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: animationValues.overlayOpacity,
              },
            ]}
            testID="floating-menu-overlay"
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={handleOverlayPress}
              activeOpacity={1}
              testID="floating-menu-overlay-touchable"
            />
          </Animated.View>

          <View style={styles.menuContainer} testID="floating-menu-items-container">
            {menuActions.map((action, index) => renderMenuButton(action, index))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.centerButton}
        onPress={toggleMenu}
        activeOpacity={0.7}
        testID="floating-menu-center-button"
      >
        <Animated.View
          style={{
            transform: [{
              rotate: animationValues.centerButtonRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg'],
              }),
            }],
          }}
        >
          <Plus
            size={24}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}