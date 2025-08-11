import { Alert } from "react-native";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  color: string;
  period: "monthly" | "weekly" | "daily";
}

interface Transaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  date: Date;
  description: string;
  importance: "high" | "medium" | "low";
}

class FinanceService {
  private static instance: FinanceService;
  private budgets: Budget[] = [];
  private transactions: Transaction[] = [];
  private currentBalance: number = 15000;

  private constructor() {}

  static getInstance(): FinanceService {
    if (!FinanceService.instance) {
      FinanceService.instance = new FinanceService();
    }
    return FinanceService.instance;
  }

  setBudgets(budgets: Budget[]) {
    this.budgets = budgets;
  }

  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  setCurrentBalance(balance: number) {
    this.currentBalance = balance;
  }

  validateTransaction(
    category: string,
    amount: number,
    type: "income" | "expense"
  ): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (type === "expense") {
      // Verificar saldo suficiente
      if (amount > this.currentBalance) {
        errors.push(
          `Saldo insuficiente. Saldo actual: $${this.currentBalance.toLocaleString(
            "es-MX"
          )}`
        );
      }

      // Verificar presupuesto de categoría
      const budget = this.budgets.find((b) => b.category === category);
      if (budget) {
        const newSpent = budget.spent + amount;
        const percentageUsed = (newSpent / budget.amount) * 100;

        if (newSpent > budget.amount) {
          warnings.push(
            `Excederás el presupuesto de ${category} por $${(
              newSpent - budget.amount
            ).toLocaleString("es-MX")}`
          );
        } else if (percentageUsed > 80) {
          warnings.push(
            `Usarás el ${percentageUsed.toFixed(
              0
            )}% de tu presupuesto de ${category}`
          );
        }
      }

      // Verificar si el balance quedaría muy bajo
      const remainingBalance = this.currentBalance - amount;
      if (remainingBalance < 1000 && remainingBalance > 0) {
        warnings.push(
          `Tu saldo quedará bajo: $${remainingBalance.toLocaleString("es-MX")}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }

  showValidationAlert(
    validation: { isValid: boolean; warnings: string[]; errors: string[] },
    onConfirm: () => void
  ) {
    if (!validation.isValid) {
      Alert.alert("❌ No se puede procesar", validation.errors.join("\n"), [
        { text: "Entendido" },
      ]);
      return;
    }

    if (validation.warnings.length > 0) {
      Alert.alert(
        "⚠️ Advertencias",
        validation.warnings.join("\n") + "\n\n¿Deseas continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar", onPress: onConfirm },
        ]
      );
      return;
    }

    onConfirm();
  }

  updateBudgetSpending(
    category: string,
    amount: number,
    operation: "add" | "subtract"
  ) {
    this.budgets = this.budgets.map((budget) => {
      if (budget.category === category) {
        return {
          ...budget,
          spent:
            operation === "add"
              ? budget.spent + amount
              : Math.max(0, budget.spent - amount),
        };
      }
      return budget;
    });
  }

  updateBalance(amount: number, type: "income" | "expense") {
    if (type === "income") {
      this.currentBalance += amount;
    } else {
      this.currentBalance -= amount;
    }
  }

  getCategorySpendingAnalysis(category: string) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = this.transactions.filter((t) => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return (
        t.category === category &&
        t.type === "expense" &&
        tMonth === currentMonth &&
        tYear === currentYear
      );
    });

    const totalSpent = monthlyTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const budget = this.budgets.find((b) => b.category === category);

    return {
      spent: totalSpent,
      budget: budget?.amount || 0,
      remaining: (budget?.amount || 0) - totalSpent,
      transactions: monthlyTransactions,
      percentageUsed: budget ? (totalSpent / budget.amount) * 100 : 0,
    };
  }

  getMonthlyFinancialSummary() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = this.transactions.filter((t) => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return tMonth === currentMonth && tYear === currentYear;
    });

    const income = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalBudgetUsed = this.budgets.reduce((sum, b) => sum + b.spent, 0);

    return {
      income,
      expenses,
      netIncome: income - expenses,
      currentBalance: this.currentBalance,
      totalBudget,
      totalBudgetUsed,
      budgetRemaining: totalBudget - totalBudgetUsed,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    };
  }
}

export default FinanceService;
