import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, G, Text as SvgText, Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";
import Typo from "./Typo";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PieData {
  value: number;
  color: string;
  label: string;
}

interface AnimatedPieChartProps {
  data: PieData[];
  size?: number;
  innerRadius?: number;
  showLabels?: boolean;
}

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({
  data,
  size = 200,
  innerRadius = 0,
  showLabels = true,
}) => {
  const animationProgress = useSharedValue(0);
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  useEffect(() => {
    animationProgress.value = withTiming(1, { duration: 1000 });
  }, [data]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius - 10}
            fill="none"
            stroke={colors.neutral700}
            strokeWidth="20"
            strokeDasharray="5 5"
          />
        </Svg>
        <View style={styles.centerText}>
          <Typo size={14} color={colors.neutral500}>
            Sin datos
          </Typo>
        </View>
      </View>
    );
  }

  let currentAngle = -90; // Start from top

  const createPath = (value: number, index: number) => {
    const percentage = value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const outerRadius = radius - 10;
    const innerR = innerRadius;

    const largeArcFlag = angle > 180 ? 1 : 0;

    const startOuterX =
      centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
    const startOuterY =
      centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
    const endOuterX =
      centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
    const endOuterY =
      centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);

    if (innerR > 0) {
      const startInnerX =
        centerX + innerR * Math.cos((startAngle * Math.PI) / 180);
      const startInnerY =
        centerY + innerR * Math.sin((startAngle * Math.PI) / 180);
      const endInnerX = centerX + innerR * Math.cos((endAngle * Math.PI) / 180);
      const endInnerY = centerY + innerR * Math.sin((endAngle * Math.PI) / 180);

      return `
        M ${startOuterX} ${startOuterY}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
        L ${endInnerX} ${endInnerY}
        A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
        Z
      `;
    } else {
      return `
        M ${centerX} ${centerY}
        L ${startOuterX} ${startOuterY}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
        Z
      `;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {data.map((item, index) => {
            const path = createPath(item.value, index);

            return (
              <AnimatedPath
                key={index}
                d={path}
                fill={item.color}
                opacity={0.9}
                strokeWidth={2}
                stroke={colors.neutral900}
              />
            );
          })}
        </G>
      </Svg>

      {innerRadius > 0 && (
        <View
          style={[
            styles.centerText,
            { width: innerRadius * 2, height: innerRadius * 2 },
          ]}
        >
          <Typo size={24} fontWeight="700" color={colors.white}>
            {total.toLocaleString("es-MX")}
          </Typo>
          <Typo size={12} color={colors.neutral400}>
            Total
          </Typo>
        </View>
      )}

      {showLabels && (
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Typo size={11} color={colors.neutral300}>
                {item.label}
              </Typo>
              <Typo size={11} color={colors.neutral400} fontWeight="600">
                ${item.value.toLocaleString("es-MX")}
              </Typo>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default AnimatedPieChart;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    position: "absolute",
    bottom: -40,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
