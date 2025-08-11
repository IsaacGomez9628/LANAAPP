// LanaApp/app/(tabs)/wallet.tsx - VERSIÓN COMPLETAMENTE INTEGRADA
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import StatsCard from "@/components/StatsCard";
import AnimatedPieChart from "@/components/AnimatedPieChart";

// Importar componentes de wallet
import RecurringPaymentModal from "@/components/wallet/RecurringPaymentModal";
import RecurringPaymentCard from "@/components/wallet/RecurringPaymentCard";
import ExpenseModal from "@/components/wallet/ExpenseModal";
import RecentExpenses from "@/components/wallet/RecentExpenses";
import BudgetValidator from "@/components/wallet/BudgetValidator";

// Importar otros componentes
import NotificationBadge from "@/components/notifications/NotificationCenter";

// Importar servicios
import FinanceService from "@/services/FinanceService";
import NotificationService from "@/services/NotificationService";
import AppConfigService, { FinanceUtils } from "@/services/AppConfigService";

const { width: screenWidth } = Dimensions.get("window");

interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextPayment: Date;
  isActive: boolean;
  color: string;
  description?: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "planned" | "recurring" | "manual";
}

interface WalletAccount {
  id: string;
  name: string;
  balance: number;
  type: "checking" | "savings" | "credit" | "investment";
  color: string;
  isDefault: boolean;
}

const INITIAL_RECURRING_PAYMENTS: RecurringPayment[] = [
  {
    id: "1",
    name: "Renta",
    amount: 8000,
    category: "Servicios",
    frequency: "monthly",
    nextPayment: new Date(2025, 8, 1),
    isActive: true,
    color: colors.cyan,
    description: "Renta mensual del departamento",
  },
  {
    id: "2",
    name: "Netflix",
    amount: 250,
    category: "Entretenimiento",
    frequency: "monthly",
    nextPayment: new Date(2025, 7, 15),
    isActive: true,
    color: colors.purple,
    description: "Suscripción mensual a Netflix",
  },
  {
    id: "3",
    name: "Seguro Auto",
    amount: 1200,
    category: "Transporte",
    frequency: "monthly",
    nextPayment: new Date(2025, 7, 20),
    isActive: true,
    color: colors.blue,
    description: "Seguro del automóvil",
  },
  {
    id: "4",
    name: "Gym",
    amount: 450,
    category: "Salud",
    frequency: "monthly",
    nextPayment: new Date(2025, 7, 10),
    isActive: false,
    color: colors.green,
    description: "Membresía del gimnasio",
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: "1",
    amount: 450,
    category: "Comida",
    description: "Supermercado Soriana",
    date: new Date(2025, 7, 8),
    type: "manual",
  },
  {
    id: "2",
    amount: 250,
    category: "Entretenimiento",
    description: "Netflix - Pago recurrente",
    date: new Date(2025, 7, 5),
    type: "recurring",
  },
  {
    id: "3",
    amount: 75,
    category: "Transporte",
    description: "Gasolina",
    date: new Date(2025, 7, 7),
    type: "manual",
  },
  {
    id: "4",
    amount: 1200,
    category: "Servicios",
    description: "Electricidad",
    date: new Date(2025, 7, 1),
    type: "planned",
  },
];

const INITIAL_ACCOUNTS: WalletAccount[] = [
  {
    id: "1",
    name: "Cuenta Principal",
    balance: 15000,
    type: "checking",
    color: colors.blue,
    isDefault: true,
  },
  {
    id: "2",
    name: "Ahorros",
    balance: 25000,
    type: "savings",
    color: colors.green,
    isDefault: false,
  },
  {
    id: "3",
    name: "Inversiones",
    balance: 12000,
    type: "investment",
    color: colors.purple,
    isDefault: false,
  },
];

