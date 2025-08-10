import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";

// Importar componentes de transacciones
import TransactionHeader from "@/components/transactions/TransactionHeader";
import TransactionTabs from "@/components/transactions/TransactionTabs";
import TransactionTotalsBar from "@/components/transactions/TransactionTotalBar";
import CalendarView from "@/components/transactions/CalendarView";
import MonthlyView from "@/components/transactions/MonthlyView";
import SummaryView from "@/components/transactions/SummaryView";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";

// Importar tipos y datos
import {
  Transaction,
  TabType,
  INITIAL_TRANSACTIONS,
} from "@/constants/transactions";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [transactions, setTransactions] =
    useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedYear] = useState(2025);
  const [totalBudget] = useState(10000);

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
    };
  }, [transactions, selectedMonth]);

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
    setIsModalVisible(false);
  };

  // Renderizar contenido según tab activa
  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <CalendarView
            transactions={transactions}
            selectedMonth={selectedMonth}
          />
        );
      case "monthly":
        return (
          <MonthlyView
            transactions={transactions}
            selectedMonth={selectedMonth}
            monthlyTotals={monthlyTotals}
          />
        );
      case "summary":
        return (
          <SummaryView
            transactions={transactions}
            monthlyTotals={monthlyTotals}
            totalBudget={totalBudget}
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
          onSearch={() => console.log("Search")}
          onFavorite={() => console.log("Favorite")}
          onMenu={() => console.log("Menu")}
        />

        {/* Selector de mes/año */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={() => changeMonth("prev")}>
            <Icons.CaretLeft size={verticalScale(20)} color={colors.white} />
          </TouchableOpacity>

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

          <TouchableOpacity onPress={() => changeMonth("next")}>
            <Icons.CaretRight size={verticalScale(20)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <TransactionTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Barra de totales */}
        <TransactionTotalsBar
          income={monthlyTotals.income}
          expenses={monthlyTotals.expenses}
          total={monthlyTotals.total}
        />

        {/* Contenido */}
        <View style={styles.content}>{renderContent()}</View>

        {/* FAB Button */}
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

        {/* Modal para agregar transacción */}
        <AddTransactionModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSave={handleAddTransaction}
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
});
