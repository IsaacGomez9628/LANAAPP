import { colors } from "./theme";

// Tipos
export type TransactionType = "income" | "expense" | "transfer";
export type TabType = "calendar" | "monthly" | "summary";
export type ImportanceType = "high" | "medium" | "low";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: Date;
  description: string;
  importance: ImportanceType;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DayData {
  day: number;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export interface WeekData {
  weekRange: string;
  income: number;
  expense: number;
  total: number;
  count: number;
  transactions: Transaction[];
}

// Categorías predefinidas
export const CATEGORIES: Category[] = [
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
  { id: "8", name: "Otros", color: colors.neutral400, icon: "DotsThree" },
];

// Datos de ejemplo
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 6000,
    category: "Salario",
    date: new Date(2025, 7, 9),
    description: "Salario quincenal",
    importance: "high",
  },
  {
    id: "2",
    type: "expense",
    amount: 450,
    category: "Comida",
    date: new Date(2025, 7, 2),
    description: "Supermercado",
    importance: "medium",
  },
  {
    id: "3",
    type: "expense",
    amount: 150,
    category: "Transporte",
    date: new Date(2025, 7, 5),
    description: "Gasolina",
    importance: "medium",
  },
  {
    id: "4",
    type: "income",
    amount: 1500,
    category: "Otros",
    date: new Date(2025, 7, 15),
    description: "Freelance",
    importance: "high",
  },
  {
    id: "5",
    type: "expense",
    amount: 800,
    category: "Entretenimiento",
    date: new Date(2025, 7, 20),
    description: "Concierto",
    importance: "low",
  },
  {
    id: "6",
    type: "expense",
    amount: 1200,
    category: "Servicios",
    date: new Date(2025, 7, 25),
    description: "Internet y luz",
    importance: "high",
  },
];
