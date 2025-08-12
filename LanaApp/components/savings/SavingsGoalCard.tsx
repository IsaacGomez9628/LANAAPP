import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SavingsGoal } from "@/types";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoney: () => void;
  delay?: number;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onAddMoney,
  delay = 0,
}) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.ceil(
    (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysRemaining < 0;
  const isCloseToDeadline = daysRemaining <= 30 && daysRemaining > 0;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.rose;
      case "medium":
        return colors.yellow;
      case "low":
        return colors.green;
      default:
        return colors.neutral400;
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return colors.green;
    if (isOverdue) return colors.rose;
    if (isCloseToDeadline) return colors.yellow;
    return colors.blue;
  };

  const getStatusText = () => {
    if (isCompleted) return "¡Completada!";
    if (isOverdue) return `Vencida (${Math.abs(daysRemaining)} días)`;
    if (isCloseToDeadline) return `${daysRemaining} días restantes`;
    return `${daysRemaining} días restantes`;
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={[
        styles.card,
        !goal.isActive && styles.cardInactive,
        isCompleted && styles.cardCompleted,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.goalInfo}>
          <View
            style={[styles.colorIndicator, { backgroundColor: goal.color }]}
          />
          <View style={styles.goalText}>
            <Typo size={16} fontWeight="600">
              {goal.name}
            </Typo>
            <View style={styles.goalMeta}>
              <Typo size={12} color={colors.neutral400}>
                {goal.category}
              </Typo>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(goal.priority) + "20" },
                ]}
              >
                <Typo size={10} color={getPriorityColor(goal.priority)}>
                  {goal.priority === "high"
                    ? "Alta"
                    : goal.priority === "medium"
                    ? "Media"
                    : "Baja"}
                </Typo>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {!isCompleted && (
            <TouchableOpacity onPress={onAddMoney} style={styles.actionButton}>
              <Icons.Plus
                size={verticalScale(18)}
                color={colors.green}
                weight="bold"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Icons.PencilSimple
              size={verticalScale(18)}
              color={colors.neutral400}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Icons.Trash size={verticalScale(18)} color={colors.rose} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.goalProgress}>
        <View style={styles.amountInfo}>
          <View>
            <Typo size={12} color={colors.neutral400}>
              Progreso
            </Typo>
            <Typo size={20} fontWeight="700" color={goal.color}>
              ${goal.currentAmount.toLocaleString("es-MX")}
            </Typo>
          </View>
          <View style={styles.targetInfo}>
            <Typo size={12} color={colors.neutral400}>
              Objetivo
            </Typo>
            <Typo size={16} fontWeight="600">
              ${goal.targetAmount.toLocaleString("es-MX")}
            </Typo>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
          <Typo size={12} color={getStatusColor()} fontWeight="600">
            {progress.toFixed(1)}%
          </Typo>
        </View>

        <View style={styles.goalDetails}>
          <View style={styles.detailItem}>
            <Icons.Clock size={verticalScale(14)} color={colors.neutral400} />
            <Typo size={12} color={getStatusColor()}>
              {getStatusText()}
            </Typo>
          </View>
          {!isCompleted && remaining > 0 && (
            <View style={styles.detailItem}>
              <Icons.Target
                size={verticalScale(14)}
                color={colors.neutral400}
              />
              <Typo size={12} color={colors.neutral400}>
                Faltan ${remaining.toLocaleString("es-MX")}
              </Typo>
            </View>
          )}
          <View style={styles.detailItem}>
            <Icons.TrendUp size={verticalScale(14)} color={colors.neutral400} />
            <Typo size={12} color={colors.neutral400}>
              ${goal.monthlyTarget.toLocaleString("es-MX")}/mes
            </Typo>
          </View>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Icons.CheckCircle
              size={verticalScale(16)}
              color={colors.green}
              weight="fill"
            />
            <Typo size={12} color={colors.green} fontWeight="600">
              ¡Meta completada!
            </Typo>
          </View>
        )}
      </View>

      {!goal.isActive && (
        <View style={styles.inactiveOverlay}>
          <Typo size={12} color={colors.neutral400}>
            Meta pausada
          </Typo>
        </View>
      )}
    </Animated.View>
  );
};

export default SavingsGoalCard;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    padding: spacingX._20,
    paddingBottom: Platform.OS === "ios" ? spacingY._40 : spacingY._20,
    maxHeight: "95%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._20,
  },
  inputContainer: {
    marginBottom: spacingY._15,
  },
  input: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._12,
    color: colors.white,
    fontSize: verticalScale(14),
    marginTop: spacingY._7,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.rose,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: spacingY._5,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: spacingY._5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutral600,
  },
  card: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._15,
    marginBottom: spacingY._12,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardCompleted: {
    borderColor: colors.green,
    backgroundColor: colors.green + "10",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    flex: 1,
  },
  colorIndicator: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
  goalText: {
    flex: 1,
  },
  goalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: spacingX._7,
    paddingVertical: 2,
    borderRadius: radius._6,
  },
  actions: {
    flexDirection: "row",
    gap: spacingX._7,
  },
  actionButton: {
    padding: spacingX._5,
  },
  goalProgress: {
    gap: spacingY._12,
  },
  amountInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetInfo: {
    alignItems: "flex-end",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  progressBar: {
    flex: 1,
    height: verticalScale(8),
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius._10,
  },
  goalDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacingX._10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    flex: 1,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._7,
    backgroundColor: colors.green + "20",
    padding: spacingX._10,
    borderRadius: radius._10,
  },
  inactiveOverlay: {
    position: "absolute",
    top: spacingY._10,
    right: spacingX._15,
    backgroundColor: colors.neutral700,
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
});
