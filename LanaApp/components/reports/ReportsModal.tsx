import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Share,
} from "react-native";
import Modal from "react-native-modal";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface ReportData {
  transactions: any[];
  budgets: any[];
  savingsGoals: any[];
  currentBalance: number;
  period: "week" | "month" | "quarter" | "year";
}

interface ReportsModalProps {
  isVisible: boolean;
  onClose: () => void;
  reportData: ReportData;
}

const ReportsModal: React.FC<ReportsModalProps> = ({
  isVisible,
  onClose,
  reportData,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "categories" | "goals"
  >("overview");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  const reportAnalysis = useMemo(() => {
    const { transactions, budgets, savingsGoals, currentBalance } = reportData;

    // Filtrar transacciones por período
    const now = new Date();
    const periodStart = new Date();

    switch (selectedPeriod) {
      case "week":
        periodStart.setDate(now.getDate() - 7);
        break;
      case "month":
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case "year":
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodTransactions = transactions.filter(
      (t) => new Date(t.date) >= periodStart
    );

    // Calcular métricas básicas
    const income = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = income - expenses;
    const savingsRate = income > 0 ? (netIncome / income) * 100 : 0;

    // Análisis por categorías
    const categoryAnalysis = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategories: [string, number][] = Object.entries(categoryAnalysis)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Tendencias mensuales (últimos 6 meses)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === monthDate.getMonth() &&
          tDate.getFullYear() === monthDate.getFullYear()
        );
      });

      const monthIncome = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrends.push({
        month: monthDate.toLocaleDateString("es-MX", { month: "short" }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      });
    }

    // Análisis de presupuestos
    const budgetAnalysis = budgets.map((budget) => ({
      ...budget,
      usage: (budget.spent / budget.amount) * 100,
      remaining: budget.amount - budget.spent,
      status:
        budget.spent > budget.amount
          ? "exceeded"
          : budget.spent > budget.amount * 0.8
          ? "warning"
          : "good",
    }));

    // Análisis de metas de ahorro
    const goalsAnalysis = savingsGoals.map((goal) => ({
      ...goal,
      progress: (goal.currentAmount / goal.targetAmount) * 100,
      daysRemaining: Math.ceil(
        (new Date(goal.deadline).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      onTrack:
        goal.currentAmount >=
        goal.targetAmount *
          (1 -
            (new Date(goal.deadline).getTime() - now.getTime()) /
              (new Date(goal.deadline).getTime() -
                new Date(goal.createdAt || now).getTime())),
    }));

    // Insights automáticos
    const insights = [];

    if (savingsRate < 10) {
      insights.push({
        type: "warning",
        title: "Baja tasa de ahorro",
        description: `Tu tasa de ahorro es del ${savingsRate.toFixed(
          1
        )}%. Se recomienda ahorrar al menos el 20% de tus ingresos.`,
        action:
          "Revisa tus gastos y considera reducir categorías no esenciales.",
      });
    }

    if (topCategories.length > 0 && topCategories[0][1] > income * 0.4) {
      insights.push({
        type: "info",
        title: "Categoría dominante",
        description: `El ${((topCategories[0][1] / expenses) * 100).toFixed(
          1
        )}% de tus gastos van a ${topCategories[0][0]}.`,
        action: "Considera diversificar tus gastos o revisar esta categoría.",
      });
    }

    const exceededBudgets = budgetAnalysis.filter(
      (b) => b.status === "exceeded"
    ).length;
    if (exceededBudgets > 0) {
      insights.push({
        type: "warning",
        title: "Presupuestos excedidos",
        description: `Has excedido ${exceededBudgets} presupuesto(s) este período.`,
        action: "Ajusta tus presupuestos o reduce gastos en estas categorías.",
      });
    }

    const behindGoals = goalsAnalysis.filter(
      (g) => !g.onTrack && g.daysRemaining > 0
    ).length;
    if (behindGoals > 0) {
      insights.push({
        type: "info",
        title: "Metas retrasadas",
        description: `Tienes ${behindGoals} meta(s) de ahorro que van retrasadas.`,
        action: "Considera aumentar tus ahorros mensuales para estas metas.",
      });
    }

    return {
      income,
      expenses,
      netIncome,
      savingsRate,
      categoryAnalysis,
      topCategories,
      monthlyTrends,
      budgetAnalysis,
      goalsAnalysis,
      insights,
      totalTransactions: periodTransactions.length,
      averageTransaction:
        expenses /
        Math.max(
          periodTransactions.filter((t) => t.type === "expense").length,
          1
        ),
    };
  }, [reportData, selectedPeriod]);

  const generateTextReport = () => {
    const { income, expenses, netIncome, savingsRate, insights } =
      reportAnalysis;

    const report = `
📊 REPORTE FINANCIERO - ${selectedPeriod.toUpperCase()}
📅 Período: ${new Date().toLocaleDateString("es-MX")}

💰 RESUMEN FINANCIERO:
• Ingresos: $${income.toLocaleString("es-MX")}
• Gastos: $${expenses.toLocaleString("es-MX")}
• Balance Neto: $${netIncome.toLocaleString("es-MX")}
• Tasa de Ahorro: ${savingsRate.toFixed(1)}%
• Balance Actual: $${reportData.currentBalance.toLocaleString("es-MX")}

📈 TOP CATEGORÍAS DE GASTO:
${reportAnalysis.topCategories
  .map(
    ([cat, amount], index) =>
      `${index + 1}. ${cat}: $${amount.toLocaleString("es-MX")}`
  )
  .join("\n")}

💡 INSIGHTS Y RECOMENDACIONES:
${insights
  .map(
    (insight) => `• ${insight.title}: ${insight.description} ${insight.action}`
  )
  .join("\n")}

📱 Generado por LanaApp
    `.trim();

    return report;
  };

  const handleExportReport = async () => {
    try {
      const report = generateTextReport();
      await Share.share({
        message: report,
        title: "Reporte Financiero - LanaApp",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo exportar el reporte");
    }
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Resumen principal */}
      <View style={styles.summaryCards}>
        <View
          style={[styles.summaryCard, { backgroundColor: colors.green + "20" }]}
        >
          <Icons.TrendUp size={verticalScale(24)} color={colors.green} />
          <Typo size={12} color={colors.neutral400}>
            Ingresos
          </Typo>
          <Typo size={20} fontWeight="700" color={colors.green}>
            ${reportAnalysis.income.toLocaleString("es-MX")}
          </Typo>
        </View>

        <View
          style={[styles.summaryCard, { backgroundColor: colors.rose + "20" }]}
        >
          <Icons.TrendDown size={verticalScale(24)} color={colors.rose} />
          <Typo size={12} color={colors.neutral400}>
            Gastos
          </Typo>
          <Typo size={20} fontWeight="700" color={colors.rose}>
            ${reportAnalysis.expenses.toLocaleString("es-MX")}
          </Typo>
        </View>

        <View
          style={[styles.summaryCard, { backgroundColor: colors.blue + "20" }]}
        >
          <Icons.Equals size={verticalScale(24)} color={colors.blue} />
          <Typo size={12} color={colors.neutral400}>
            Balance Neto
          </Typo>
          <Typo
            size={20}
            fontWeight="700"
            color={reportAnalysis.netIncome >= 0 ? colors.blue : colors.orange}
          >
            ${reportAnalysis.netIncome.toLocaleString("es-MX")}
          </Typo>
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.yellow + "20" },
          ]}
        >
          <Icons.PiggyBank size={verticalScale(24)} color={colors.yellow} />
          <Typo size={12} color={colors.neutral400}>
            Tasa de Ahorro
          </Typo>
          <Typo size={20} fontWeight="700" color={colors.yellow}>
            {reportAnalysis.savingsRate.toFixed(1)}%
          </Typo>
        </View>
      </View>

      {/* Insights automáticos */}
      <View style={styles.insightsSection}>
        <Typo size={18} fontWeight="600" style={{ marginBottom: 15 }}>
          💡 Insights Automáticos
        </Typo>
        {reportAnalysis.insights.map((insight, index) => (
          <View
            key={index}
            style={[
              styles.insightCard,
              {
                borderLeftColor:
                  insight.type === "warning" ? colors.rose : colors.blue,
              },
            ]}
          >
            <View style={styles.insightHeader}>
              <Icons.Lightbulb
                size={verticalScale(16)}
                color={insight.type === "warning" ? colors.rose : colors.blue}
              />
              <Typo size={14} fontWeight="600" color={colors.white}>
                {insight.title}
              </Typo>
            </View>
            <Typo
              size={12}
              color={colors.neutral300}
              style={{ marginBottom: 5 }}
            >
              {insight.description}
            </Typo>
            <Typo size={11} color={colors.neutral400}>
              💡 {insight.action}
            </Typo>
          </View>
        ))}
      </View>

      {/* Métricas adicionales */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Icons.Hash size={verticalScale(20)} color={colors.neutral400} />
          <Typo size={12} color={colors.neutral400}>
            Transacciones
          </Typo>
          <Typo size={16} fontWeight="600">
            {reportAnalysis.totalTransactions}
          </Typo>
        </View>
        <View style={styles.metricItem}>
          <Icons.Calculator
            size={verticalScale(20)}
            color={colors.neutral400}
          />
          <Typo size={12} color={colors.neutral400}>
            Gasto Promedio
          </Typo>
          <Typo size={16} fontWeight="600">
            ${reportAnalysis.averageTransaction.toLocaleString("es-MX")}
          </Typo>
        </View>
        <View style={styles.metricItem}>
          <Icons.Wallet size={verticalScale(20)} color={colors.neutral400} />
          <Typo size={12} color={colors.neutral400}>
            Balance Actual
          </Typo>
          <Typo size={16} fontWeight="600" color={colors.blue}>
            ${reportData.currentBalance.toLocaleString("es-MX")}
          </Typo>
        </View>
      </View>
    </ScrollView>
  );

  const renderTrends = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.chartSection}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          📈 Tendencias Mensuales
        </Typo>
        <LineChart
          data={{
            labels: reportAnalysis.monthlyTrends.map((t) => t.month),
            datasets: [
              {
                data: reportAnalysis.monthlyTrends.map((t) => t.income),
                color: () => colors.green,
                strokeWidth: 2,
              },
              {
                data: reportAnalysis.monthlyTrends.map((t) => t.expenses),
                color: () => colors.rose,
                strokeWidth: 2,
              },
            ],
            legend: ["Ingresos", "Gastos"],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: colors.neutral800,
            backgroundGradientFrom: colors.neutral800,
            backgroundGradientTo: colors.neutral800,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: () => colors.neutral400,
            style: { borderRadius: radius._12 },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
            },
          }}
          style={{ borderRadius: radius._12 }}
        />
      </View>

      <View style={styles.chartSection}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          📊 Balance Neto Mensual
        </Typo>
        <BarChart
          data={{
            labels: reportAnalysis.monthlyTrends.map((t) => t.month),
            datasets: [
              {
                data: reportAnalysis.monthlyTrends.map((t) =>
                  Math.max(t.net, 0)
                ),
              },
            ],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: colors.neutral800,
            backgroundGradientFrom: colors.neutral800,
            backgroundGradientTo: colors.neutral800,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.blue,
            labelColor: () => colors.neutral400,
            barPercentage: 0.6,
          }}
          style={{ borderRadius: radius._12 }}
        />
      </View>
    </ScrollView>
  );

  const renderCategories = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Gráfica de pastel */}
      <View style={styles.chartSection}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          🏷️ Distribución de Gastos
        </Typo>
        {reportAnalysis.topCategories.length > 0 ? (
          <PieChart
            data={reportAnalysis.topCategories.map(([name, amount], index) => ({
              name: name.substring(0, 8),
              amount,
              color:
                [
                  colors.rose,
                  colors.blue,
                  colors.green,
                  colors.yellow,
                  colors.purple,
                ][index] || colors.neutral400,
              legendFontColor: colors.white,
              legendFontSize: 11,
            }))}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : (
          <View style={styles.emptyChart}>
            <Icons.ChartPie
              size={verticalScale(40)}
              color={colors.neutral600}
            />
            <Typo size={14} color={colors.neutral400}>
              No hay gastos para mostrar
            </Typo>
          </View>
        )}
      </View>

      {/* Lista detallada de categorías */}
      <View style={styles.categoryList}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          📋 Detalle por Categorías
        </Typo>
        {reportAnalysis.topCategories.map(([category, amount], index) => {
          const percentage = (amount / reportAnalysis.expenses) * 100;
          return (
            <View key={category} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryIndicator,
                    {
                      backgroundColor: [
                        colors.rose,
                        colors.blue,
                        colors.green,
                        colors.yellow,
                        colors.purple,
                      ][index],
                    },
                  ]}
                />
                <Typo size={14} fontWeight="500">
                  {category}
                </Typo>
                <Typo size={14} fontWeight="600" color={colors.rose}>
                  ${amount.toLocaleString("es-MX")}
                </Typo>
              </View>
              <View style={styles.categoryProgress}>
                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: [
                          colors.rose,
                          colors.blue,
                          colors.green,
                          colors.yellow,
                          colors.purple,
                        ][index],
                      },
                    ]}
                  />
                </View>
                <Typo size={12} color={colors.neutral400}>
                  {percentage.toFixed(1)}%
                </Typo>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Estado de presupuestos */}
      <View style={styles.section}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          🎯 Estado de Presupuestos
        </Typo>
        {reportAnalysis.budgetAnalysis.map((budget, index) => (
          <View key={budget.id} style={styles.budgetStatusItem}>
            <View style={styles.budgetHeader}>
              <Typo size={14} fontWeight="500">
                {budget.category}
              </Typo>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      budget.status === "exceeded"
                        ? colors.rose + "20"
                        : budget.status === "warning"
                        ? colors.yellow + "20"
                        : colors.green + "20",
                  },
                ]}
              >
                <Typo
                  size={10}
                  color={
                    budget.status === "exceeded"
                      ? colors.rose
                      : budget.status === "warning"
                      ? colors.yellow
                      : colors.green
                  }
                >
                  {budget.status === "exceeded"
                    ? "Excedido"
                    : budget.status === "warning"
                    ? "Alerta"
                    : "Bien"}
                </Typo>
              </View>
            </View>
            <View style={styles.budgetProgress}>
              <Typo size={12} color={colors.neutral400}>
                ${budget.spent.toLocaleString("es-MX")} / $
                {budget.amount.toLocaleString("es-MX")}
              </Typo>
              <Typo
                size={12}
                fontWeight="600"
                color={
                  budget.status === "exceeded"
                    ? colors.rose
                    : budget.status === "warning"
                    ? colors.yellow
                    : colors.green
                }
              >
                {budget.usage.toFixed(1)}%
              </Typo>
            </View>
          </View>
        ))}
      </View>

      {/* Estado de metas de ahorro */}
      <View style={styles.section}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          💰 Estado de Metas de Ahorro
        </Typo>
        {reportAnalysis.goalsAnalysis.map((goal, index) => (
          <View key={goal.id} style={styles.goalStatusItem}>
            <View style={styles.goalHeader}>
              <Typo size={14} fontWeight="500">
                {goal.name}
              </Typo>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      goal.progress >= 100
                        ? colors.green + "20"
                        : goal.onTrack
                        ? colors.blue + "20"
                        : colors.yellow + "20",
                  },
                ]}
              >
                <Typo
                  size={10}
                  color={
                    goal.progress >= 100
                      ? colors.green
                      : goal.onTrack
                      ? colors.blue
                      : colors.yellow
                  }
                >
                  {goal.progress >= 100
                    ? "Completa"
                    : goal.onTrack
                    ? "En progreso"
                    : "Retrasada"}
                </Typo>
              </View>
            </View>
            <View style={styles.goalProgress}>
              <Typo size={12} color={colors.neutral400}>
                ${goal.currentAmount.toLocaleString("es-MX")} / $
                {goal.targetAmount.toLocaleString("es-MX")}
              </Typo>
              <Typo size={12} fontWeight="600" color={goal.color}>
                {goal.progress.toFixed(1)}%
              </Typo>
            </View>
            <Typo size={11} color={colors.neutral500}>
              {goal.daysRemaining > 0
                ? `${goal.daysRemaining} días restantes`
                : "Fecha límite pasada"}
            </Typo>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.titleContainer}>
            <Icons.ChartLine size={verticalScale(24)} color={colors.blue} />
            <Typo size={20} fontWeight="600">
              Reporte Financiero
            </Typo>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleExportReport}
              style={styles.exportButton}
            >
              <Icons.Export size={verticalScale(20)} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Icons.X size={verticalScale(24)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selector de período */}
        <View style={styles.periodSelector}>
          {(["week", "month", "quarter", "year"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Typo
                size={12}
                color={
                  selectedPeriod === period ? colors.black : colors.neutral400
                }
                fontWeight={selectedPeriod === period ? "600" : "400"}
              >
                {period === "week"
                  ? "Semana"
                  : period === "month"
                  ? "Mes"
                  : period === "quarter"
                  ? "Trimestre"
                  : "Año"}
              </Typo>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: "overview", label: "Resumen", icon: "ChartPie" },
            { key: "trends", label: "Tendencias", icon: "TrendUp" },
            { key: "categories", label: "Categorías", icon: "Tag" },
            { key: "goals", label: "Objetivos", icon: "Target" },
          ].map((tab) => {
            const IconComponent = Icons[tab.icon as keyof typeof Icons] as any;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <IconComponent
                  size={verticalScale(16)}
                  color={
                    activeTab === tab.key ? colors.primary : colors.neutral400
                  }
                />
                <Typo
                  size={11}
                  color={
                    activeTab === tab.key ? colors.primary : colors.neutral400
                  }
                  fontWeight={activeTab === tab.key ? "600" : "400"}
                >
                  {tab.label}
                </Typo>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "trends" && renderTrends()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "goals" && renderGoals()}
        </View>
      </View>
    </Modal>
  );
};

