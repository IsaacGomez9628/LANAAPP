import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "planned" | "recurring" | "manual";
}

interface RecentExpensesProps {
  expenses: Expense[];
}

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "recurring":
        return <Icons.Clock size={verticalScale(16)} color={colors.blue} />;
      case "planned":
        return <Icons.Calendar size={verticalScale(16)} color={colors.green} />;
      default:
        return (
          <Icons.Money size={verticalScale(16)} color={colors.neutral400} />
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "recurring":
        return colors.blue;
      case "planned":
        return colors.green;
      default:
        return colors.neutral400;
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Gastos Recientes
        </Typo>
        <Typo size={12} color={colors.neutral400}>
          {expenses.length} registros
        </Typo>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Icons.Receipt size={verticalScale(40)} color={colors.neutral600} />
          <Typo size={14} color={colors.neutral400}>
            No hay gastos registrados
          </Typo>
        </View>
      ) : (
        expenses.slice(0, 5).map((expense, index) => (
          <Animated.View
            key={expense.id}
            entering={FadeInUp.delay(index * 100).springify()}
            style={styles.expenseItem}
          >
            <View style={styles.expenseIcon}>{getTypeIcon(expense.type)}</View>
            <View style={styles.expenseInfo}>
              <Typo size={14} fontWeight="500">
                {expense.description}
              </Typo>
              <View style={styles.expenseDetails}>
                <Typo size={12} color={colors.neutral400}>
                  {expense.category}
                </Typo>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(expense.type) + "20" },
                  ]}
                >
                  <Typo size={10} color={getTypeColor(expense.type)}>
                    {expense.type === "recurring"
                      ? "Recurrente"
                      : expense.type === "planned"
                      ? "Planeado"
                      : "Manual"}
                  </Typo>
                </View>
              </View>
            </View>
            <View style={styles.expenseAmount}>
              <Typo size={16} fontWeight="600" color={colors.rose}>
                -${expense.amount.toLocaleString("es-MX")}
              </Typo>
              <Typo size={11} color={colors.neutral500}>
                {expense.date.toLocaleDateString("es-MX")}
              </Typo>
            </View>
          </Animated.View>
        ))
      )}
    </View>
  );
};

export default RecentExpenses;

const styles = StyleSheet.create({
  // Shared modal styles
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
    maxHeight: "90%",
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
  categoryScroll: {
    marginTop: spacingY._7,
  },
  categoryButton: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    marginRight: spacingX._10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
  section: {
    marginBottom: spacingY._25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginBottom: spacingY._10,
  },
  expenseIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: spacingX._5,
    paddingVertical: 2,
    borderRadius: radius._6,
  },
  expenseAmount: {
    alignItems: "flex-end",
  },
});
