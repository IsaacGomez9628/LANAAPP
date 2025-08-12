import {
  Transaction,
  Category,
  TransactionType,
  ImportanceType,
} from "../types";
import { colors } from "@/constants/theme";

// Categorías predefinidas con iconos y colores
export const PREDEFINED_CATEGORIES: Category[] = [
  { id: "1", name: "Salario", color: colors.green, icon: "Money" },
  { id: "2", name: "Comida", color: colors.orange, icon: "Pizza" },
  { id: "3", name: "Transporte", color: colors.blue, icon: "Car" },
  {
    id: "4",
    name: "Entretenimiento",
    color: colors.purple,
    icon: "GameController",
  },
  { id: "5", name: "Servicios", color: colors.cyan, icon: "Lightning" },
  { id: "6", name: "Compras", color: colors.pink, icon: "ShoppingBag" },
  { id: "7", name: "Ahorro", color: colors.yellow, icon: "PiggyBank" },
  { id: "8", name: "Salud", color: colors.rose, icon: "Heartbeat" },
  {
    id: "9",
    name: "Educación",
    color: colors.primaryLight,
    icon: "GraduationCap",
  },
  { id: "10", name: "Hogar", color: colors.primary, icon: "House" },
  { id: "11", name: "Préstamo", color: colors.neutral400, icon: "Handshake" },
  { id: "12", name: "Otros", color: colors.neutral500, icon: "DotsThree" },
];

// Transacciones de ejemplo más realistas
export const SAMPLE_TRANSACTIONS: Transaction[] = [
  // Enero 2025
  {
    id: "1",
    type: "income",
    amount: 35000,
    category: "Salario",
    date: new Date(2025, 0, 1),
    description: "Salario de enero",
    importance: "high",
  },
  {
    id: "2",
    type: "expense",
    amount: 8500,
    category: "Hogar",
    date: new Date(2025, 0, 5),
    description: "Renta mensual",
    importance: "high",
  },
  {
    id: "3",
    type: "expense",
    amount: 2300,
    category: "Comida",
    date: new Date(2025, 0, 7),
    description: "Despensa semanal",
    importance: "medium",
  },
  {
    id: "4",
    type: "expense",
    amount: 500,
    category: "Transporte",
    date: new Date(2025, 0, 8),
    description: "Gasolina",
    importance: "medium",
  },
  {
    id: "5",
    type: "income",
    amount: 5000,
    category: "Otros",
    date: new Date(2025, 0, 10),
    description: "Proyecto freelance",
    importance: "medium",
  },
  {
    id: "6",
    type: "expense",
    amount: 1200,
    category: "Servicios",
    date: new Date(2025, 0, 12),
    description: "Internet y luz",
    importance: "high",
  },
  {
    id: "7",
    type: "expense",
    amount: 450,
    category: "Entretenimiento",
    date: new Date(2025, 0, 14),
    description: "Netflix y Spotify",
    importance: "low",
  },
  {
    id: "8",
    type: "transfer",
    amount: 5000,
    category: "Ahorro",
    date: new Date(2025, 0, 15),
    description: "Ahorro mensual",
    importance: "high",
  },
  {
    id: "9",
    type: "expense",
    amount: 800,
    category: "Salud",
    date: new Date(2025, 0, 18),
    description: "Consulta médica",
    importance: "medium",
  },
  {
    id: "10",
    type: "expense",
    amount: 1500,
    category: "Educación",
    date: new Date(2025, 0, 20),
    description: "Curso online",
    importance: "medium",
  },
];

// Clase de servicio para manejar transacciones
export class TransactionService {
  private static transactions: Transaction[] = [...SAMPLE_TRANSACTIONS];
  private static categories: Category[] = [...PREDEFINED_CATEGORIES];

  // Obtener todas las transacciones
  static getTransactions(): Transaction[] {
    return this.transactions.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  // Agregar nueva transacción
  static addTransaction(transaction: Omit<Transaction, "id">): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  // Eliminar transacción
  static deleteTransaction(id: string): boolean {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index > -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Actualizar transacción
  static updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): Transaction | null {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index > -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      return this.transactions[index];
    }
    return null;
  }

  // Obtener transacciones por tipo
  static getTransactionsByType(type: TransactionType): Transaction[] {
    return this.transactions.filter((t) => t.type === type);
  }

  // Obtener transacciones por categoría
  static getTransactionsByCategory(category: string): Transaction[] {
    return this.transactions.filter((t) => t.category === category);
  }

  // Obtener transacciones por rango de fecha
  static getTransactionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Transaction[] {
    return this.transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
  }

  // Calcular totales
  static calculateTotals(transactions?: Transaction[]) {
    const trans = transactions || this.transactions;
    const income = trans
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = trans
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const transfers = trans
      .filter((t) => t.type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      transfers,
      total: income - expenses,
      savings: transfers,
    };
  }

  // Calcular gastos por categoría
  static getExpensesByCategory(transactions?: Transaction[]) {
    const trans = transactions || this.transactions;
    const expensesByCategory: Record<string, number> = {};

    trans
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expensesByCategory[t.category] =
          (expensesByCategory[t.category] || 0) + t.amount;
      });

    return expensesByCategory;
  }

  // Obtener estadísticas mensuales
  static getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const monthTransactions = this.getTransactionsByDateRange(
      startDate,
      endDate
    );

    return {
      ...this.calculateTotals(monthTransactions),
      transactions: monthTransactions,
      expensesByCategory: this.getExpensesByCategory(monthTransactions),
    };
  }

  // Obtener categorías
  static getCategories(): Category[] {
    return this.categories;
  }

  // Agregar nueva categoría
  static addCategory(name: string, color?: string, icon?: string): Category {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color: color || colors.neutral400,
      icon: icon || "DotsThree",
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  // Obtener presupuesto sugerido basado en historial
  static getSuggestedBudget(): number {
    const lastThreeMonths = this.transactions.filter((t) => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return t.date >= threeMonthsAgo;
    });

    const totals = this.calculateTotals(lastThreeMonths);
    const averageMonthlyExpense = totals.expenses / 3;

    // Sugerir un presupuesto 10% menor que el promedio para incentivar el ahorro
    return Math.round(averageMonthlyExpense * 0.9);
  }
}
