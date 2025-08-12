// LanaApp/services/NotificationService.ts
import { colors } from "@/constants/theme";
import { Alert } from "react-native";

export interface NotificationItem {
  id: string;
  type:
    | "budget_warning"
    | "goal_reminder"
    | "payment_due"
    | "achievement"
    | "tip"
    | "expense_alert";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  timestamp: Date;
  isRead: boolean;
  actionText?: string;
  onAction?: () => void;
  data?: any;
}

export interface NotificationSettings {
  budgetWarnings: boolean;
  goalReminders: boolean;
  paymentDue: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  dailyTips: boolean;
  expenseAlerts: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationItem[] = [];
  private settings: NotificationSettings = {
    budgetWarnings: true,
    goalReminders: true,
    paymentDue: true,
    weeklyReports: true,
    achievements: true,
    dailyTips: true,
    expenseAlerts: true,
  };

  private constructor() {
    this.generateInitialNotifications();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private generateInitialNotifications() {
    const now = new Date();

    // Notificaciones de ejemplo
    this.notifications = [
      {
        id: "1",
        type: "payment_due",
        title: "💳 Pago Próximo",
        message: "Tu pago de Netflix vence en 2 días ($250)",
        priority: "high",
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        isRead: false,
        actionText: "Ver Detalles",
      },
      {
        id: "2",
        type: "budget_warning",
        title: "⚠️ Presupuesto en Riesgo",
        message: "Has usado el 85% de tu presupuesto de Comida este mes",
        priority: "medium",
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        isRead: false,
        actionText: "Revisar",
      },
      {
        id: "3",
        type: "achievement",
        title: "🎉 ¡Felicidades!",
        message: "Has alcanzado tu meta de ahorro 'Vacaciones'",
        priority: "low",
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        isRead: false,
        actionText: "Celebrar",
      },
      {
        id: "4",
        type: "goal_reminder",
        title: "🎯 Recordatorio de Meta",
        message: "Faltan $2,500 para tu meta 'Fondo de Emergencia'",
        priority: "medium",
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        isRead: true,
        actionText: "Ahorrar",
      },
      {
        id: "5",
        type: "tip",
        title: "💡 Consejo Financiero",
        message: "Tip del día: Revisa tus gastos hormiga semanalmente",
        priority: "low",
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        isRead: true,
      },
    ];
  }

  getNotifications(): NotificationItem[] {
    return this.notifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.isRead = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true));
  }

  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
  }

  clearAllNotifications(): void {
    this.notifications = [];
  }

  addNotification(
    notification: Omit<NotificationItem, "id" | "timestamp" | "isRead">
  ): void {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };

    this.notifications.unshift(newNotification);

    // Limitar a 50 notificaciones máximo
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  // Métodos para generar notificaciones específicas
  checkBudgetWarnings(budgets: any[]): void {
    if (!this.settings.budgetWarnings) return;

    budgets.forEach((budget) => {
      const usage = (budget.spent / budget.amount) * 100;

      if (usage >= 90 && usage < 100) {
        const existingWarning = this.notifications.find(
          (n) =>
            n.type === "budget_warning" &&
            n.data?.budgetId === budget.id &&
            n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!existingWarning) {
          this.addNotification({
            type: "budget_warning",
            title: "⚠️ Presupuesto Casi Agotado",
            message: `Has usado el ${usage.toFixed(0)}% de tu presupuesto de ${
              budget.category
            }`,
            priority: "medium",
            actionText: "Revisar Gastos",
            data: { budgetId: budget.id },
          });
        }
      } else if (usage >= 100) {
        const existingAlert = this.notifications.find(
          (n) =>
            n.type === "budget_warning" &&
            n.data?.budgetId === budget.id &&
            n.message.includes("excedido") &&
            n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!existingAlert) {
          this.addNotification({
            type: "budget_warning",
            title: "🚨 Presupuesto Excedido",
            message: `Has excedido tu presupuesto de ${budget.category} por $${(
              budget.spent - budget.amount
            ).toLocaleString("es-MX")}`,
            priority: "high",
            actionText: "Ajustar Presupuesto",
            data: { budgetId: budget.id },
          });
        }
      }
    });
  }

  checkGoalReminders(goals: any[]): void {
    if (!this.settings.goalReminders) return;

    goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const daysRemaining = Math.ceil(
        (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Recordatorio semanal para metas activas
      const lastReminder = this.notifications.find(
        (n) =>
          n.type === "goal_reminder" &&
          n.data?.goalId === goal.id &&
          n.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      if (!lastReminder && goal.isActive && progress < 100) {
        if (daysRemaining <= 30 && daysRemaining > 0) {
          this.addNotification({
            type: "goal_reminder",
            title: "🎯 Meta Próxima a Vencer",
            message: `Solo quedan ${daysRemaining} días para tu meta '${goal.name}'`,
            priority: "medium",
            actionText: "Ahorrar Ahora",
            data: { goalId: goal.id },
          });
        } else if (progress < 50 && daysRemaining > 30) {
          this.addNotification({
            type: "goal_reminder",
            title: "🎯 Recordatorio de Meta",
            message: `Llevas ${progress.toFixed(0)}% de tu meta '${goal.name}'`,
            priority: "low",
            actionText: "Ver Progreso",
            data: { goalId: goal.id },
          });
        }
      }
    });
  }

  checkPaymentDue(payments: any[]): void {
    if (!this.settings.paymentDue) return;

    payments.forEach((payment) => {
      const daysUntil = Math.ceil(
        (payment.nextPayment.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntil <= 3 && daysUntil >= 0) {
        const existingReminder = this.notifications.find(
          (n) =>
            n.type === "payment_due" &&
            n.data?.paymentId === payment.id &&
            n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (!existingReminder && payment.isActive) {
          this.addNotification({
            type: "payment_due",
            title:
              daysUntil === 0
                ? "💳 Pago Hoy"
                : `💳 Pago en ${daysUntil} día${daysUntil > 1 ? "s" : ""}`,
            message: `${payment.name}: $${payment.amount.toLocaleString(
              "es-MX"
            )}`,
            priority: daysUntil === 0 ? "high" : "medium",
            actionText: "Ver Detalles",
            data: { paymentId: payment.id },
          });
        }
      }
    });
  }

  checkAchievements(data: any): void {
    if (!this.settings.achievements) return;

    // Verificar si se completó una meta
    data.goals?.forEach((goal: any) => {
      if (goal.currentAmount >= goal.targetAmount) {
        const existingAchievement = this.notifications.find(
          (n) => n.type === "achievement" && n.data?.goalId === goal.id
        );

        if (!existingAchievement) {
          this.addNotification({
            type: "achievement",
            title: "🎉 ¡Meta Completada!",
            message: `Has alcanzado tu meta '${
              goal.name
            }' de $${goal.targetAmount.toLocaleString("es-MX")}`,
            priority: "low",
            actionText: "Celebrar",
            data: { goalId: goal.id },
          });
        }
      }
    });

    // Verificar racha de ahorro
    const savingsRate =
      data.monthlyIncome > 0
        ? ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) *
          100
        : 0;
    if (savingsRate >= 20) {
      const existingStreak = this.notifications.find(
        (n) =>
          n.type === "achievement" &&
          n.message.includes("tasa de ahorro") &&
          n.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      if (!existingStreak) {
        this.addNotification({
          type: "achievement",
          title: "🏆 Excelente Ahorro",
          message: `Tienes una tasa de ahorro del ${savingsRate.toFixed(
            1
          )}% este mes`,
          priority: "low",
          actionText: "Ver Estadísticas",
        });
      }
    }
  }

  generateDailyTip(): void {
    if (!this.settings.dailyTips) return;

    const tips = [
      "Revisa tus gastos hormiga semanalmente para identificar patrones",
      "Automatiza tus ahorros para alcanzar tus metas más fácilmente",
      "Usa la regla 50/30/20: 50% necesidades, 30% gustos, 20% ahorros",
      "Negocia tus servicios recurrentes cada 6 meses",
      "Establece un día sin gastos cada semana",
      "Revisa y ajusta tus presupuestos mensualmente",
      "Considera invertir tus ahorros de emergencia en cuentas de alto rendimiento",
      "Usa listas de compras para evitar gastos impulsivos",
      "Compara precios antes de hacer compras grandes",
      "Celebra tus logros financieros, por pequeños que sean",
    ];

    const today = new Date().toDateString();
    const existingTip = this.notifications.find(
      (n) => n.type === "tip" && n.timestamp.toDateString() === today
    );

    if (!existingTip) {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      this.addNotification({
        type: "tip",
        title: "💡 Consejo Financiero del Día",
        message: randomTip,
        priority: "low",
      });
    }
  }

  checkExpenseAlerts(transactions: any[], currentBalance: number): void {
    if (!this.settings.expenseAlerts) return;

    // Verificar gastos grandes
    const today = new Date();
    const todayTransactions = transactions.filter(
      (t) =>
        t.date.toDateString() === today.toDateString() && t.type === "expense"
    );

    const todayExpenses = todayTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const averageDailyExpenses =
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0) / 30; // Promedio de 30 días

    if (todayExpenses > averageDailyExpenses * 2) {
      const existingAlert = this.notifications.find(
        (n) =>
          n.type === "expense_alert" &&
          n.timestamp.toDateString() === today.toDateString()
      );

      if (!existingAlert) {
        this.addNotification({
          type: "expense_alert",
          title: "📊 Gastos Elevados Hoy",
          message: `Has gastado $${todayExpenses.toLocaleString(
            "es-MX"
          )} hoy, ${((todayExpenses / averageDailyExpenses) * 100).toFixed(
            0
          )}% más que tu promedio`,
          priority: "medium",
          actionText: "Revisar Gastos",
        });
      }
    }

    // Verificar saldo bajo
    if (currentBalance < averageDailyExpenses * 7) {
      const existingWarning = this.notifications.find(
        (n) =>
          n.type === "expense_alert" &&
          n.message.includes("saldo bajo") &&
          n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      if (!existingWarning) {
        this.addNotification({
          type: "expense_alert",
          title: "⚠️ Saldo Bajo",
          message: `Tu saldo actual solo cubre ${Math.floor(
            currentBalance / averageDailyExpenses
          )} días de gastos promedio`,
          priority: "high",
          actionText: "Revisar Presupuesto",
        });
      }
    }
  }

  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Método principal para verificar todas las notificaciones
  checkAllNotifications(data: {
    budgets: any[];
    goals: any[];
    payments: any[];
    transactions: any[];
    currentBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  }): void {
    this.checkBudgetWarnings(data.budgets);
    this.checkGoalReminders(data.goals);
    this.checkPaymentDue(data.payments);
    this.checkAchievements(data);
    this.generateDailyTip();
    this.checkExpenseAlerts(data.transactions, data.currentBalance);
  }

  showInAppNotification(notification: NotificationItem): void {
    const priorityConfig = {
      high: { duration: 5000, backgroundColor: colors.rose },
      medium: { duration: 4000, backgroundColor: colors.yellow },
      low: { duration: 3000, backgroundColor: colors.blue },
    };

    const config = priorityConfig[notification.priority];

    Alert.alert(
      notification.title,
      notification.message,
      notification.actionText
        ? [
            { text: "Cerrar", style: "cancel" },
            {
              text: notification.actionText,
              onPress: notification.onAction || (() => {}),
            },
          ]
        : [{ text: "Entendido" }]
    );
  }
}

export default NotificationService;
