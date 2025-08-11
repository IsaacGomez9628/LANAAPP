// LanaApp/app/(tabs)/index.tsx - VERSIÓN MEJORADA
import React, { useState, useMemo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";

// Importar componentes de transacciones mejorados
import TransactionHeader from "@/components/transactions/TransactionHeader";
import TransactionTabs from "@/components/transactions/TransactionTabs";
import TransactionTotalsBar from "@/components/transactions/TransactionTotalBar";
import CalendarView from "@/components/transactions/CalendarView";
import MonthlyView from "@/components/transactions/MonthlyView";
import SummaryView from "@/components/transactions/SummaryView";
import { EnhancedAddTransactionModal } from "@/components/transactions/EnhancedAddTransactionModal";
import TransactionSearchModal from "@/components/transactions/TransactionSearchModal";
import TransactionDetailsModal from "@/components/transactions/TransactionDetailsModal";
import QuickStatsOverlay from "@/components/transactions/QuickStatsOverlay";

// Importar tipos y datos
import {
  Transaction,
  TabType,
  INITIAL_TRANSACTIONS,
} from "@/constants/transactions";

// Importar servicio de finanzas
import FinanceService from "@/services/FinanceService";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear] = useState(2025);
  const [totalBudget] = useState(10000);
  const [currentBalance, setCurrentBalance] = useState(15000);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);

  // Inicializar servicio de finanzas
  const financeService = FinanceService.getInstance();

  useEffect(() => {
    financeService.setTransactions(transactions);
    financeService.setCurrentBalance(currentBalance);
  }, [transactions, currentBalance]);

  // Calcular totales del mes actual
  const monthlyTotals = useMemo(() => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return tMonth === currentMonth && tYear === currentYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      total: income - expenses,
      count: monthTransactions.length,
      averageExpense:
        expenses /
        Math.max(
          monthTransactions.filter((t) => t.type === "expense").length,
          1
        ),
    };
  }, [transactions, selectedMonth]);

  // Estadísticas adicionales
  const transactionStats = useMemo(() => {
    const today = new Date();
    const todayTransactions = transactions.filter(
      (t) => t.date.toDateString() === today.toDateString()
    );

    const thisWeek = transactions.filter((t) => {
      const daysDiff = Math.floor(
        (today.getTime() - t.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff >= 0 && daysDiff < 7;
    });

    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(expensesByCategory).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      todayCount: todayTransactions.length,
      weeklyCount: thisWeek.length,
      topCategory: topCategory
        ? { name: topCategory[0], amount: topCategory[1] }
        : null,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  // Cambiar mes
  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedMonth);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  // Agregar nueva transacción
  const handleAddTransaction = (
    newTransactionData: Omit<Transaction, "id">
  ) => {
    const newTransaction: Transaction = {
      ...newTransactionData,
      id: Date.now().toString(),
    };

    setTransactions([newTransaction, ...transactions]);

    // Actualizar balance
    if (newTransaction.type === "income") {
      setCurrentBalance((prev) => prev + newTransaction.amount);
    } else if (newTransaction.type === "expense") {
      setCurrentBalance((prev) => prev - newTransaction.amount);
    }

    // Actualizar presupuesto si es gasto
    if (newTransaction.type === "expense") {
      financeService.updateBudgetSpending(
        newTransaction.category,
        newTransaction.amount,
        "add"
      );
    }

    setIsModalVisible(false);

    // Mostrar feedback de éxito
    Alert.alert(
      "✅ Transacción Guardada",
      `${
        newTransaction.type === "income" ? "Ingreso" : "Gasto"
      } de $${newTransaction.amount.toLocaleString(
        "es-MX"
      )} registrado correctamente.`,
      [{ text: "Continuar" }]
    );
  };

  // Editar transacción
  const handleEditTransaction = (updatedTransaction: Transaction) => {
    const originalTransaction = transactions.find(
      (t) => t.id === updatedTransaction.id
    );
    if (!originalTransaction) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );

    // Ajustar balance
    const balanceChange =
      (updatedTransaction.type === "income"
        ? updatedTransaction.amount
        : -updatedTransaction.amount) -
      (originalTransaction.type === "income"
        ? originalTransaction.amount
        : -originalTransaction.amount);

    setCurrentBalance((prev) => prev + balanceChange);

    setIsDetailsModalVisible(false);
    setSelectedTransaction(null);
  };

  // Eliminar transacción
  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    Alert.alert(
      "Eliminar Transacción",
      "¿Estás seguro de que quieres eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setTransactions((prev) =>
              prev.filter((t) => t.id !== transactionId)
            );

            // Ajustar balance
            if (transaction.type === "income") {
              setCurrentBalance((prev) => prev - transaction.amount);
            } else if (transaction.type === "expense") {
              setCurrentBalance((prev) => prev + transaction.amount);
              financeService.updateBudgetSpending(
                transaction.category,
                transaction.amount,
                "subtract"
              );
            }

            setIsDetailsModalVisible(false);
            setSelectedTransaction(null);
          },
        },
      ]
    );
  };

  // Buscar transacciones
  const handleSearch = (query: string, filters: any) => {
    let results = transactions;

    if (query) {
      results = results.filter(
        (t) =>
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.type && filters.type !== "all") {
      results = results.filter((t) => t.type === filters.type);
    }

    if (filters.category && filters.category !== "all") {
      results = results.filter((t) => t.category === filters.category);
    }

    if (filters.importance && filters.importance !== "all") {
      results = results.filter((t) => t.importance === filters.importance);
    }

    if (filters.dateRange) {
      results = results.filter((t) => {
        const transactionDate = t.date.getTime();
        return (
          transactionDate >= filters.dateRange.start.getTime() &&
          transactionDate <= filters.dateRange.end.getTime()
        );
      });
    }

    setSearchResults(results);
  };

  // Ver detalles de transacción
  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalVisible(true);
  };

  // Renderizar contenido según tab activa
  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <CalendarView
            transactions={transactions}
            selectedMonth={selectedMonth}
            onTransactionPress={handleTransactionPress}
          />
        );
      case "monthly":
        return (
          <MonthlyView
            transactions={transactions}
            selectedMonth={selectedMonth}
            monthlyTotals={monthlyTotals}
            onTransactionPress={handleTransactionPress}
          />
        );
      case "summary":
        return (
          <SummaryView
            transactions={transactions}
            monthlyTotals={monthlyTotals}
            totalBudget={totalBudget}
            currentBalance={currentBalance}
            onTransactionPress={handleTransactionPress}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        {/* Header */}
        <TransactionHeader
          onSearch={() => setIsSearchModalVisible(true)}
          onFavorite={() => setShowQuickStats(!showQuickStats)}
          onMenu={() => console.log("Menu")}
        />

        {/* Overlay de estadísticas rápidas */}
        {showQuickStats && (
          <QuickStatsOverlay
            stats={transactionStats}
            monthlyTotals={monthlyTotals}
            currentBalance={currentBalance}
            onClose={() => setShowQuickStats(false)}
          />
        )}

        {/* Selector de mes/año */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth("prev")}>
            <Icons.CaretLeft size={verticalScale(20)} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowQuickStats(!showQuickStats)}>
            <Typo size={18} fontWeight="500">
              {activeTab === "monthly"
                ? selectedYear
                : `${
                    selectedMonth
                      .toLocaleDateString("es-MX", { month: "short" })
                      .charAt(0)
                      .toUpperCase() +
                    selectedMonth
                      .toLocaleDateString("es-MX", { month: "short" })
                      .slice(1)
                  } ${selectedYear}`}
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeMonth("next")}>
            <Icons.CaretRight size={verticalScale(20)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <TransactionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Barra de totales mejorada */}
        <TransactionTotalsBar
          income={monthlyTotals.income}
          expenses={monthlyTotals.expenses}
          total={monthlyTotals.total}
          count={monthlyTotals.count}
          balance={currentBalance}
        />

        {/* Contenido */}
        <View style={styles.content}>{renderContent()}</View>

        {/* FAB Button con animación mejorada */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icons.Plus
            size={verticalScale(24)}
            color={colors.white}
            weight="bold"
          />
        </TouchableOpacity>

        {/* Botón de balance rápido */}
        <TouchableOpacity
          style={styles.balanceFab}
          onPress={() => setShowQuickStats(!showQuickStats)}
          activeOpacity={0.8}
        >
          <Icons.Wallet
            size={verticalScale(20)}
            color={colors.white}
            weight="fill"
          />
        </TouchableOpacity>

        {/* Modal para agregar transacción mejorado */}
        <EnhancedAddTransactionModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSave={handleAddTransaction}
          currentBalance={currentBalance}
        />

        {/* Modal de búsqueda */}
        <TransactionSearchModal
          isVisible={isSearchModalVisible}
          onClose={() => setIsSearchModalVisible(false)}
          onSearch={handleSearch}
          searchResults={searchResults}
          onTransactionPress={handleTransactionPress}
        />

        {/* Modal de detalles de transacción */}
        <TransactionDetailsModal
          isVisible={isDetailsModalVisible}
          onClose={() => {
            setIsDetailsModalVisible(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._40,
    paddingBottom: spacingY._10,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  fab: {
    position: "absolute",
    bottom: verticalScale(30),
    right: spacingX._20,
    width: verticalScale(56),
    height: verticalScale(56),
    borderRadius: verticalScale(28),
    backgroundColor: colors.rose,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: colors.rose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  balanceFab: {
    position: "absolute",
    bottom: verticalScale(100),
    right: spacingX._20,
    width: verticalScale(48),
    height: verticalScale(48),
    borderRadius: verticalScale(24),
    backgroundColor: colors.blue,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