const Wallet = () => {
  // Estados principales
  const [activeSection, setActiveSection] = useState<
    "overview" | "payments" | "expenses" | "accounts"
  >("overview");
  const [recurringPayments, setRecurringPayments] = useState<
    RecurringPayment[]
  >(INITIAL_RECURRING_PAYMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [accounts, setAccounts] = useState<WalletAccount[]>(INITIAL_ACCOUNTS);

  // Estados de modales
  const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);

  // Estados de edición
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(
    null
  );
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount>(
    INITIAL_ACCOUNTS[0]
  );

  // Servicios
  const financeService = FinanceService.getInstance();
  const notificationService = NotificationService.getInstance();
  const appConfig = AppConfigService.getInstance();

  // Calcular estadísticas
  const walletStats = useMemo(() => {
    const activePayments = recurringPayments.filter((p) => p.isActive);

    // Pagos recurrentes
    const monthlyTotal = activePayments
      .filter((p) => p.frequency === "monthly")
      .reduce((sum, p) => sum + p.amount, 0);
    const weeklyTotal = activePayments
      .filter((p) => p.frequency === "weekly")
      .reduce((sum, p) => sum + p.amount * 4, 0);
    const yearlyTotal = activePayments
      .filter((p) => p.frequency === "yearly")
      .reduce((sum, p) => sum + p.amount / 12, 0);

    const totalMonthlyPayments = monthlyTotal + weeklyTotal + yearlyTotal;

    // Próximos pagos
    const upcomingPayments = activePayments
      .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime())
      .slice(0, 5);

    const dueSoon = upcomingPayments.filter((p) => {
      const daysUntil = Math.ceil(
        (p.nextPayment.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 7;
    });

    // Gastos por categoría
    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses.filter(
      (e) => e.date.getMonth() === currentMonth
    );
    const categoryExpenses = monthlyExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalMonthlyExpenses = monthlyExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    // Balances totales
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const checkingBalance = accounts
      .filter((acc) => acc.type === "checking")
      .reduce((sum, acc) => sum + acc.balance, 0);
    const savingsBalance = accounts
      .filter((acc) => acc.type === "savings")
      .reduce((sum, acc) => sum + acc.balance, 0);

    // Análisis de salud financiera
    const monthlyIncome = 15000; // Simulado
    const emergencyFundMonths = savingsBalance / (totalMonthlyExpenses || 1);
    const savingsRate =
      ((monthlyIncome - totalMonthlyExpenses) / monthlyIncome) * 100;

    // Proyección de flujo de efectivo
    const projectedBalance = checkingBalance - totalMonthlyPayments;
    const daysUntilEmpty =
      projectedBalance > 0
        ? Infinity
        : Math.abs(checkingBalance / (totalMonthlyExpenses / 30));

    return {
      // Pagos recurrentes
      totalMonthlyPayments,
      activePaymentsCount: activePayments.length,
      upcomingPayments,
      dueSoon,

      // Gastos
      monthlyExpenses,
      categoryExpenses,
      totalMonthlyExpenses,

      // Balances
      totalBalance,
      checkingBalance,
      savingsBalance,

      // Análisis
      emergencyFundMonths,
      savingsRate,
      projectedBalance,
      daysUntilEmpty,
    };
  }, [recurringPayments, expenses, accounts]);

  // Verificar notificaciones
  useEffect(() => {
    notificationService.checkPaymentDue(recurringPayments);
    notificationService.checkExpenseAlerts(expenses, selectedAccount.balance);
  }, [recurringPayments, expenses, selectedAccount]);

  // Manejar pagos recurrentes
  const handleSaveRecurringPayment = (
    paymentData: Omit<RecurringPayment, "id" | "nextPayment">
  ) => {
    const nextPayment = calculateNextPayment(paymentData.frequency);

    if (editingPayment) {
      setRecurringPayments((prev) =>
        prev.map((p) =>
          p.id === editingPayment.id ? { ...p, ...paymentData, nextPayment } : p
        )
      );
    } else {
      const newPayment: RecurringPayment = {
        ...paymentData,
        id: Date.now().toString(),
        nextPayment,
      };
      setRecurringPayments((prev) => [...prev, newPayment]);
    }

    setEditingPayment(null);
    setIsRecurringModalVisible(false);
  };

  const calculateNextPayment = (frequency: string): Date => {
    const now = new Date();
    switch (frequency) {
      case "daily":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "weekly":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "monthly":
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      case "yearly":
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear;
      default:
        return now;
    }
  };

  // Manejar gastos
  const handleSaveExpense = (expenseData: Omit<Expense, "id">) => {
    // Validar presupuesto antes de guardar
    if (!validateBudget(expenseData.category, expenseData.amount)) {
      return;
    }

    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Actualizar balance de la cuenta seleccionada
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === selectedAccount.id
          ? { ...acc, balance: acc.balance - expenseData.amount }
          : acc
      )
    );

    setIsExpenseModalVisible(false);
    appConfig.incrementTransactionCount();
  };

  const validateBudget = (category: string, amount: number): boolean => {
    // Simulación de validación de presupuesto
    const categoryBudgets = {
      Comida: { budget: 2000, spent: 1200 },
      Transporte: { budget: 800, spent: 650 },
      Entretenimiento: { budget: 500, spent: 450 },
      Servicios: { budget: 1500, spent: 1200 },
    } as Record<string, { budget: number; spent: number }>;

    const categoryData = categoryBudgets[category];
    if (!categoryData) return true;

    const newTotal = categoryData.spent + amount;
    const wouldExceedBudget = newTotal > categoryData.budget;
    const wouldGoNegative = selectedAccount.balance - amount < 0;

    if (wouldGoNegative) {
      Alert.alert(
        "⚠️ Saldo Insuficiente",
        `No tienes suficiente dinero en ${
          selectedAccount.name
        }. Saldo actual: ${appConfig.formatCurrency(selectedAccount.balance)}`,
        [{ text: "Entendido" }]
      );
      return false;
    }

    if (wouldExceedBudget) {
      Alert.alert(
        "⚠️ Presupuesto Excedido",
        `Este gasto excederá tu presupuesto de ${category} por ${appConfig.formatCurrency(
          newTotal - categoryData.budget
        )}. ¿Deseas continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar", onPress: () => true },
        ]
      );
      return false;
    }

    return true;
  };

  // Manejar operaciones de pagos
  const handleEditPayment = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setIsRecurringModalVisible(true);
  };

  const handleTogglePayment = (paymentId: string) => {
    setRecurringPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      "Eliminar Pago Recurrente",
      "¿Estás seguro de eliminar este pago recurrente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setRecurringPayments((prev) =>
              prev.filter((p) => p.id !== paymentId)
            );
          },
        },
      ]
    );
  };

  // Renderizar secciones
  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Selector de cuenta */}
      <View style={styles.accountSelector}>
        <Typo size={14} color={colors.neutral400}>
          Cuenta Activa
        </Typo>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.accountsScroll}
        >
          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountChip,
                selectedAccount.id === account.id && styles.selectedAccountChip,
                { borderColor: account.color },
              ]}
              onPress={() => setSelectedAccount(account)}
            >
              <View
                style={[
                  styles.accountIndicator,
                  { backgroundColor: account.color },
                ]}
              />
              <View>
                <Typo size={12} fontWeight="600">
                  {account.name}
                </Typo>
                <Typo size={10} color={colors.neutral400}>
                  {appConfig.formatCurrency(account.balance)}
                </Typo>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Balance principal */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Typo size={14} color={colors.neutral400}>
            {selectedAccount.name}
          </Typo>
          <TouchableOpacity>
            <Icons.Eye size={verticalScale(20)} color={colors.neutral400} />
          </TouchableOpacity>
        </View>
        <Typo size={32} fontWeight="700" color={colors.white}>
          {appConfig.formatCurrency(selectedAccount.balance)}
        </Typo>
        <View style={styles.balanceActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsExpenseModalVisible(true)}
          >
            <Icons.Minus size={verticalScale(20)} color={colors.white} />
            <Typo size={12} color={colors.white}>
              Gasto
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icons.Plus size={verticalScale(20)} color={colors.white} />
            <Typo size={12} color={colors.white}>
              Ingreso
            </Typo>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icons.ArrowsLeftRight
              size={verticalScale(20)}
              color={colors.white}
            />
            <Typo size={12} color={colors.white}>
              Transferir
            </Typo>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas principales */}
      <View style={styles.statsGrid}>
        <StatsCard
          title="Pagos Mensuales"
          value={walletStats.totalMonthlyPayments}
          icon="Clock"
          color={colors.rose}
          style={styles.statCard}
        />
        <StatsCard
          title="Total en Cuentas"
          value={walletStats.totalBalance}
          icon="Wallet"
          color={colors.blue}
          style={styles.statCard}
        />
      </View>

      {/* Alerta de salud financiera */}
      <BudgetValidator currentBalance={selectedAccount.balance} />

      {/* Próximos pagos */}
      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Typo size={16} fontWeight="600">
            ⏰ Próximos Pagos
          </Typo>
          {walletStats.dueSoon.length > 0 && (
            <NotificationBadge
              count={walletStats.dueSoon.length}
              onPress={() => {}}
              size="small"
            />
          )}
        </View>
        {walletStats.upcomingPayments.slice(0, 3).map((payment) => {
          const daysUntil = Math.ceil(
            (payment.nextPayment.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const isDueSoon = daysUntil <= 7;

          return (
            <View
              key={payment.id}
              style={[
                styles.upcomingPayment,
                isDueSoon && styles.urgentPayment,
              ]}
            >
              <View
                style={[styles.paymentDot, { backgroundColor: payment.color }]}
              />
              <View style={styles.paymentInfo}>
                <Typo size={14} fontWeight="500">
                  {payment.name}
                </Typo>
                <Typo
                  size={12}
                  color={isDueSoon ? colors.yellow : colors.neutral400}
                >
                  {daysUntil === 0
                    ? "Hoy"
                    : daysUntil === 1
                    ? "Mañana"
                    : `En ${daysUntil} días`}
                </Typo>
              </View>
              <Typo size={16} fontWeight="600" color={payment.color}>
                {appConfig.formatCurrency(payment.amount)}
              </Typo>
            </View>
          );
        })}
      </View>

      {/* Gráfica de gastos por categoría */}
      <View style={styles.chartSection}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          📊 Gastos por Categoría
        </Typo>
        {Object.keys(walletStats.categoryExpenses).length > 0 ? (
          <AnimatedPieChart
            data={Object.entries(walletStats.categoryExpenses).map(
              ([name, amount], index) => ({
                value: amount,
                color: FinanceUtils.generateColorPalette(
                  Object.keys(walletStats.categoryExpenses).length
                )[index],
                label: name,
              })
            )}
            size={200}
            innerRadius={50}
            showLabels={true}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Icons.ChartPie
              size={verticalScale(40)}
              color={colors.neutral600}
            />
            <Typo size={14} color={colors.neutral400}>
              No hay gastos este mes
            </Typo>
          </View>
        )}
      </View>

      {/* Análisis financiero rápido */}
      <View style={styles.analysisSection}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
          🎯 Análisis Rápido
        </Typo>
        <View style={styles.analysisGrid}>
          <View style={styles.analysisItem}>
            <Icons.ShieldCheck
              size={verticalScale(20)}
              color={
                walletStats.emergencyFundMonths >= 6
                  ? colors.green
                  : walletStats.emergencyFundMonths >= 3
                  ? colors.yellow
                  : colors.rose
              }
            />
            <Typo size={12} color={colors.neutral400}>
              Fondo de Emergencia
            </Typo>
            <Typo
              size={14}
              fontWeight="600"
              color={
                walletStats.emergencyFundMonths >= 6
                  ? colors.green
                  : walletStats.emergencyFundMonths >= 3
                  ? colors.yellow
                  : colors.rose
              }
            >
              {walletStats.emergencyFundMonths.toFixed(1)} meses
            </Typo>
          </View>

          <View style={styles.analysisItem}>
            <Icons.TrendUp
              size={verticalScale(20)}
              color={
                walletStats.savingsRate >= 20
                  ? colors.green
                  : walletStats.savingsRate >= 10
                  ? colors.yellow
                  : colors.rose
              }
            />
            <Typo size={12} color={colors.neutral400}>
              Tasa de Ahorro
            </Typo>
            <Typo
              size={14}
              fontWeight="600"
              color={
                walletStats.savingsRate >= 20
                  ? colors.green
                  : walletStats.savingsRate >= 10
                  ? colors.yellow
                  : colors.rose
              }
            >
              {walletStats.savingsRate.toFixed(1)}%
            </Typo>
          </View>

          <View style={styles.analysisItem}>
            <Icons.Calendar
              size={verticalScale(20)}
              color={
                walletStats.projectedBalance > 0 ? colors.green : colors.rose
              }
            />
            <Typo size={12} color={colors.neutral400}>
              Balance Proyectado
            </Typo>
            <Typo
              size={14}
              fontWeight="600"
              color={
                walletStats.projectedBalance > 0 ? colors.green : colors.rose
              }
            >
              {appConfig.formatCurrency(walletStats.projectedBalance)}
            </Typo>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderPayments = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Pagos Recurrentes
        </Typo>
        <TouchableOpacity
          onPress={() => setIsRecurringModalVisible(true)}
          style={styles.addButton}
        >
          <Icons.Plus
            size={verticalScale(20)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {/* Resumen de pagos */}
      <View style={styles.paymentsSummary}>
        <View style={styles.summaryItem}>
          <Typo size={12} color={colors.neutral400}>
            Total Mensual
          </Typo>
          <Typo size={20} fontWeight="700" color={colors.rose}>
            {appConfig.formatCurrency(walletStats.totalMonthlyPayments)}
          </Typo>
        </View>
        <View style={styles.summaryItem}>
          <Typo size={12} color={colors.neutral400}>
            Pagos Activos
          </Typo>
          <Typo size={20} fontWeight="700" color={colors.blue}>
            {walletStats.activePaymentsCount}
          </Typo>
        </View>
      </View>

      {recurringPayments.map((payment, index) => (
        <RecurringPaymentCard
          key={payment.id}
          payment={payment}
          onEdit={() => handleEditPayment(payment)}
          onToggle={() => handleTogglePayment(payment.id)}
          onDelete={() => handleDeletePayment(payment.id)}
          delay={index * 100}
        />
      ))}
    </ScrollView>
  );

  const renderExpenses = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Gestión de Gastos
        </Typo>
        <TouchableOpacity
          onPress={() => setIsExpenseModalVisible(true)}
          style={styles.addButton}
        >
          <Icons.Plus
            size={verticalScale(20)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      <RecentExpenses expenses={expenses} />
    </ScrollView>
  );

  const renderAccounts = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Typo size={18} fontWeight="600">
          Mis Cuentas
        </Typo>
        <TouchableOpacity
          onPress={() => setIsAccountModalVisible(true)}
          style={styles.addButton}
        >
          <Icons.Plus
            size={verticalScale(20)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>
      </View>

      {accounts.map((account, index) => (
        <View key={account.id} style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.accountInfo}>
              <View
                style={[
                  styles.accountIcon,
                  { backgroundColor: account.color + "20" },
                ]}
              >
                <Icons.Wallet size={verticalScale(20)} color={account.color} />
              </View>
              <View>
                <Typo size={16} fontWeight="600">
                  {account.name}
                </Typo>
                <Typo size={12} color={colors.neutral400}>
                  {account.type === "checking"
                    ? "Cuenta Corriente"
                    : account.type === "savings"
                    ? "Ahorros"
                    : account.type === "credit"
                    ? "Crédito"
                    : "Inversión"}
                </Typo>
              </View>
            </View>
            {account.isDefault && (
              <View style={styles.defaultBadge}>
                <Typo size={10} color={colors.primary}>
                  Principal
                </Typo>
              </View>
            )}
          </View>
          <Typo size={24} fontWeight="700" color={account.color}>
            {appConfig.formatCurrency(account.balance)}
          </Typo>
        </View>
      ))}

      {/* Resumen total */}
      <View style={styles.totalCard}>
        <Typo size={16} fontWeight="600" color={colors.neutral400}>
          Balance Total
        </Typo>
        <Typo size={28} fontWeight="700" color={colors.white}>
          {appConfig.formatCurrency(walletStats.totalBalance)}
        </Typo>
      </View>
    </ScrollView>
  );

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        <Header title="Mi Billetera" style={{ marginBottom: spacingY._20 }} />

        {/* Navegación por secciones */}
        <View style={styles.sectionTabs}>
          {[
            { key: "overview", label: "Resumen", icon: "House" },
            { key: "payments", label: "Pagos", icon: "Clock" },
            { key: "expenses", label: "Gastos", icon: "TrendDown" },
            { key: "accounts", label: "Cuentas", icon: "Wallet" },
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
                  size={verticalScale(16)}
                  color={
                    activeSection === tab.key
                      ? colors.primary
                      : colors.neutral400
                  }
                />
                <Typo
                  size={11}
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
          {activeSection === "payments" && renderPayments()}
          {activeSection === "expenses" && renderExpenses()}
          {activeSection === "accounts" && renderAccounts()}
        </View>

        {/* Modales */}
        <RecurringPaymentModal
          isVisible={isRecurringModalVisible}
          onClose={() => {
            setIsRecurringModalVisible(false);
            setEditingPayment(null);
          }}
          onSave={handleSaveRecurringPayment}
          editingPayment={editingPayment}
        />

        <ExpenseModal
          isVisible={isExpenseModalVisible}
          onClose={() => setIsExpenseModalVisible(false)}
          onSave={handleSaveExpense}
          currentBalance={selectedAccount.balance}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingY._5,
    paddingVertical: spacingY._10,
    borderRadius: radius._6,
  },
  activeSectionTab: {
    backgroundColor: colors.neutral700,
  },
  content: {
    flex: 1,
  },
  accountSelector: {
    marginBottom: spacingY._15,
  },
  accountsScroll: {
    marginTop: spacingY._7,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    backgroundColor: colors.neutral800,
    borderRadius: radius._10,
    padding: spacingX._10,
    marginRight: spacingX._10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedAccountChip: {
    backgroundColor: colors.neutral700,
  },
  accountIndicator: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
  },
  balanceCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacingY._20,
    paddingTop: spacingY._15,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  actionButton: {
    alignItems: "center",
    gap: spacingY._5,
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacingX._10,
    marginBottom: spacingY._20,
  },
  statCard: {
    flex: 1,
  },
  upcomingSection: {
    marginBottom: spacingY._20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: verticalScale(18),
    justifyContent: "center",
    alignItems: "center",
  },
  upcomingPayment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginBottom: spacingY._7,
  },
  urgentPayment: {
    borderLeftWidth: 4,
    borderLeftColor: colors.yellow,
  },
  paymentDot: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
    marginRight: spacingX._12,
  },
  paymentInfo: {
    flex: 1,
  },
  chartSection: {
    backgroundColor: colors.neutral800,
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
  analysisSection: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    marginBottom: spacingY._40,
  },
  analysisGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  analysisItem: {
    alignItems: "center",
    gap: spacingY._5,
    flex: 1,
  },
  paymentsSummary: {
    flexDirection: "row",
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  accountCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._10,
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  accountIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: radius._10,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  totalCard: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._15,
    padding: spacingX._20,
    alignItems: "center",
    marginTop: spacingY._10,
    marginBottom: spacingY._40,
  },
});
