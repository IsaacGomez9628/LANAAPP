import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { NotificationItem } from "@/services/NotificationService";

const { width: screenWidth } = Dimensions.get("window");

interface InAppNotificationProps {
  notification: NotificationItem | null;
  onDismiss: () => void;
  onAction?: () => void;
}

const InAppNotification: React.FC<InAppNotificationProps> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (notification) {
      // Mostrar notificación
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto-dismiss después de 4 segundos
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const hideNotification = () => {
    translateY.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(-100, { duration: 200 }, () => {
        runOnJS(onDismiss)();
      })
    );
    opacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "budget_warning":
        return <Icons.Warning size={verticalScale(20)} color={colors.yellow} />;
      case "goal_reminder":
        return <Icons.Target size={verticalScale(20)} color={colors.blue} />;
      case "payment_due":
        return <Icons.Clock size={verticalScale(20)} color={colors.rose} />;
      case "achievement":
        return <Icons.Trophy size={verticalScale(20)} color={colors.green} />;
      case "tip":
        return (
          <Icons.Lightbulb size={verticalScale(20)} color={colors.purple} />
        );
      case "expense_alert":
        return (
          <Icons.TrendDown size={verticalScale(20)} color={colors.orange} />
        );
      default:
        return (
          <Icons.Bell size={verticalScale(20)} color={colors.neutral400} />
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.rose;
      case "medium":
        return colors.yellow;
      case "low":
        return colors.blue;
      default:
        return colors.neutral700;
    }
  };

  if (!notification) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View
        style={[
          styles.notification,
          { borderLeftColor: getPriorityColor(notification.priority) },
        ]}
      >
        <TouchableOpacity
          onPress={hideNotification}
          style={styles.dismissButton}
        >
          <Icons.X size={verticalScale(16)} color={colors.neutral400} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            {getNotificationIcon(notification.type)}
            <Typo
              size={14}
              fontWeight="600"
              color={colors.white}
              style={{ flex: 1 }}
            >
              {notification.title}
            </Typo>
          </View>

          <Typo size={12} color={colors.neutral300} style={{ marginTop: 4 }}>
            {notification.message}
          </Typo>

          {notification.actionText && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                onAction?.();
                hideNotification();
              }}
            >
              <Typo size={12} color={colors.primary} fontWeight="500">
                {notification.actionText}
              </Typo>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default InAppNotification;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: spacingX._15,
    right: spacingX._15,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dismissButton: {
    position: "absolute",
    top: spacingY._10,
    right: spacingX._10,
    zIndex: 1,
  },
  content: {
    padding: spacingX._15,
    paddingRight: spacingX._35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  actionButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: radius._6,
    marginTop: spacingY._7,
  },
});
