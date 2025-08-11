import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface QuickStatsOverlayProps {
  stats: {
    todayCount: number;
    weeklyCount: number;
    topCategory: { name: string; amount: number } | null;
    totalTransactions: number;
  };
  monthlyTotals: {
    income: number;
    expenses: number;
    total: number;
    count: number;
    averageExpense: number;
  };
  currentBalance: number;
  onClose: () => void;
}

const QuickStatsOverlay: React.FC<QuickStatsOverlayProps> = ({
  stats,
  monthlyTotals,
  currentBalance,
  onClose,
}) => {
  const savingsRate =
    monthlyTotals.income > 0
      ? ((monthlyTotals.income - monthlyTotals.expenses) /
          monthlyTotals.income) *
        100
      : 0;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View
        entering={FadeIn.delay(100).springify()}
        style={styles.container}
      >
        <View style={styles.header}>
          <Typo size={18} fontWeight="600">
            Estadísticas Rápidas
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(20)} color={colors.neutral400} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {/* Balance actual */}
          <View style={[styles.statCard, styles.balanceCard]}>
            <Icons.Wallet size={verticalScale(24)} color={colors.blue} />
            <Typo size={12} color={colors.neutral400}>
              Balance Actual
            </Typo>
            <Typo size={20} fontWeight="700" color={colors.blue}>
              ${currentBalance.toLocaleString("es-MX")}
            </Typo>
          </View>

          {/* Transacciones de hoy */}
          <View style={styles.statCard}>
            <Icons.CalendarCheck
              size={verticalScale(20)}
              color={colors.green}
            />
            <Typo size={12} color={colors.neutral400}>
              Hoy
            </Typo>
            <Typo size={16} fontWeight="600" color={colors.white}>
              {stats.todayCount} mov.
            </Typo>
          </View>

          {/* Transacciones de la semana */}
          <View style={styles.statCard}>
            <Icons.ChartBar size={verticalScale(20)} color={colors.purple} />
            <Typo size={12} color={colors.neutral400}>
              Esta Semana
            </Typo>
            <Typo size={16} fontWeight="600" color={colors.white}>
              {stats.weeklyCount} mov.
            </Typo>
          </View>

          {/* Gasto promedio */}
          <View style={styles.statCard}>
            <Icons.TrendDown size={verticalScale(20)} color={colors.orange} />
            <Typo size={12} color={colors.neutral400}>
              Gasto Promedio
            </Typo>
            <Typo size={14} fontWeight="600" color={colors.white}>
              ${monthlyTotals.averageExpense.toLocaleString("es-MX")}
            </Typo>
          </View>

          {/* Tasa de ahorro */}
          <View style={[styles.statCard, styles.wideCard]}>
            <View style={styles.statHeader}>
              <Icons.PiggyBank size={verticalScale(20)} color={colors.yellow} />
              <Typo size={12} color={colors.neutral400}>
                Tasa de Ahorro
              </Typo>
            </View>
            <View style={styles.savingsInfo}>
              <Typo
                size={18}
                fontWeight="700"
                color={
                  savingsRate >= 20
                    ? colors.green
                    : savingsRate >= 10
                    ? colors.yellow
                    : colors.rose
                }
              >
                {savingsRate.toFixed(1)}%
              </Typo>
              <View style={styles.savingsBar}>
                <View
                  style={[
                    styles.savingsFill,
                    {
                      width: `${Math.min(Math.abs(savingsRate), 100)}%`,
                      backgroundColor:
                        savingsRate >= 20
                          ? colors.green
                          : savingsRate >= 10
                          ? colors.yellow
                          : colors.rose,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Categoría principal */}
          {stats.topCategory && (
            <View style={[styles.statCard, styles.wideCard]}>
              <View style={styles.statHeader}>
                <Icons.Target size={verticalScale(20)} color={colors.cyan} />
                <Typo size={12} color={colors.neutral400}>
                  Categoría Principal
                </Typo>
              </View>
              <Typo size={14} fontWeight="600" color={colors.white}>
                {stats.topCategory.name}
              </Typo>
              <Typo size={16} fontWeight="700" color={colors.cyan}>
                ${stats.topCategory.amount.toLocaleString("es-MX")}
              </Typo>
            </View>
          )}
        </View>

        {/* Resumen del mes */}
        <View style={styles.monthlyResume}>
          <Typo
            size={14}
            fontWeight="600"
            color={colors.neutral300}
            style={{ marginBottom: 10 }}
          >
            Resumen del Mes
          </Typo>
          <View style={styles.resumeRow}>
            <View style={styles.resumeItem}>
              <Typo size={12} color={colors.neutral400}>
                Ingresos
              </Typo>
              <Typo size={14} fontWeight="600" color={colors.green}>
                ${monthlyTotals.income.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.resumeItem}>
              <Typo size={12} color={colors.neutral400}>
                Gastos
              </Typo>
              <Typo size={14} fontWeight="600" color={colors.rose}>
                ${monthlyTotals.expenses.toLocaleString("es-MX")}
              </Typo>
            </View>
            <View style={styles.resumeItem}>
              <Typo size={12} color={colors.neutral400}>
                Balance
              </Typo>
              <Typo
                size={14}
                fontWeight="600"
                color={monthlyTotals.total >= 0 ? colors.green : colors.rose}
              >
                ${monthlyTotals.total.toLocaleString("es-MX")}
              </Typo>
            </View>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default QuickStatsOverlay;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._20,
    margin: spacingX._20,
    marginTop: verticalScale(100),
    padding: spacingX._20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._10,
    marginBottom: spacingY._20,
  },
  statCard: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    padding: spacingX._15,
    alignItems: "center",
    gap: spacingY._5,
    width: "48%",
  },
  balanceCard: {
    backgroundColor: colors.blue + "20",
    borderWidth: 1,
    borderColor: colors.blue + "40",
  },
  wideCard: {
    width: "100%",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginBottom: spacingY._10,
  },
  savingsInfo: {
    alignItems: "center",
    gap: spacingY._7,
    width: "100%",
  },
  savingsBar: {
    width: "100%",
    height: verticalScale(6),
    backgroundColor: colors.neutral600,
    borderRadius: radius._6,
    overflow: "hidden",
  },
  savingsFill: {
    height: "100%",
    borderRadius: radius._6,
  },
  monthlyResume: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    padding: spacingX._15,
  },
  resumeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resumeItem: {
    alignItems: "center",
    gap: spacingY._5,
  },
});
