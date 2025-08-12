// LanaApp/app/(tabs)/statistics.tsx - VERSIÓN COMPLETAMENTE INTEGRADA
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import AnimatedPieChart from "@/components/AnimatedPieChart";
import StatsCard from "@/components/StatsCard";

// Importar componentes de presupuestos
import BudgetCard from "@/components/budget/BudgetCard";
import BudgetModal from "@/components/budget/BudgetModal";
import CategoryChart from "@/components/budget/CategoryChart";

// Importar componentes de metas de ahorro
import SavingsGoalsModal from "@/components/savings/SavingsGoalsModal";
import SavingsGoalCard from "@/components/savings/SavingsGoalCard";
import AddMoneyModal from "@/components/savings/AddMoneyModal";

// Importar reportes
import ReportsModal from "@/components/reports/ReportsModal";

// Importar servicios
import AppConfigService, { FinanceUtils } from "@/services/AppConfigService";
import NotificationService from "@/services/NotificationService";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  color: string;
  period: "monthly" | "weekly" | "daily";
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: "high" | "medium" | "low";
  color: string;
  description: string;
  isActive: boolean;
  monthlyTarget: number;
}

const INITIAL_BUDGETS: Budget[] = [
  {
    id: "1",
    category: "Comida",
    amount: 2000,
    spent: 1200,
    color: colors.orange,
    period: "monthly",
  },
  {
    id: "2",
    category: "Transporte",
    amount: 800,
    spent: 650,
    color: colors.blue,
    period: "monthly",
  },
  {
    id: "3",
    category: "Entretenimiento",
    amount: 500,
    spent: 750,
    color: colors.purple,
    period: "monthly",
  },
  {
    id: "4",
    category: "Servicios",
    amount: 1500,
    spent: 1200,
    color: colors.cyan,
    period: "monthly",
  },
];

const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: "1",
    name: "Fondo de Emergencia",
    targetAmount: 50000,
    currentAmount: 15000,
    deadline: new Date(2025, 11, 31),
    category: "Emergencias",
    priority: "high",
    color: colors.rose,
    description: "Fondo para emergencias de 6 meses de gastos",
    isActive: true,
    monthlyTarget: 8750,
  },
  {
    id: "2",
    name: "Vacaciones Europa",
    targetAmount: 25000,
    currentAmount: 8500,
    deadline: new Date(2025, 5, 15),
    category: "Vacaciones",
    priority: "medium",
    color: colors.blue,
    description: "Viaje de 2 semanas a Europa",
    isActive: true,
    monthlyTarget: 2750,
  },
  {
    id: "3",
    name: "Auto Nuevo",
    targetAmount: 80000,
    currentAmount: 12000,
    deadline: new Date(2026, 2, 31),
    category: "Auto",
    priority: "medium",
    color: colors.green,
    description: "Enganche para auto nuevo",
    isActive: true,
    monthlyTarget: 11333,
  },
];

