import React from 'react';
import {
    Pressable,
    StyleProp,
    ViewStyle
} from 'react-native';

interface InstantPressableProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  disabled?: boolean;
}

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
      pressRetentionOffset={0}
      delayHoverIn={0}
      delayHoverOut={0}
      delayLongPress={0}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
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