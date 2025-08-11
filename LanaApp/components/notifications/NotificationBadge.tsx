import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX } from "@/constants/theme";

interface NotificationBadgeProps {
  count: number;
  onPress: () => void;
  size?: "small" | "medium" | "large";
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onPress,
  size = "medium",
}) => {
  const sizeConfig = {
    small: { iconSize: 16, badgeSize: 16, fontSize: 8 },
    medium: { iconSize: 20, badgeSize: 18, fontSize: 10 },
    large: { iconSize: 24, badgeSize: 20, fontSize: 12 },
  };

  const config = sizeConfig[size];

  const animatedBadgeStyle = useAnimatedStyle(() => {
    if (count > 0) {
      return {
        transform: [
          {
            scale: withSequence(
              withSpring(1.2, { duration: 200 }),
              withSpring(1, { duration: 200 })
            ),
          },
        ],
      };
    }
    return {};
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Icons.Bell
        size={verticalScale(config.iconSize)}
        color={count > 0 ? colors.primary : colors.neutral400}
        weight={count > 0 ? "fill" : "regular"}
      />
      {count > 0 && (
        <Animated.View
          style={[
            styles.badge,
            {
              width: verticalScale(config.badgeSize),
              height: verticalScale(config.badgeSize),
              borderRadius: verticalScale(config.badgeSize / 2),
            },
            animatedBadgeStyle,
          ]}
        >
          <Typo size={config.fontSize} color={colors.white} fontWeight="600">
            {count > 99 ? "99+" : count.toString()}
          </Typo>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBadge;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.rose,
    justifyContent: "center",
    alignItems: "center",
  },
});