const Statistics = () => {
  // Estados principales
  const [activeSection, setActiveSection] = useState<
    "overview" | "budgets" | "goals"
  >("overview");
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(
    INITIAL_SAVINGS_GOALS
  );
  const [currentBalance] = useState(15000);

  // Estados de modales
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isSavingsModalVisible, setIsSavingsModalVisible] = useState(false);
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);
  const [isReportsModalVisible, setIsReportsModalVisible] = useState(false);

  // Estados de edición
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingSavingsGoal, setEditingSavingsGoal] =
    useState<SavingsGoal | null>(null);
  const [selectedGoalForMoney, setSelectedGoalForMoney] =
    useState<SavingsGoal | null>(null);

  // Servicios
  const appConfig = AppConfigService.getInstance();
  const notificationService = NotificationService.getInstance();

  // Estadísticas combinadas
  const combinedStats = useMemo(() => {
    // Estadísticas de presupuestos
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const exceededBudgets = budgets.filter((b) => b.spent > b.amount);
    const remainingBudget = totalBudget - totalSpent;

    // Estadísticas de metas de ahorro
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
    const totalMonthlyTarget = activeGoals.reduce(
      (sum, g) => sum + g.monthlyTarget,
      0
    );

    // Análisis de salud financiera
    const healthData = {
      income: 15000, // Simulado
      expenses: totalSpent,
      savings: totalSavingsCurrent,
      debt: 0, // Simulado
      emergencyFund: currentBalance,
    };

    const healthScore = FinanceUtils.getFinancialHealthScore(healthData);

    // Gráficas de distribución
    const budgetChartData = budgets.map((budget) => ({
      value: budget.spent,
      color: budget.color,
      label: budget.category,
    }));

    const goalsChartData = activeGoals.map((goal) => ({
      value: goal.currentAmount,
      color: goal.color,
      label: goal.name.substring(0, 10),
    }));

    return {
      // Presupuestos
      totalBudget,
      totalSpent,
      budgetUsage,
      exceededBudgets,
      remainingBudget,
      budgetChartData,

      // Metas de ahorro
      activeGoals,
      completedGoals,
      totalSavingsTarget,
      totalSavingsCurrent,
      savingsProgress,
      totalMonthlyTarget,
      goalsChartData,

      // Salud financiera
      healthScore,
    };
  }, [budgets, savingsGoals, currentBalance]);

  // Verificar notificaciones al cargar
  useEffect(() => {
    notificationService.checkBudgetWarnings(budgets);
    notificationService.checkGoalReminders(savingsGoals);
  }, [budgets, savingsGoals]);

  // Manejar presupuestos
  const handleSaveBudget = (budgetData: Omit<Budget, "id" | "spent">) => {
    if (editingBudget) {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === editingBudget.id ? { ...b, ...budgetData } : b
        )
      );
    } else {
      const newBudget: Budget = {
        ...budgetData,
        id: Date.now().toString(),
        spent: 0,
      };
      setBudgets((prev) => [...prev, newBudget]);
    }
    setEditingBudget(null);
    setIsBudgetModalVisible(false);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalVisible(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      "Eliminar Presupuesto",
      "¿Estás seguro de eliminar este presupuesto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
          },
        },
      ]
    );
  };

  // Manejar metas de ahorro
  const handleSaveSavingsGoal = (
    goalData: Omit<SavingsGoal, "id" | "currentAmount" | "monthlyTarget">
  ) => {
    const monthsToDeadline = Math.ceil(
      (goalData.deadline.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
    const monthlyTarget = goalData.targetAmount / Math.max(monthsToDeadline, 1);

    if (editingSavingsGoal) {
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === editingSavingsGoal.id
            ? { ...g, ...goalData, monthlyTarget }
            : g
        )
      );
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: Date.now().toString(),
        currentAmount: 0,
        monthlyTarget,
      };
      setSavingsGoals((prev) => [...prev, newGoal]);
    }

    setEditingSavingsGoal(null);
    setIsSavingsModalVisible(false);
  };

  const handleEditSavingsGoal = (goal: SavingsGoal) => {
    setEditingSavingsGoal(goal);
    setIsSavingsModalVisible(true);
  };

  const handleDeleteSavingsGoal = (goalId: string) => {
    Alert.alert(
      "Eliminar Meta",
      "¿Estás seguro de eliminar esta meta de ahorro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
          },
        },
      ]
    );
  };

  const handleAddMoneyToGoal = (amount: number, description: string) => {
    if (!selectedGoalForMoney) return;

    // Actualizar la meta
    setSavingsGoals((prev) =>
      prev.map((g) =>
        g.id === selectedGoalForMoney.id
          ? { ...g, currentAmount: g.currentAmount + amount }
          : g
      )
    );

    setIsAddMoneyModalVisible(false);
    setSelectedGoalForMoney(null);

    // Verificar si se completó la meta
    const updatedGoal = {
      ...selectedGoalForMoney,
      currentAmount: selectedGoalForMoney.currentAmount + amount,
    };
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
      Alert.alert(
        "🎉 ¡Meta Completada!",
        `Has alcanzado tu meta '${updatedGoal.name}'. ¡Felicidades!`,
        [{ text: "¡Genial!" }]
      );
      appConfig.incrementGoalsCompleted();
    }
  };

  // Datos para reportes
  const reportData = {
    transactions: [], // Aquí irían las transacciones reales
    budgets,
    savingsGoals,
    currentBalance,
    period: "month" as const,
  };

  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Resumen de salud financiera */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <View style={styles.healthScore}>
            <View
              style={[
                styles.healthCircle,
                {
                  borderColor:
                    combinedStats.healthScore.level === "excellent"
                      ? colors.green
                      : combinedStats.healthScore.level === "good"
                      ? colors.blue
                      : combinedStats.healthScore.level === "fair"
                      ? colors.yellow
                      : colors.rose,
                },
              ]}
            >
              <Typo
                size={24}
                fontWeight="700"
                color={
                  combinedStats.healthScore.level === "excellent"
                    ? colors.green
                    : combinedStats.healthScore.level === "good"
                    ? colors.blue
                    : combinedStats.healthScore.level === "fair"
                    ? colors.yellow
                    : colors.rose
                }
              >
                {combinedStats.healthScore.score}
              </Typo>
            </View>
            <View>
              <Typo size={16} fontWeight="600">
                Salud Financiera
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                {combinedStats.healthScore.level === "excellent"
                  ? "Excelente"
                  : combinedStats.healthScore.level === "good"
                  ? "Buena"
                  : combinedStats.healthScore.level === "fair"
                  ? "Regular"
                  : "Necesita Atención"}
              </Typo>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsReportsModalVisible(true)}
            style={styles.reportButton}
          >
            <Icons.ChartLine size={verticalScale(20)} color={colors.primary} />
            <Typo size={12} color={colors.primary}>
              Ver Reporte
            </Typo>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Presupuesto Total"
          value={combinedStats.totalBudget}
          icon="Target"
          color={colors.blue}
          delay={0}
          style={styles.statCard}
        />
        <StatsCard
          title="Gastado"
          value={combinedStats.totalSpent}
          icon="TrendDown"
          color={colors.rose}
          delay={100}
          style={styles.statCard}
        />
      </View>

      <View style={styles.statsContainer}>
        <StatsCard
          title="Metas Activas"
          value={combinedStats.activeGoals.length}
          icon="Flag"
          color={colors.green}
          prefix=""
          suffix=" metas"
          delay={200}
          style={styles.statCard}
        />
        <StatsCard
          title="Progreso de Ahorro"
          value={combinedStats.savingsProgress}
          icon="PiggyBank"
          color={colors.yellow}
          prefix=""
          suffix="%"
          delay={300}
          style={styles.statCard}
        />
      </View>

      {/* Alertas importantes */}
      {(combinedStats.exceededBudgets.length > 0 ||
        combinedStats.healthScore.recommendations.length > 0) && (
        <View style={styles.alertsSection}>
          <View style={styles.alertHeader}>
            <Icons.Warning size={verticalScale(20)} color={colors.yellow} />
            <Typo size={16} fontWeight="600" color={colors.yellow}>
              Alertas y Recomendaciones
            </Typo>
          </View>

          {combinedStats.exceededBudgets.map((budget) => (
            <View key={budget.id} style={styles.alertItem}>
              <Icons.TrendUp size={verticalScale(16)} color={colors.rose} />
              <Typo size={14} color={colors.white}>
                {budget.category}: Excedido por $
                {(budget.spent - budget.amount).toLocaleString("es-MX")}
              </Typo>
            </View>
          ))}

          {combinedStats.healthScore.recommendations
            .slice(0, 2)
            .map((rec, index) => (
              <View key={index} style={styles.alertItem}>
                <Icons.Lightbulb size={verticalScale(16)} color={colors.blue} />
                <Typo size={14} color={colors.neutral300}>
                  {rec}
                </Typo>
              </View>
            ))}
        </View>
      )}

      {/* Gráficas de distribución */}
      <View style={styles.chartsContainer}>
        <View style={styles.chartCard}>
          <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
            📊 Distribución de Presupuestos
          </Typo>
          <AnimatedPieChart
            data={combinedStats.budgetChartData}
            size={200}
            innerRadius={50}
            showLabels={true}
          />
        </View>

        <View style={styles.chartCard}>
          <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
            🎯 Progreso de Metas
          </Typo>
          <AnimatedPieChart
            data={combinedStats.goalsChartData}
            size={200}
            innerRadius={50}
            showLabels={true}
          />
        </View>
      </View>

      {/* Resumen rápido */}
      <View style={styles.quickSummary}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          📋 Resumen Rápido
        </Typo>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Typo size={12} color={colors.neutral400}>
              Uso de Presupuesto
            </Typo>
            <Typo
              size={18}
              fontWeight="600"
              color={
                combinedStats.budgetUsage > 90
                  ? colors.rose
                  : combinedStats.budgetUsage > 70
                  ? colors.yellow
                  : colors.green
              }
            >
              {combinedStats.budgetUsage.toFixed(1)}%
            </Typo>
          </View>
          <View style={styles.summaryItem}>
            <Typo size={12} color={colors.neutral400}>
              Metas Completadas
            </Typo>
            <Typo size={18} fontWeight="600" color={colors.green}>
              {combinedStats.completedGoals.length}
            </Typo>
          </View>
          <View style={styles.summaryItem}>
            <Typo size={12} color={colors.neutral400}>
              Meta Mensual
            </Typo>
            <Typo size={18} fontWeight="600" color={colors.blue}>
              ${combinedStats.totalMonthlyTarget.toLocaleString("es-MX")}
            </Typo>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderBudgets = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Mis Presupuestos
        </Typo>
        <TouchableOpacity
          onPress={() => setIsBudgetModalVisible(true)}
          style={styles.addButton}
        >
          <Icons.Plus
            size={verticalScale(20)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {budgets.map((budget, index) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={() => handleEditBudget(budget)}
          onDelete={() => handleDeleteBudget(budget.id)}
          delay={index * 100}
        />
      ))}

      {/* Análisis de tendencias */}
      <View style={styles.trendContainer}>
        <Typo size={18} fontWeight="600" style={{ marginBottom: 15 }}>
          📈 Análisis de Tendencias
        </Typo>
        <CategoryChart budgets={budgets} />
      </View>
    </ScrollView>
  );

  const renderGoals = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Metas de Ahorro
        </Typo>
        <TouchableOpacity
          onPress={() => setIsSavingsModalVisible(true)}
          style={styles.addButton}
        >
          <Icons.Plus
            size={verticalScale(20)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {savingsGoals.map((goal, index) => (
        <SavingsGoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => handleEditSavingsGoal(goal)}
          onDelete={() => handleDeleteSavingsGoal(goal.id)}
          onAddMoney={() => {
            setSelectedGoalForMoney(goal);
            setIsAddMoneyModalVisible(true);
          }}
          delay={index * 100}
        />
      ))}

      {/* Consejos para ahorrar */}
      <View style={styles.tipsContainer}>
        <Typo size={18} fontWeight="600" style={{ marginBottom: 15 }}>
          💡 Consejos para Ahorrar
        </Typo>
        <View style={styles.tipsGrid}>
          <View style={styles.tipCard}>
            <Icons.Target size={verticalScale(24)} color={colors.green} />
            <Typo size={14} fontWeight="600">
              Automatiza
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              Configura transferencias automáticas a tus metas
            </Typo>
          </View>
          <View style={styles.tipCard}>
            <Icons.ChartLine size={verticalScale(24)} color={colors.blue} />
            <Typo size={14} fontWeight="600">
              Revisa
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              Ajusta tus metas cada 3 meses
            </Typo>
          </View>
          <View style={styles.tipCard}>
            <Icons.Trophy size={verticalScale(24)} color={colors.yellow} />
            <Typo size={14} fontWeight="600">
              Celebra
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              Reconoce cada logro alcanzado
            </Typo>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        <Header
          title="Análisis Financiero"
          style={{ marginBottom: spacingY._20 }}
        />

        {/* Navegación por secciones */}
        <View style={styles.sectionTabs}>
          {[
            { key: "overview", label: "Resumen", icon: "ChartPie" },
            { key: "budgets", label: "Presupuestos", icon: "Target" },
            { key: "goals", label: "Metas", icon: "Flag" },
          ].map((tab) => {
            const IconComponent = Icons[tab.icon as keyof typeof Icons] as any;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.sectionTab,
                  activeSection === tab.key && styles.activeSectionTab,
                ]}
                onPress={() => setActiveSection(tab.key as any)}
              >
                <IconComponent
                  size={verticalScale(18)}
                  color={
                    activeSection === tab.key
                      ? colors.primary
                      : colors.neutral400
                  }
                />
                <Typo
                  size={12}
                  color={
                    activeSection === tab.key
                      ? colors.primary
                      : colors.neutral400
                  }
                  fontWeight={activeSection === tab.key ? "600" : "400"}
                >
                  {tab.label}
                </Typo>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Contenido según sección */}
        <View style={styles.content}>
          {activeSection === "overview" && renderOverview()}
          {activeSection === "budgets" && renderBudgets()}
          {activeSection === "goals" && renderGoals()}
        </View>

        {/* Modales */}
        <BudgetModal
          isVisible={isBudgetModalVisible}
          onClose={() => {
            setIsBudgetModalVisible(false);
            setEditingBudget(null);
          }}
          onSave={handleSaveBudget}
          editingBudget={editingBudget}
        />

        <SavingsGoalsModal
          isVisible={isSavingsModalVisible}
          onClose={() => {
            setIsSavingsModalVisible(false);
            setEditingSavingsGoal(null);
          }}
          onSave={handleSaveSavingsGoal}
          editingGoal={editingSavingsGoal}
        />

        <AddMoneyModal
          isVisible={isAddMoneyModalVisible}
          onClose={() => {
            setIsAddMoneyModalVisible(false);
            setSelectedGoalForMoney(null);
          }}
          onSave={handleAddMoneyToGoal}
          goal={selectedGoalForMoney}
          currentBalance={currentBalance}
        />

        <ReportsModal
          isVisible={isReportsModalVisible}
          onClose={() => setIsReportsModalVisible(false)}
          reportData={reportData}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  sectionTabs: {
    flexDirection: "row",
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    marginBottom: spacingY._20,
    padding: spacingX._5,
  },
  sectionTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._5,
    paddingVertical: spacingY._10,
    borderRadius: radius._6,
  },
  activeSectionTab: {
    backgroundColor: colors.neutral700,
  },
  content: {
    flex: 1,
  },
  healthCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._20,
  },
  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    backgroundColor: colors.neutral700,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: radius._10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacingY._15,
    gap: spacingX._10,
  },
  statCard: {
    flex: 1,
  },
  alertsSection: {
    backgroundColor: colors.yellow + "10",
    borderWidth: 1,
    borderColor: colors.yellow + "30",
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._20,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginBottom: spacingY._15,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginBottom: spacingY._7,
  },
  chartsContainer: {
    marginBottom: spacingY._20,
  },
  chartCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._15,
    alignItems: "center",
  },
  quickSummary: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._20,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._20,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: verticalScale(18),
    justifyContent: "center",
    alignItems: "center",
  },
  trendContainer: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._40,
  },
  tipsContainer: {
    marginBottom: spacingY._40,
  },
  tipsGrid: {
    flexDirection: "row",
    gap: spacingX._10,
  },
  tipCard: {
    flex: 1,
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    alignItems: "center",
    gap: spacingY._7,
  },
});
