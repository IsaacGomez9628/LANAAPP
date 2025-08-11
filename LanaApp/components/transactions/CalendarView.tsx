import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingY, spacingX } from "@/constants/theme";
import { Transaction } from "@/constants/transactions";

interface CalendarViewProps {
  transactions: Transaction[];
  selectedMonth: Date;
  onTransactionPress?: (transaction: Transaction) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  selectedMonth,
  onTransactionPress,
}) => {
  const calendarData = useMemo(() => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayTransactions = transactions.filter((t) => {
        const tDate = t.date.getDate();
        const tMonth = t.date.getMonth();
        const tYear = t.date.getFullYear();
        return tDate === i && tMonth === currentMonth && tYear === currentYear;
      });

      const dayIncome = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        day: i,
        income: dayIncome,
        expense: dayExpense,
        transactions: dayTransactions,
        hasHighImportance: dayTransactions.some((t) => t.importance === "high"),
        count: dayTransactions.length,
      });
    }

    return { days, firstDayOfMonth, daysInMonth };
  }, [transactions, selectedMonth]);

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const { days, firstDayOfMonth } = calendarData;

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({
      isEmpty: true,
      day: 0,
      income: 0,
      expense: 0,
      transactions: [],
      hasHighImportance: false,
      count: 0,
    });
  }
  days.forEach((day) => calendarDays.push({ ...day, isEmpty: false }));

  const handleDayPress = (dayData: any) => {
    if (dayData.isEmpty || dayData.transactions.length === 0) return;

    // Si hay solo una transacción, abrirla directamente
    if (dayData.transactions.length === 1 && onTransactionPress) {
      onTransactionPress(dayData.transactions[0]);
    } else if (dayData.transactions.length > 1) {
      // Aquí podrías mostrar un modal con la lista de transacciones del día
      console.log(`${dayData.transactions.length} transacciones en este día`);
    }
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Header de días de la semana */}
      <View style={styles.weekDaysHeader}>
        {weekDays.map((day, index) => (
          <View key={day} style={styles.weekDay}>
            <Typo
              size={12}
              color={
                index === 0 || index === 6 ? colors.rose : colors.neutral400
              }
              fontWeight="600"
            >
              {day}
            </Typo>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, index) => {
          const isWeekend = index % 7 === 0 || index % 7 === 6;
          const today = new Date();
          const isToday =
            item.day === today.getDate() &&
            selectedMonth.getMonth() === today.getMonth() &&
            selectedMonth.getFullYear() === today.getFullYear();

          return (
            <Animated.View
              key={`day-${index}`}
              entering={FadeIn.delay(index * 8)}
            >
              <TouchableOpacity
                style={[
                  styles.calendarDay,
                  item.isEmpty && styles.emptyDay,
                  isToday && styles.selectedDay,
                  item.hasHighImportance && styles.highImportanceDay,
                  item.count > 0 && styles.hasTransactionsDay,
                ]}
                onPress={() => handleDayPress(item)}
                disabled={item.isEmpty || item.count === 0}
                activeOpacity={0.7}
              >
                {!item.isEmpty && (
                  <>
                    <View style={styles.dayHeader}>
                      <Typo
                        size={14}
                        color={isWeekend ? colors.rose : colors.white}
                        fontWeight={isToday ? "700" : "500"}
                      >
                        {item.day}
                      </Typo>
                      {item.count > 0 && (
                        <View style={styles.transactionCount}>
                          <Typo size={8} color={colors.white} fontWeight="600">
                            {item.count}
                          </Typo>
                        </View>
                      )}
                    </View>

                    <View style={styles.dayContent}>
                      {item.income > 0 && (
                        <View style={styles.amountContainer}>
                          <Icons.TrendUp
                            size={verticalScale(10)}
                            color={colors.green}
                          />
                          <Typo size={9} color={colors.green} fontWeight="600">
                            {item.income > 1000
                              ? `${(item.income / 1000).toFixed(1)}k`
                              : item.income.toString()}
                          </Typo>
                        </View>
                      )}
                      {item.expense > 0 && (
                        <View style={styles.amountContainer}>
                          <Icons.TrendDown
                            size={verticalScale(10)}
                            color={colors.rose}
                          />
                          <Typo size={9} color={colors.rose} fontWeight="600">
                            {item.expense > 1000
                              ? `${(item.expense / 1000).toFixed(1)}k`
                              : item.expense.toString()}
                          </Typo>
                        </View>
                      )}
                    </View>

                    {item.hasHighImportance && (
                      <View style={styles.importanceIndicator}>
                        <Icons.Warning
                          size={verticalScale(8)}
                          color={colors.yellow}
                          weight="fill"
                        />
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: colors.green }]}
          />
          <Typo size={10} color={colors.neutral400}>
            Ingresos
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: colors.rose }]}
          />
          <Typo size={10} color={colors.neutral400}>
            Gastos
          </Typo>
        </View>
        <View style={styles.legendItem}>
          <Icons.Warning size={verticalScale(10)} color={colors.yellow} />
          <Typo size={10} color={colors.neutral400}>
            Alta prioridad
          </Typo>
        </View>
      </View>
    </View>
  );
};

export default CalendarView;

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
  },
  weekDaysHeader: {
    flexDirection: "row",
    paddingVertical: spacingY._10,
    marginBottom: spacingY._5,
  },
  weekDay: {
    flex: 1,
    alignItems: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: colors.neutral700,
    padding: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyDay: {
    backgroundColor: colors.neutral900,
  },
  selectedDay: {
    backgroundColor: colors.neutral700,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  highImportanceDay: {
    borderColor: colors.yellow,
    borderWidth: 1,
  },
  hasTransactionsDay: {
    backgroundColor: colors.neutral800,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  transactionCount: {
    backgroundColor: colors.blue,
    borderRadius: verticalScale(8),
    width: verticalScale(16),
    height: verticalScale(16),
    justifyContent: "center",
    alignItems: "center",
  },
  dayContent: {
    alignItems: "center",
    gap: 2,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  importanceIndicator: {
    position: "absolute",
    top: 2,
    left: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacingX._15,
    marginTop: spacingY._15,
    paddingTop: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  legendColor: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
  },

  // MonthlyView styles
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