export default ReportsModal;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    paddingTop: spacingY._20,
    height: "95%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._15,
  },
  exportButton: {
    padding: spacingX._5,
  },
  periodSelector: {
    flexDirection: "row",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._15,
    gap: spacingX._7,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacingY._7,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._6,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._15,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacingY._10,
    gap: spacingY._5,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  summaryCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._10,
    marginBottom: spacingY._20,
  },
  summaryCard: {
    width: "48%",
    padding: spacingX._15,
    borderRadius: radius._12,
    alignItems: "center",
    gap: spacingY._5,
  },
  insightsSection: {
    marginBottom: spacingY._20,
  },
  insightCard: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    marginBottom: spacingY._10,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginBottom: spacingY._7,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacingY._20,
  },
  metricItem: {
    alignItems: "center",
    gap: spacingY._5,
  },
  chartSection: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._20,
    alignItems: "center",
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
  },
  categoryList: {
    marginBottom: spacingY._20,
  },
  categoryItem: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    marginBottom: spacingY._10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacingY._7,
  },
  categoryIndicator: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
  categoryProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  categoryProgressBar: {
    flex: 1,
    height: verticalScale(6),
    backgroundColor: colors.neutral600,
    borderRadius: radius._6,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: radius._6,
  },
  section: {
    marginBottom: spacingY._25,
  },
  budgetStatusItem: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    marginBottom: spacingY._10,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._7,
  },
  statusBadge: {
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  budgetProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalStatusItem: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    marginBottom: spacingY._10,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._7,
  },
  goalProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
});
