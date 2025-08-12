import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "./Typo";
import { verticalScale } from "react-native-size-matters";
import * as Icons from "phosphor-react-native";

interface StatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  color?: string;
  icon?: keyof typeof Icons;
  prefix?: string;
  suffix?: string;
  style?: ViewStyle;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  previousValue,
  color = colors.primary,
  icon,
  prefix = "$",
  suffix = "",
  style,
  delay = 0,
}) => {
  const animationProgress = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      animationProgress.value = withTiming(value, { duration: 1000 });
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 500 });
    }, delay);
  }, [value, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const animatedValueStyle = useAnimatedStyle(() => {
    const displayValue = Math.round(animationProgress.value);
    return {
      transform: [
        {
          scale: interpolate(
            animationProgress.value,
            [0, value / 2, value],
            [1, 1.1, 1]
          ),
        },
      ],
    };
  });

  const percentageChange = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;

  const IconComponent = icon ? Icons[icon] : null;

  return (
    <Animated.View style={[styles.container, style, animatedStyle]}>
      <View style={styles.header}>
        {IconComponent && (
          <View
            style={[styles.iconContainer, { backgroundColor: color + "20" }]}
          >
            {React.createElement(IconComponent, {
              size: verticalScale(20),
              color: color,
              weight: "fill",
            })}
          </View>
        )}
        <Typo size={14} color={colors.neutral400}>
          {title}
        </Typo>
      </View>

      <Animated.View style={animatedValueStyle}>
        <Typo size={24} fontWeight="700" color={color}>
          {prefix}
          {value.toLocaleString("es-MX")}
          {suffix}
        </Typo>
      </Animated.View>

      {previousValue !== undefined && (
        <View style={styles.changeContainer}>
          <View style={styles.changeIndicator}>
            {percentageChange >= 0 ? (
              <Icons.TrendUp
                size={verticalScale(14)}
                color={colors.green}
                weight="fill"
              />
            ) : (
              <Icons.TrendDown
                size={verticalScale(14)}
                color={colors.rose}
                weight="fill"
              />
            )}
            <Typo
              size={12}
              color={percentageChange >= 0 ? colors.green : colors.rose}
              fontWeight="600"
            >
              {Math.abs(percentageChange).toFixed(1)}%
            </Typo>
          </View>
          <Typo size={11} color={colors.neutral500}>
            vs mes anterior
          </Typo>
        </View>
      )}
    </Animated.View>
  );
};

export default StatsCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginBottom: spacingY._10,
  },
  iconContainer: {
    width: verticalScale(32),
    height: verticalScale(32),
    borderRadius: radius._10,
    justifyContent: "center",
    alignItems: "center",
  },
  changeContainer: {
    marginTop: spacingY._10,
    gap: 4,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
