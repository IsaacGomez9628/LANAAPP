// LanaApp/components/dashboard/FinancialDashboard.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import StatsCard from "@/components/StatsCard";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { LineChart, ProgressChart } from "react-native-chart-kit";

const { width: screenWidth } = Dimensions.get("window");

interface DashboardData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoals: any[];
  budgets: any[];
  recentTransactions: any[];
  recurringPayments: any[];
}

interface FinancialDashboardProps {
  data: DashboardData;
  onNavigateToSection: (section: string) => void;
  onShowReports: () => void;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  data,
  onNavigateToSection,
  onShowReports,
}) => {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month"
  );

  const dashboardMetrics = useMemo(() => {
    const {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsGoals,
      budgets,
      recentTransactions,
      recurringPayments,
    } = data;

    // Calcular métricas principales
    const netIncome = monthlyIncome - monthlyExpenses;
    const savingsRate =
      monthlyIncome > 0 ? (netIncome / monthlyIncome) * 100 : 0;

    // Análisis de metas de ahorro
    const activeGoals = savingsGoals.filter((g) => g.isActive);
    const completedGoals = activeGoals.filter(
      (g) => g.currentAmount >= g.targetAmount
    );
    const totalSavingsTarget = activeGoals.reduce(
      (sum, g) => sum + g.targetAmount,
      0
    );
    const totalSavingsCurrent = activeGoals.reduce(
      (sum, g) => sum + g.currentAmount,
      0
    );
    const savingsProgress =
      totalSavingsTarget > 0
        ? (totalSavingsCurrent / totalSavingsTarget) * 100
        : 0;

    // Análisis de presupuestos
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const budgetsExceeded = budgets.filter((b) => b.spent > b.amount).length;

    // Próximos pagos recurrentes
    const upcomingPayments = recurringPayments
      .filter((p) => p.isActive)
      .sort(
        (a, b) =>
          new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime()
      )
      .slice(0, 3);

    const totalUpcomingAmount = upcomingPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    // Tendencias (simuladas para demo)
    const weeklyTrend = [
      { day: "L", amount: 150 },
      { day: "M", amount: 200 },
      { day: "M", amount: 75 },
      { day: "J", amount: 300 },
      { day: "V", amount: 125 },
      { day: "S", amount: 400 },
      { day: "D", amount: 50 },
    ];

    // Estado financiero general
    const getFinancialHealth = () => {
      let score = 0;
      let factors = [];

      // Factor 1: Tasa de ahorro
      if (savingsRate >= 20) {
        score += 25;
        factors.push("Excelente tasa de ahorro");
      } else if (savingsRate >= 10) {
        score += 15;
        factors.push("Buena tasa de ahorro");
      } else {
        score += 5;
        factors.push("Tasa de ahorro baja");
      }

      // Factor 2: Control de presupuesto
      if (budgetUsage <= 80) {
        score += 25;
        factors.push("Presupuesto bien controlado");
      } else if (budgetUsage <= 100) {
        score += 15;
        factors.push("Presupuesto en el límite");
      } else {
        score += 5;
        factors.push("Presupuesto excedido");
      }

      // Factor 3: Progreso en metas
      if (savingsProgress >= 75) {
        score += 25;
        factors.push("Excelente progreso en metas");
      } else if (savingsProgress >= 50) {
        score += 15;
        factors.push("Buen progreso en metas");
      } else {
        score += 5;
        factors.push("Progreso lento en metas");
      }

      // Factor 4: Balance disponible
      if (currentBalance >= monthlyExpenses * 3) {
        score += 25;
        factors.push("Excelente reserva de emergencia");
      } else if (currentBalance >= monthlyExpenses) {
        score += 15;
        factors.push("Buena reserva disponible");
      } else {
        score += 5;
        factors.push("Reserva limitada");
      }

      const healthLevel =
        score >= 80
          ? "excellent"
          : score >= 60
          ? "good"
          : score >= 40
          ? "fair"
          : "poor";
      const healthColor =
        score >= 80
          ? colors.green
          : score >= 60
          ? colors.blue
          : score >= 40
          ? colors.yellow
          : colors.rose;

      return { score, healthLevel, healthColor, factors };
    };

    const financialHealth = getFinancialHealth();

    return {
      netIncome,
      savingsRate,
      activeGoals,
      completedGoals,
      totalSavingsTarget,
      totalSavingsCurrent,
      savingsProgress,
      totalBudget,
      totalSpent,
      budgetUsage,
      budgetsExceeded,
      upcomingPayments,
      totalUpcomingAmount,
      weeklyTrend,
      financialHealth,
    };
  }, [data]);

  const getHealthMessage = (level: string) => {
    switch (level) {
      case "excellent":
        return "¡Excelente! Tu salud financiera es muy buena";
      case "good":
        return "Buen trabajo, vas por buen camino";
      case "fair":
        return "Regular, hay áreas que mejorar";
      case "poor":
        return "Necesitas atención en tus finanzas";
      default:
        return "Evaluando tu estado financiero...";
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      {/* Header del Dashboard */}
      <Animated.View entering={FadeIn.springify()} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Typo size={14} color={colors.neutral400}>
              Tu Estado Financiero
            </Typo>
            <Typo size={24} fontWeight="700" color={colors.white}>
              Dashboard
            </Typo>
          </View>
          <TouchableOpacity
            onPress={onShowReports}
            style={styles.reportsButton}
          >
            <Icons.ChartLine size={verticalScale(20)} color={colors.primary} />
            <Typo size={12} color={colors.primary}>
              Reportes
            </Typo>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Salud Financiera General */}
      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={styles.healthCard}
      >
        <View style={styles.healthHeader}>
          <View style={styles.healthScore}>
            <View
              style={[
                styles.healthCircle,
                { borderColor: dashboardMetrics.financialHealth.healthColor },
              ]}
            >
              <Typo
                size={20}
                fontWeight="700"
                color={dashboardMetrics.financialHealth.healthColor}
              >
                {dashboardMetrics.financialHealth.score}
              </Typo>
            </View>
            <View>
              <Typo size={16} fontWeight="600">
                Salud Financiera
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                {getHealthMessage(dashboardMetrics.financialHealth.healthLevel)}
              </Typo>
            </View>
          </View>
          <TouchableOpacity style={styles.healthInfoButton}>
            <Icons.Info size={verticalScale(16)} color={colors.neutral400} />
          </TouchableOpacity>
        </View>

        {/* Factores de salud */}
        <View style={styles.healthFactors}>
          {dashboardMetrics.financialHealth.factors
            .slice(0, 2)
            .map((factor, index) => (
              <View key={index} style={styles.healthFactor}>
                <Icons.CheckCircle
                  size={verticalScale(12)}
                  color={colors.green}
                />
                <Typo size={11} color={colors.neutral300}>
                  {factor}
                </Typo>
              </View>
            ))}
        </View>
      </Animated.View>

      {/* Métricas Principales */}
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.metricsContainer}
      >
        <View style={styles.metricsRow}>
          <StatsCard
            title="Balance Actual"
            value={data.currentBalance}
            icon="Wallet"
            color={colors.blue}
            style={styles.metricCard}
          />
          <StatsCard
            title="Ingresos del Mes"
            value={data.monthlyIncome}
            icon="TrendUp"
            color={colors.green}
            style={styles.metricCard}
          />
        </View>
        <View style={styles.metricsRow}>
          <StatsCard
            title="Gastos del Mes"
            value={data.monthlyExpenses}
            icon="TrendDown"
            color={colors.rose}
            style={styles.metricCard}
          />
          <StatsCard
            title="Tasa de Ahorro"
            value={dashboardMetrics.savingsRate}
            suffix="%"
            prefix=""
            icon="PiggyBank"
            color={colors.yellow}
            style={styles.metricCard}
          />
        </View>
      </Animated.View>

      {/* Gráfico de Tendencias */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={styles.chartCard}
      >
        <View style={styles.chartHeader}>
          <Typo size={16} fontWeight="600">
            📈 Tendencia de Gastos
          </Typo>
          <View style={styles.timeframeSelector}>
            {(["week", "month"] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.timeframeButton,
                  timeframe === period && styles.timeframeButtonActive,
                ]}
                onPress={() => setTimeframe(period)}
              >
                <Typo
                  size={10}
                  color={
                    timeframe === period ? colors.primary : colors.neutral400
                  }
                >
                  {period === "week" ? "Semana" : "Mes"}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <LineChart
          data={{
            labels: dashboardMetrics.weeklyTrend.map((t) => t.day),
            datasets: [
              {
                data: dashboardMetrics.weeklyTrend.map((t) => t.amount),
                color: () => colors.rose,
                strokeWidth: 3,
              },
            ],
          }}
          width={screenWidth - 80}
          height={150}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: (opacity = 1) => colors.rose,
            labelColor: () => colors.neutral400,
            style: { borderRadius: 0 },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: colors.rose,
            },
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: colors.neutral700,
              strokeWidth: 1,
            },
          }}
          bezier
          style={{ marginLeft: -spacingX._15 }}
        />
      </Animated.View>

      {/* Resumen de Secciones */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
        style={styles.sectionsContainer}
      >
        {/* Metas de Ahorro */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => onNavigateToSection("savings")}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icons.Target size={verticalScale(20)} color={colors.green} />
            </View>
            <View style={styles.sectionInfo}>
              <Typo size={14} fontWeight="600">
                Metas de Ahorro
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                {dashboardMetrics.activeGoals.length} activas •{" "}
                {dashboardMetrics.completedGoals.length} completadas
              </Typo>
            </View>
            <Icons.CaretRight
              size={verticalScale(16)}
              color={colors.neutral500}
            />
          </View>

          <View style={styles.sectionProgress}>
            <View style={styles.progressInfo}>
              <Typo size={12} color={colors.neutral400}>
                Progreso General
              </Typo>
              <Typo size={16} fontWeight="600" color={colors.green}>
                {dashboardMetrics.savingsProgress.toFixed(1)}%
              </Typo>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      dashboardMetrics.savingsProgress,
                      100
                    )}%`,
                    backgroundColor: colors.green,
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Presupuestos */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => onNavigateToSection("budgets")}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icons.ChartPie size={verticalScale(20)} color={colors.blue} />
            </View>
            <View style={styles.sectionInfo}>
              <Typo size={14} fontWeight="600">
                Presupuestos
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                {data.budgets.length} categorías •{" "}
                {dashboardMetrics.budgetsExceeded} excedidos
              </Typo>
            </View>
            <Icons.CaretRight
              size={verticalScale(16)}
              color={colors.neutral500}
            />
          </View>

          <View style={styles.sectionProgress}>
            <View style={styles.progressInfo}>
              <Typo size={12} color={colors.neutral400}>
                Uso General
              </Typo>
              <Typo
                size={16}
                fontWeight="600"
                color={
                  dashboardMetrics.budgetUsage > 100
                    ? colors.rose
                    : dashboardMetrics.budgetUsage > 80
                    ? colors.yellow
                    : colors.blue
                }
              >
                {dashboardMetrics.budgetUsage.toFixed(1)}%
              </Typo>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(dashboardMetrics.budgetUsage, 100)}%`,
                    backgroundColor:
                      dashboardMetrics.budgetUsage > 100
                        ? colors.rose
                        : dashboardMetrics.budgetUsage > 80
                        ? colors.yellow
                        : colors.blue,
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Pagos Recurrentes */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => onNavigateToSection("payments")}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Icons.Clock size={verticalScale(20)} color={colors.purple} />
            </View>
            <View style={styles.sectionInfo}>
              <Typo size={14} fontWeight="600">
                Próximos Pagos
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                {dashboardMetrics.upcomingPayments.length} próximos
              </Typo>
            </View>
            <Typo size={14} fontWeight="600" color={colors.purple}>
              ${dashboardMetrics.totalUpcomingAmount.toLocaleString("es-MX")}
            </Typo>
          </View>

          {dashboardMetrics.upcomingPayments
            .slice(0, 2)
            .map((payment, index) => {
              const daysUntil = Math.ceil(
                (new Date(payment.nextPayment) - new Date()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <View key={payment.id} style={styles.upcomingPayment}>
                  <View
                    style={[
                      styles.paymentDot,
                      { backgroundColor: payment.color },
                    ]}
                  />
                  <View style={styles.paymentInfo}>
                    <Typo size={12} fontWeight="500">
                      {payment.name}
                    </Typo>
                    <Typo size={10} color={colors.neutral400}>
                      En {daysUntil} días
                    </Typo>
                  </View>
                  <Typo size={12} fontWeight="600" color={payment.color}>
                    ${payment.amount.toLocaleString("es-MX")}
                  </Typo>
                </View>
              );
            })}
        </TouchableOpacity>
      </Animated.View>

      {/* Acciones Rápidas */}
      <Animated.View
        entering={FadeInUp.delay(500).springify()}
        style={styles.quickActions}
      >
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          ⚡ Acciones Rápidas
        </Typo>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigateToSection("add-transaction")}
          >
            <Icons.Plus size={verticalScale(20)} color={colors.green} />
            <Typo size={12} color={colors.white}>
              Transacción
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigateToSection("add-goal")}
          >
            <Icons.Target size={verticalScale(20)} color={colors.blue} />
            <Typo size={12} color={colors.white}>
              Meta
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigateToSection("add-budget")}
          >
            <Icons.ChartPie size={verticalScale(20)} color={colors.purple} />
            <Typo size={12} color={colors.white}>
              Presupuesto
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => onNavigateToSection("add-payment")}
          >
            <Icons.Clock size={verticalScale(20)} color={colors.yellow} />
            <Typo size={12} color={colors.white}>
              Pago
            </Typo>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Consejos Financieros */}
      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={styles.tipsCard}
      >
        <View style={styles.tipsHeader}>
          <Icons.Lightbulb size={verticalScale(20)} color={colors.yellow} />
          <Typo size={16} fontWeight="600">
            💡 Consejo del Día
          </Typo>
        </View>
        <Typo size={13} color={colors.neutral300}>
          {dashboardMetrics.savingsRate < 20
            ? "Intenta ahorrar al menos el 20% de tus ingresos. Considera automatizar tus ahorros."
            : dashboardMetrics.budgetUsage > 90
            ? "Algunos presupuestos están al límite. Revisa tus gastos no esenciales."
            : "¡Vas muy bien! Mantén el control de tus finanzas y sigue cumpliendo tus metas."}
        </Typo>
      </Animated.View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default FinancialDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    backgroundColor: colors.neutral800,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: radius._10,
  },
  healthCard: {
    backgroundColor: colors.neutral800,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._20,
    borderRadius: radius._15,
    padding: spacingX._20,
  },
  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  healthScore: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._15,
  },
  healthCircle: {
    width: verticalScale(60),
    height: verticalScale(60),
    borderRadius: verticalScale(30),
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  healthInfoButton: {
    padding: spacingX._5,
  },
  healthFactors: {
    gap: spacingY._7,
  },
  healthFactor: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  metricsContainer: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacingX._10,
    marginBottom: spacingY._10,
  },
  metricCard: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: colors.neutral800,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._20,
    borderRadius: radius._15,
    padding: spacingX._20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  timeframeSelector: {
    flexDirection: "row",
    backgroundColor: colors.neutral700,
    borderRadius: radius._6,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  timeframeButtonActive: {
    backgroundColor: colors.neutral600,
  },
  sectionsContainer: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  sectionCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacingY._12,
  },
  sectionIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: radius._10,
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._12,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionProgress: {
    gap: spacingY._7,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: {
    height: verticalScale(6),
    backgroundColor: colors.neutral700,
    borderRadius: radius._6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius._6,
  },
  upcomingPayment: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._7,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  paymentDot: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
    marginRight: spacingX._10,
  },
  paymentInfo: {
    flex: 1,
  },
  quickActions: {
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    alignItems: "center",
    gap: spacingY._7,
    width: "22%",
  },
  tipsCard: {
    backgroundColor: colors.yellow + "10",
    borderWidth: 1,
    borderColor: colors.yellow + "30",
    marginHorizontal: spacingX._20,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._20,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginBottom: spacingY._10,
  },
});
