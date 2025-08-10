import React, { useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { Transaction, WeekData } from "@/constants/transactions";

interface MonthlyViewProps {
  transactions: Transaction[];
  selectedMonth: Date;
  monthlyTotals: {
    income: number;
    expenses: number;
    total: number;
  };
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  transactions,
  selectedMonth,
  monthlyTotals,
}) => {
  const weeklyData = useMemo(() => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    const weeks: WeekData[] = [];

    const weekRanges = [
      { start: 1, end: 7, label: "1/8 - 7/8" },
      { start: 8, end: 14, label: "8/8 - 14/8" },
      { start: 15, end: 21, label: "15/8 - 21/8" },
      { start: 22, end: 28, label: "22/8 - 28/8" },
      { start: 29, end: 31, label: "29/8 - 31/8" },
    ];

    weekRanges.forEach((range) => {
      const weekTransactions = transactions.filter((t) => {
        const day = t.date.getDate();
        const month = t.date.getMonth();
        const year = t.date.getFullYear();
        return (
          day >= range.start &&
          day <= range.end &&
          month === currentMonth &&
          year === currentYear
        );
      });

      const income = weekTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = weekTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      weeks.push({
        weekRange: range.label,
        income,
        expense,
        total: income - expense,
      });
    });

    return weeks;
  }, [transactions, selectedMonth]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.monthlyContainer}>
        {/* Resumen del mes */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={styles.monthSummary}
        >
          <View style={styles.monthHeader}>
            <Typo size={18} fontWeight="600">
              {selectedMonth
                .toLocaleDateString("es-MX", { month: "long" })
                .charAt(0)
                .toUpperCase() +
                selectedMonth
                  .toLocaleDateString("es-MX", { month: "long" })
                  .slice(1)}
            </Typo>
            <Typo size={14} color={colors.neutral400}>
              1/8 - 31/8
            </Typo>
          </View>
          <View style={styles.monthTotals}>
            <View style={styles.totalItem}>
              <Typo size={16} color={colors.blue} fontWeight="600">
                $ {monthlyTotals.income.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.totalItem}>
              <Typo size={16} color={colors.rose} fontWeight="600">
                $ {monthlyTotals.expenses.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.totalItemLast}>
              <Typo size={12} color={colors.neutral400}>
                Total
              </Typo>
              <Typo size={16} color={colors.white} fontWeight="600">
                $ {monthlyTotals.total.toLocaleString("es-MX")}
              </Typo>
            </View>
          </View>
        </Animated.View>

        {/* Semanas del mes */}
        {weeklyData.map((week, index) => (
          <Animated.View
            key={week.weekRange}
            entering={FadeInUp.delay(index * 100).springify()}
            style={styles.weekItem}
          >
            <View style={styles.weekHeader}>
              <Typo size={14} fontWeight="500" color={colors.white}>
                {week.weekRange}
              </Typo>
            </View>
            <View style={styles.weekData}>
              <View style={styles.weekAmount}>
                <Typo size={14} color={colors.blue} fontWeight="600">
                  $ {week.income.toLocaleString("es-MX")}
                </Typo>
              </View>
              <View style={styles.weekAmount}>
                <Typo size={14} color={colors.rose} fontWeight="600">
                  $ {week.expense.toLocaleString("es-MX")}
                </Typo>
              </View>
              <View style={styles.weekTotal}>
                <Typo size={14} color={colors.neutral400} fontWeight="600">
                  $ {week.total.toLocaleString("es-MX")}
                </Typo>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

export default MonthlyView;

const styles = StyleSheet.create({
  monthlyContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  monthSummary: {
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._12,
    marginBottom: spacingY._15,
  },
  monthHeader: {
    marginBottom: spacingY._10,
  },
  monthTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalItem: {
    flex: 1,
    alignItems: "center",
  },
  totalItemLast: {
    alignItems: "center",
  },
  weekItem: {
    backgroundColor: colors.neutral800,
    marginBottom: spacingY._10,
    borderRadius: radius._10,
    overflow: "hidden",
  },
  weekHeader: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
  },
  weekData: {
    flexDirection: "row",
    padding: spacingX._15,
    justifyContent: "space-between",
  },
  weekAmount: {
    flex: 1,
    alignItems: "center",
  },
  weekTotal: {
    flex: 1,
    alignItems: "flex-end",
  },
});
