import React from 'react';
import {
    Pressable,
    StyleProp,
    ViewStyle
} from 'react-native';

/**
 * Props for the InstantPressable component
 * @property onPress - Function to call when the button is pressed
 * @property children - Content to render inside the pressable
 * @property style - Optional custom styles (can be a static object or a function that receives pressed state)
 * @property disabled - Whether the button should be disabled
 */
interface InstantPressableProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  disabled?: boolean;
}

/**
 * InstantPressable - A wrapper around React Native's Pressable with zero touch delay
 * 
 * React Native's default Pressable has a small built-in delay (~130ms) to distinguish
 * between taps and scroll gestures. This component removes all delays for instant
 * touch response, making the app feel much more responsive.
 * 
 * Usage: Use this component anywhere you would use Pressable or TouchableOpacity
 * for consistent instant feedback across the entire app.
 * 
 * Features:
 * - Zero delay on press (pressRetentionOffset: 0)
 * - Zero delay on hover (delayHoverIn/Out: 0)
 * - Zero delay on long press detection (delayLongPress: 0)
 * - Automatic 60% opacity reduction on pressed state for visual feedback
 * - Supports both static and dynamic (function) styles
 */
const InstantPressable: React.FC<InstantPressableProps> = ({
  onPress,
  children,
  style,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      // Remove all touch delays for instant response
      pressRetentionOffset={0}   // No extra touch area retention
      delayHoverIn={0}            // Instant hover detection
      delayHoverOut={0}           // Instant hover release
      delayLongPress={0}          // Instant long press (effectively disabled)
      // Apply custom styles and add pressed state visual feedback
      style={(state) => [
        // Support both static style objects and functions that return styles
        typeof style === 'function' ? style(state) : style,
        // Reduce opacity to 60% when pressed for instant visual feedback
        state.pressed && {
          opacity: 0.6,
        },
      ]}
    >
      {children}
    </Pressable>
  );
};

export default InstantPressable;