# Design Document

## Overview

The floating action menu transforms the existing plus button in the bottom navigation into an interactive radial menu. When activated, it displays a semi-transparent overlay with 5 action buttons arranged in a circular pattern around the original plus button position. The design emphasizes smooth animations and intuitive user interaction patterns.

## Architecture

### Component Structure
```
FloatingActionMenu (New Component)
├── Overlay (Semi-transparent background)
├── RadialMenuContainer
│   ├── MenuButton (Add Products)
│   ├── MenuButton (Customer) 
│   ├── MenuButton (Category)
│   ├── MenuButton (Suppliers)
│   └── MenuButton (New Role)
└── CenterButton (Plus button)
```

### Integration Points
- **BottomNavBar Component**: Modified to include FloatingActionMenu instead of direct navigation
- **Theme System**: Leverages existing ThemeContext for consistent styling
- **Animation System**: Uses React Native Animated API for smooth transitions

## Components and Interfaces

### FloatingActionMenu Component
```typescript
interface FloatingActionMenuProps {
  onMenuItemPress: (action: MenuAction) => void;
  theme: Theme;
}

interface MenuAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  color: string;
}
```

### Menu Button Configuration
```typescript
const menuActions: MenuAction[] = [
  { id: 'products', label: 'Add Products', icon: Package, color: '#3b82f6' },
  { id: 'customer', label: 'Customer', icon: Users, color: '#10b981' },
  { id: 'category', label: 'Category', icon: Tag, color: '#f59e0b' },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, color: '#ef4444' },
  { id: 'role', label: 'New Role', icon: UserPlus, color: '#8b5cf6' }
];
```

### Animation States
- **Closed State**: Menu hidden, only plus button visible
- **Opening State**: Overlay fades in, menu buttons scale and fade in with stagger
- **Open State**: Full menu visible and interactive
- **Closing State**: Menu buttons fade out, overlay fades out

## Data Models

### Animation Values
```typescript
interface AnimationValues {
  overlayOpacity: Animated.Value;
  menuScale: Animated.Value;
  buttonOpacities: Animated.Value[];
  buttonScales: Animated.Value[];
  centerButtonRotation: Animated.Value;
}
```

### Menu State
```typescript
interface MenuState {
  isOpen: boolean;
  isAnimating: boolean;
  activeButton: string | null;
}
```

## Error Handling

### Animation Failures
- Graceful fallback to instant show/hide if animations fail
- Error logging for debugging animation issues
- Timeout protection for stuck animations

### Touch Event Handling
- Prevent multiple rapid taps during animations
- Handle edge cases for touch events outside menu area
- Ensure proper cleanup of event listeners

## Testing Strategy

### Unit Tests
- Component rendering with different states
- Animation value calculations
- Menu action callbacks
- Theme integration

### Integration Tests
- Bottom navigation integration
- Theme switching behavior
- Touch interaction flows
- Animation sequences

### Visual Tests
- Menu positioning accuracy
- Animation smoothness
- Color consistency with theme
- Responsive behavior on different screen sizes

## Implementation Details

### Positioning Strategy
The radial menu uses polar coordinates to position buttons in a circle:
```typescript
const angle = (index * 2 * Math.PI) / totalButtons;
const radius = 80;
const x = Math.cos(angle) * radius;
const y = Math.sin(angle) * radius;
```

### Animation Timing
- **Overlay fade**: 200ms ease-out
- **Menu buttons**: 300ms spring animation with 50ms stagger
- **Center button rotation**: 200ms ease-in-out (45° rotation)
- **Close animation**: 150ms ease-in for faster dismissal

### Z-Index Management
- Overlay: z-index 1000
- Menu buttons: z-index 1001
- Center button: z-index 1002

### Accessibility
- Screen reader support for menu options
- Proper focus management
- High contrast mode compatibility
- Touch target size compliance (minimum 44px)

### Performance Considerations
- Use `useNativeDriver: true` for transform animations
- Minimize re-renders during animations
- Lazy initialization of animation values
- Proper cleanup of animation listeners