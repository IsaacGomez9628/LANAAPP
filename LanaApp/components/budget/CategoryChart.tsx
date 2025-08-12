import React from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

// Definir el tipo localmente ya que no existe el archivo types/budget
interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  color: string;
  period: "monthly" | "weekly" | "daily";
}

interface CategoryChartProps {
  budgets: Budget[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ budgets }) => {
  const chartData = {
    labels: budgets.map((b) => b.category.substring(0, 8)),
    datasets: [
      {
        data: budgets.map((b) => b.amount),
        color: () => colors.blue,
      },
      {
        data: budgets.map((b) => b.spent),
        color: () => colors.rose,
      },
    ],
    legend: ["Presupuesto", "Gastado"],
  };

  if (budgets.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Typo size={14} color={colors.neutral400}>
          No hay presupuestos para mostrar
        </Typo>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <BarChart
        data={chartData}
        width={Math.max(screenWidth - 80, budgets.length * 80)}
        height={220}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: colors.neutral800,
          backgroundGradientFrom: colors.neutral800,
          backgroundGradientTo: colors.neutral800,
          decimalPlaces: 0,
          color: (opacity = 1, index) => {
            return index === 0 ? colors.blue : colors.rose;
          },
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
    </ScrollView>
  );
};

export default CategoryChart;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
  },
});
