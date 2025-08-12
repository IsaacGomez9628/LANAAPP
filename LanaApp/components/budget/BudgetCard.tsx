import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { createConfig } from "expo-router/build/fork/getStateFromPath-forks";

interface Budget {
  category: string;
  amount: number;
  spent: number;
  period: "daily" | "weekly" | "monthly";
  color: string;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
  delay?: number;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  delay = 0,
}) => {
  const percentage = (budget.spent / budget.amount) * 100;
  const isOverBudget = budget.spent > budget.amount;
  const remaining = budget.amount - budget.spent;

  const getStatusColor = () => {
    if (isOverBudget) return colors.rose;
    if (percentage > 80) return colors.yellow;
    return colors.green;
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryInfo}>
          <View
            style={[styles.colorIndicator, { backgroundColor: budget.color }]}
          />
          <View>
            <Typo size={16} fontWeight="600">
              {budget.category}
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              Período:{" "}
              {budget.period === "monthly"
                ? "Mensual"
                : budget.period === "weekly"
                ? "Semanal"
                : "Diario"}
            </Typo>
          </View>
        </View>
        <View style={styles.actions}>
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

      <View style={styles.budgetInfo}>
        <View style={styles.budgetAmounts}>
          <View style={styles.amountItem}>
            <Typo size={12} color={colors.neutral400}>
              Presupuesto
            </Typo>
            <Typo size={16} fontWeight="600">
              ${budget.amount.toLocaleString("es-MX")}
            </Typo>
          </View>
          <View style={styles.amountItem}>
            <Typo size={12} color={colors.neutral400}>
              Gastado
            </Typo>
            <Typo size={16} fontWeight="600" color={getStatusColor()}>
              ${budget.spent.toLocaleString("es-MX")}
            </Typo>
          </View>
          <View style={styles.amountItem}>
            <Typo size={12} color={colors.neutral400}>
              {isOverBudget ? "Excedido" : "Disponible"}
            </Typo>
            <Typo
              size={16}
              fontWeight="600"
              color={isOverBudget ? colors.rose : colors.green}
            >
              ${Math.abs(remaining).toLocaleString("es-MX")}
            </Typo>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
          <Typo size={12} color={getStatusColor()} fontWeight="600">
            {percentage.toFixed(0)}%
          </Typo>
        </View>

        {isOverBudget && (
          <View style={styles.warningContainer}>
            <Icons.Warning size={verticalScale(16)} color={colors.rose} />
            <Typo size={12} color={colors.rose}>
              Presupuesto excedido por $
              {(budget.spent - budget.amount).toLocaleString("es-MX")}
            </Typo>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default BudgetCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._10,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  colorIndicator: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
  actions: {
    flexDirection: "row",
    gap: spacingX._10,
  },
  actionButton: {
    padding: spacingX._5,
  },
  budgetInfo: {
    gap: spacingY._12,
  },
  budgetAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountItem: {
    alignItems: "center",
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    backgroundColor: colors.rose + "20",
    padding: spacingX._10,
    borderRadius: radius._6,
  },

  // CategoryChart styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
  },
});
