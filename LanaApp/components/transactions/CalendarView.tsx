import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Typo from "@/components/Typo";
import { colors, spacingY } from "@/constants/theme";
import { Transaction } from "@/constants/transactions";

interface CalendarViewProps {
  transactions: Transaction[];
  selectedMonth: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  selectedMonth,
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
      });
    }

    return { days, firstDayOfMonth, daysInMonth };
  }, [transactions, selectedMonth]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const { days, firstDayOfMonth } = calendarData;

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ isEmpty: true, day: 0, income: 0, expense: 0 });
  }
  days.forEach((day) => calendarDays.push({ ...day, isEmpty: false }));

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
              fontWeight="500"
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
          const isToday =
            item.day === new Date().getDate() &&
            selectedMonth.getMonth() === new Date().getMonth();

          return (
            <Animated.View
              key={`day-${index}`}
              entering={FadeIn.delay(index * 10)}
              style={[
                styles.calendarDay,
                item.isEmpty && styles.emptyDay,
                isToday && styles.selectedDay,
              ]}
            >
              {!item.isEmpty && (
                <>
                  <Typo
                    size={14}
                    color={isWeekend ? colors.rose : colors.white}
                    fontWeight={isToday ? "600" : "400"}
                  >
                    {item.day}
                  </Typo>
                  {item.income > 0 && (
                    <Typo size={10} color={colors.blue} fontWeight="600">
                      {item.income.toLocaleString("es-MX")}
                    </Typo>
                  )}
                  {item.expense > 0 && (
                    <Typo size={10} color={colors.rose} fontWeight="600">
                      -{item.expense.toLocaleString("es-MX")}
                    </Typo>
                  )}
                </>
              )}
            </Animated.View>
          );
        })}
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
    justifyContent: "center",
  },
  emptyDay: {
    backgroundColor: colors.neutral900,
  },
  selectedDay: {
    backgroundColor: colors.neutral700,
  },
});
