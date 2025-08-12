import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { colors } from "@/constants/theme";
import { verticalScale } from "react-native-size-matters";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface FABProps extends TouchableOpacityProps {
  style?: ViewStyle;
  backgroundColor?: string;
  size?: number;
  children: React.ReactNode;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const FAB: React.FC<FABProps> = ({
  style,
  backgroundColor = colors.primary,
  size = 56,
  children,
  onPress,
  ...props
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  const handlePress = (event: any) => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 4, stiffness: 200 })
    );
    rotation.value = withSequence(
      withTiming(45, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    if (onPress) {
      onPress(event);
    }
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      onPress={handlePress}
      style={[
        styles.fab,
        {
          width: verticalScale(size),
          height: verticalScale(size),
          borderRadius: verticalScale(size / 2),
          backgroundColor,
        },
        style,
        animatedStyle,
      ]}
      activeOpacity={0.8}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
};

export default FAB;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
