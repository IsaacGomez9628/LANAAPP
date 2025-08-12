import React, { useMemo } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
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
  onTransactionPress?: (transaction: Transaction) => void;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({
  transactions,
  selectedMonth,
  monthlyTotals,
  onTransactionPress,
}) => {
  const { weeklyData, recentTransactions } = useMemo(() => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    const weeks: WeekData[] = [];

    const weekRanges = [
      { start: 1, end: 7, label: "1-7" },
      { start: 8, end: 14, label: "8-14" },
      { start: 15, end: 21, label: "15-21" },
      { start: 22, end: 28, label: "22-28" },
      { start: 29, end: 31, label: "29-31" },
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
        count: weekTransactions.length,
        transactions: weekTransactions,
      });
    });

    // Obtener las transacciones más recientes del mes
    const monthTransactions = transactions
      .filter((t) => {
        const tMonth = t.date.getMonth();
        const tYear = t.date.getFullYear();
        return tMonth === currentMonth && tYear === currentYear;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return { weeklyData: weeks, recentTransactions: monthTransactions };
  }, [transactions, selectedMonth]);

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "expense" ? "-" : "+";
    const color = type === "expense" ? colors.rose : colors.green;
    return { text: `${prefix}$${amount.toLocaleString("es-MX")}`, color };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
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
                .toLocaleDateString("es-MX", { month: "long", year: "numeric" })
                .charAt(0)
                .toUpperCase() +
                selectedMonth
                  .toLocaleDateString("es-MX", {
                    month: "long",
                    year: "numeric",
                  })
                  .slice(1)}
            </Typo>
            <View style={styles.monthStats}>
              <Icons.TrendUp size={verticalScale(16)} color={colors.blue} />
              <Typo size={12} color={colors.neutral400}>
                {recentTransactions.length} transacciones
              </Typo>
            </View>
          </View>
          <View style={styles.monthTotals}>
            <View style={styles.totalItem}>
              <Typo size={12} color={colors.green}>
                Ingresos
              </Typo>
              <Typo size={16} color={colors.green} fontWeight="600">
                $ {monthlyTotals.income.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.totalItem}>
              <Typo size={12} color={colors.rose}>
                Gastos
              </Typo>
              <Typo size={16} color={colors.rose} fontWeight="600">
                $ {monthlyTotals.expenses.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.totalItemLast}>
              <Typo size={12} color={colors.neutral400}>
                Balance
              </Typo>
              <Typo
                size={16}
                color={monthlyTotals.total >= 0 ? colors.blue : colors.orange}
                fontWeight="600"
              >
                $ {monthlyTotals.total.toLocaleString("es-MX")}
              </Typo>
            </View>
          </View>
        </Animated.View>

        {/* Semanas del mes */}
        <View style={styles.weeksSection}>
          <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
            Análisis Semanal
          </Typo>
          {weeklyData.map((week, index) => (
            <Animated.View
              key={week.weekRange}
              entering={FadeInUp.delay(index * 100).springify()}
              style={styles.weekItem}
            >
              <View style={styles.weekHeader}>
                <Typo size={14} fontWeight="500" color={colors.white}>
                  Días {week.weekRange}
                </Typo>
                <View style={styles.weekCount}>
                  <Icons.Hash
                    size={verticalScale(12)}
                    color={colors.neutral400}
                  />
                  <Typo size={12} color={colors.neutral400}>
                    {week.count}
                  </Typo>
                </View>
              </View>
              <View style={styles.weekData}>
                <View style={styles.weekAmount}>
                  <Typo size={14} color={colors.green} fontWeight="600">
                    $ {week.income.toLocaleString("es-MX")}
                  </Typo>
                </View>
                <View style={styles.weekAmount}>
                  <Typo size={14} color={colors.rose} fontWeight="600">
                    $ {week.expense.toLocaleString("es-MX")}
                  </Typo>
                </View>
                <View style={styles.weekTotal}>
                  <Typo
                    size={14}
                    color={week.total >= 0 ? colors.blue : colors.orange}
                    fontWeight="600"
                  >
                    $ {week.total.toLocaleString("es-MX")}
                  </Typo>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Transacciones recientes del mes */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Typo size={16} fontWeight="600">
              Transacciones Recientes
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              Últimas {recentTransactions.length}
            </Typo>
          </View>

          {recentTransactions.map((transaction, index) => {
            const amount = formatAmount(transaction.amount, transaction.type);
            return (
              <Animated.View
                key={transaction.id}
                entering={FadeInUp.delay((index + 5) * 50).springify()}
              >
                <TouchableOpacity
                  style={styles.transactionItem}
                  onPress={() => onTransactionPress?.(transaction)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionMain}>
                      <View style={styles.transactionInfo}>
                        <Typo size={14} fontWeight="500">
                          {transaction.description}
                        </Typo>
                        <View style={styles.transactionMeta}>
                          <Typo size={12} color={colors.neutral400}>
                            {transaction.category}
                          </Typo>
                          <View style={styles.metaSeparator} />
                          <Typo size={12} color={colors.neutral400}>
                            {transaction.date.toLocaleDateString("es-MX")}
                          </Typo>
                        </View>
                      </View>
                      <View style={styles.transactionAmount}>
                        <Typo size={16} fontWeight="600" color={amount.color}>
                          {amount.text}
                        </Typo>
                        <View
                          style={[
                            styles.importanceDot,
                            {
                              backgroundColor: getImportanceColor(
                                transaction.importance
                              ),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  monthStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
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
  weeksSection: {
    marginBottom: spacingY._20,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
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
  recentSection: {
    marginBottom: spacingY._20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  transactionItem: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._10,
    marginBottom: spacingY._7,
    overflow: "hidden",
  },
  transactionContent: {
    padding: spacingX._15,
  },
  transactionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
    gap: spacingY._5,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral500,
    marginHorizontal: spacingX._7,
  },
  transactionAmount: {
    alignItems: "flex-end",
    gap: spacingY._5,
  },
  importanceDot: {
    width: verticalScale(6),
    height: verticalScale(6),
    borderRadius: verticalScale(3),
  },
});
