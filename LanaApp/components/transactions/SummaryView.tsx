import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PieChart, BarChart } from "react-native-chart-kit";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { Transaction, CATEGORIES } from "@/constants/transactions";

const { width: screenWidth } = Dimensions.get("window");

interface SummaryViewProps {
  transactions: Transaction[];
  monthlyTotals: {
    income: number;
    expenses: number;
    total: number;
  };
  totalBudget: number;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  transactions,
  monthlyTotals,
  totalBudget,
}) => {
  const budgetUsed = monthlyTotals.expenses / totalBudget;

  const chartData = useMemo(() => {
    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(expensesByCategory).map(([name, amount]) => {
      const category = CATEGORIES.find((c) => c.name === name);
      return {
        name: name.substring(0, 8),
        amount,
        color: category?.color || colors.neutral400,
        legendFontColor: colors.text,
        legendFontSize: 11,
      };
    });

    const monthlyExpenses: number[] = [];
    const monthLabels: string[] = [];

    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      const monthTransactions = transactions.filter((t) => {
        return (
          t.date.getMonth() === month.getMonth() &&
          t.date.getFullYear() === month.getFullYear()
        );
      });

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyExpenses.push(expenses || Math.random() * 3000 + 1000);
      monthLabels.push(month.toLocaleDateString("es-MX", { month: "short" }));
    }

    return { pieData, monthlyExpenses, monthLabels };
  }, [transactions]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Cuentas */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={styles.summarySection}
      >
        <View style={styles.sectionHeader}>
          <Icons.Wallet size={verticalScale(20)} color={colors.white} />
          <Typo size={18} fontWeight="600">
            Accounts
          </Typo>
        </View>
        <View style={styles.accountCard}>
          <Typo size={14} color={colors.neutral400}>
            Exp. (Cash, Accounts)
          </Typo>
          <Typo size={20} fontWeight="600">
            {monthlyTotals.expenses.toLocaleString("es-MX")}
          </Typo>
        </View>
      </Animated.View>

      {/* Presupuesto */}
      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={styles.summarySection}
      >
        <View style={styles.sectionHeader}>
          <Icons.Target size={verticalScale(20)} color={colors.white} />
          <Typo size={18} fontWeight="600">
            Budget
          </Typo>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View>
              <Typo size={14} color={colors.neutral400}>
                Total Budget
              </Typo>
              <Typo size={20} fontWeight="600">
                $ {totalBudget.toLocaleString("es-MX")}
              </Typo>
            </View>
            <TouchableOpacity style={styles.todayBadge}>
              <Typo size={12} color={colors.neutral600} fontWeight="500">
                Today
              </Typo>
            </TouchableOpacity>
          </View>

          <View style={styles.budgetProgress}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(budgetUsed * 100, 100)}%`,
                    backgroundColor:
                      budgetUsed > 0.8
                        ? colors.rose
                        : budgetUsed > 0.6
                        ? colors.yellow
                        : colors.green,
                  },
                ]}
              />
            </View>
            <View style={styles.budgetStats}>
              <Typo size={16} color={colors.blue}>
                {monthlyTotals.expenses.toLocaleString("es-MX")}
              </Typo>
              <Typo size={16} fontWeight="600">
                {(budgetUsed * 100).toFixed(0)}%
              </Typo>
              <Typo size={16} color={colors.neutral400}>
                {(totalBudget - monthlyTotals.expenses).toLocaleString("es-MX")}
              </Typo>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Gráfico de pastel */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.summarySection}
      >
        <Typo size={18} fontWeight="600" style={{ marginBottom: 20 }}>
          Expense Distribution
        </Typo>
        {chartData.pieData.length > 0 ? (
          <PieChart
            data={chartData.pieData}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => colors.white,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Icons.ChartPie
              size={verticalScale(40)}
              color={colors.neutral600}
            />
            <Typo size={14} color={colors.neutral400}>
              No expenses to show
            </Typo>
          </View>
        )}
      </Animated.View>

      {/* Gráfico de barras */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={styles.summarySection}
      >
        <Typo size={18} fontWeight="600" style={{ marginBottom: 20 }}>
          Monthly Trend
        </Typo>
        <BarChart
          data={{
            labels: chartData.monthLabels,
            datasets: [
              {
                data: chartData.monthlyExpenses,
              },
            ],
          }}
          width={screenWidth - 40}
          height={200}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.neutral800,
            backgroundGradientFrom: colors.neutral800,
            backgroundGradientTo: colors.neutral900,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: () => colors.neutral400,
            barPercentage: 0.6,
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: colors.neutral700,
              strokeWidth: 1,
            },
          }}
          style={{
            borderRadius: radius._12,
          }}
          showValuesOnTopOfBars
          fromZero
        />
      </Animated.View>

      {/* Botón de exportar */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={[styles.summarySection, { marginBottom: 100 }]}
      >
        <TouchableOpacity style={styles.exportButton}>
          <Icons.MicrosoftExcelLogo
            size={verticalScale(24)}
            color={colors.green}
          />
          <Typo size={16} fontWeight="500">
            Export data to Excel
          </Typo>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

export default SummaryView;

const styles = StyleSheet.create({
  summarySection: {
    backgroundColor: colors.neutral800,
    padding: spacingX._20,
    borderRadius: radius._15,
    marginBottom: spacingY._20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginBottom: spacingY._15,
  },
  accountCard: {
    backgroundColor: colors.neutral700,
    padding: spacingX._15,
    borderRadius: radius._10,
  },
  budgetCard: {
    gap: spacingY._15,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayBadge: {
    backgroundColor: colors.neutral400,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._5,
    borderRadius: radius._15,
  },
  budgetProgress: {
    gap: spacingY._10,
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius._10,
  },
  budgetStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    backgroundColor: colors.neutral700,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
  },
});
