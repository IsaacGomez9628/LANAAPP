// LanaApp/services/AppConfigService.ts
import { Alert } from "react-native";

export interface AppSettings {
  currency: string;
  locale: string;
  theme: "light" | "dark" | "auto";
  notifications: {
    enabled: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    paymentReminders: boolean;
    weeklyReports: boolean;
    dailyTips: boolean;
  };
  security: {
    biometricAuth: boolean;
    autoLock: boolean;
    lockTimeout: number; // minutos
  };
  privacy: {
    analyticsEnabled: boolean;
    crashReporting: boolean;
    personalizedTips: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: "daily" | "weekly" | "monthly";
    lastBackup?: Date;
  };
  display: {
    showDecimals: boolean;
    compactMode: boolean;
    chartAnimations: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  preferences: {
    defaultTransactionType: "income" | "expense";
    defaultCategory: string;
    monthlyBudgetTarget?: number;
    savingsGoalTarget?: number;
  };
  stats: {
    totalTransactions: number;
    totalSaved: number;
    goalsCompleted: number;
    streakDays: number;
  };
}

class AppConfigService {
  private static instance: AppConfigService;
  private settings: AppSettings;
  private profile: UserProfile;

  private constructor() {
    this.settings = this.getDefaultSettings();
    this.profile = this.getDefaultProfile();
  }

  static getInstance(): AppConfigService {
    if (!AppConfigService.instance) {
      AppConfigService.instance = new AppConfigService();
    }
    return AppConfigService.instance;
  }

  private getDefaultSettings(): AppSettings {
    return {
      currency: "MXN",
      locale: "es-MX",
      theme: "dark",
      notifications: {
        enabled: true,
        budgetAlerts: true,
        goalReminders: true,
        paymentReminders: true,
        weeklyReports: true,
        dailyTips: true,
      },
      security: {
        biometricAuth: false,
        autoLock: true,
        lockTimeout: 5,
      },
      privacy: {
        analyticsEnabled: true,
        crashReporting: true,
        personalizedTips: true,
      },
      backup: {
        autoBackup: true,
        backupFrequency: "weekly",
      },
      display: {
        showDecimals: true,
        compactMode: false,
        chartAnimations: true,
      },
    };
  }

  private getDefaultProfile(): UserProfile {
    return {
      id: "user_001",
      name: "Usuario",
      email: "usuario@example.com",
      joinDate: new Date(),
      preferences: {
        defaultTransactionType: "expense",
        defaultCategory: "Otros",
        monthlyBudgetTarget: 10000,
        savingsGoalTarget: 20000,
      },
      stats: {
        totalTransactions: 0,
        totalSaved: 0,
        goalsCompleted: 0,
        streakDays: 0,
      },
    };
  }

  // Getters
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  getProfile(): UserProfile {
    return { ...this.profile };
  }

  getCurrency(): string {
    return this.settings.currency;
  }

  getLocale(): string {
    return this.settings.locale;
  }

  // Setters
  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  updateProfile(newProfile: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...newProfile };
    this.saveProfile();
  }

  updateProfileStats(stats: Partial<UserProfile["stats"]>): void {
    this.profile.stats = { ...this.profile.stats, ...stats };
    this.saveProfile();
  }

  // Formateo de moneda
  formatCurrency(amount: number, showSymbol: boolean = true): string {
    const options: Intl.NumberFormatOptions = {
      style: showSymbol ? "currency" : "decimal",
      currency: this.settings.currency,
      minimumFractionDigits: this.settings.display.showDecimals ? 2 : 0,
      maximumFractionDigits: this.settings.display.showDecimals ? 2 : 0,
    };

    return new Intl.NumberFormat(this.settings.locale, options).format(amount);
  }

  // Formateo de fecha
  formatDate(
    date: Date,
    style: "short" | "medium" | "long" = "medium"
  ): string {
    const options: Intl.DateTimeFormatOptions = {
      year: style === "short" ? "2-digit" : "numeric",
      month:
        style === "long" ? "long" : style === "medium" ? "short" : "numeric",
      day: "numeric",
    };

    return new Intl.DateTimeFormat(this.settings.locale, options).format(date);
  }

  // Formateo de fecha y hora
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat(this.settings.locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  // Validaciones
  validateAmount(amount: string | number): {
    isValid: boolean;
    error?: string;
  } {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) {
      return { isValid: false, error: "Cantidad inválida" };
    }

    if (numAmount < 0) {
      return { isValid: false, error: "La cantidad no puede ser negativa" };
    }

    if (numAmount > 999999999) {
      return { isValid: false, error: "La cantidad es demasiado grande" };
    }

    return { isValid: true };
  }

  validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Email inválido" };
    }

    return { isValid: true };
  }

  // Backup y recuperación
  exportData(): string {
    const data = {
      settings: this.settings,
      profile: this.profile,
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonData);

      if (!data.settings || !data.profile) {
        return { success: false, error: "Datos de backup inválidos" };
      }

      this.settings = { ...this.getDefaultSettings(), ...data.settings };
      this.profile = { ...this.getDefaultProfile(), ...data.profile };

      this.saveSettings();
      this.saveProfile();

      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al importar datos" };
    }
  }

  // Resetear configuración
  resetSettings(): void {
    Alert.alert(
      "Resetear Configuración",
      "¿Estás seguro de que quieres restaurar la configuración por defecto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: () => {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
          },
        },
      ]
    );
  }

  // Métodos privados para persistencia (simulados)
  private saveSettings(): void {
    // En una implementación real, aquí guardarías en AsyncStorage
    console.log("Settings saved:", this.settings);
  }

  private saveProfile(): void {
    // En una implementación real, aquí guardarías en AsyncStorage
    console.log("Profile saved:", this.profile);
  }

  // Utilidades para estadísticas
  incrementTransactionCount(): void {
    this.profile.stats.totalTransactions++;
    this.saveProfile();
  }

  addToTotalSaved(amount: number): void {
    this.profile.stats.totalSaved += amount;
    this.saveProfile();
  }

  incrementGoalsCompleted(): void {
    this.profile.stats.goalsCompleted++;
    this.saveProfile();
  }

  updateStreak(isPositiveAction: boolean): void {
    if (isPositiveAction) {
      this.profile.stats.streakDays++;
    } else {
      this.profile.stats.streakDays = 0;
    }
    this.saveProfile();
  }

  // Configuraciones rápidas
  getQuickSettings(): Array<{
    key: string;
    label: string;
    value: boolean;
    description: string;
  }> {
    return [
      {
        key: "notifications.enabled",
        label: "Notificaciones",
        value: this.settings.notifications.enabled,
        description: "Recibir notificaciones de la app",
      },
      {
        key: "security.biometricAuth",
        label: "Autenticación Biométrica",
        value: this.settings.security.biometricAuth,
        description: "Usar huella dactilar o Face ID",
      },
      {
        key: "backup.autoBackup",
        label: "Backup Automático",
        value: this.settings.backup.autoBackup,
        description: "Respaldar datos automáticamente",
      },
      {
        key: "display.chartAnimations",
        label: "Animaciones de Gráficas",
        value: this.settings.display.chartAnimations,
        description: "Mostrar animaciones en las gráficas",
      },
    ];
  }

  updateQuickSetting(key: string, value: boolean): void {
    const keys = key.split(".");
    let current: any = this.settings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    this.saveSettings();
  }
}

// LanaApp/utils/helpers.ts
export class FinanceUtils {
  static calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundFrequency: number = 12
  ): number {
    return (
      principal *
      Math.pow(1 + rate / compoundFrequency, compoundFrequency * time)
    );
  }

  static calculateLoanPayment(
    principal: number,
    rate: number,
    periods: number
  ): number {
    const monthlyRate = rate / 12;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, periods)) /
      (Math.pow(1 + monthlyRate, periods) - 1)
    );
  }

  static calculateSavingsTarget(
    targetAmount: number,
    monthlyDeposit: number,
    annualRate: number
  ): number {
    const monthlyRate = annualRate / 12;
    return (
      Math.log(1 + (targetAmount * monthlyRate) / monthlyDeposit) /
      Math.log(1 + monthlyRate)
    );
  }

  static getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      Comida: "🍕",
      Transporte: "🚗",
      Entretenimiento: "🎮",
      Servicios: "⚡",
      Compras: "🛍️",
      Salud: "🏥",
      Educación: "📚",
      Ahorro: "💰",
      Inversión: "📈",
      Otros: "📋",
    };

    return iconMap[category] || "📋";
  }

  static getFinancialHealthScore(data: {
    income: number;
    expenses: number;
    savings: number;
    debt: number;
    emergencyFund: number;
  }): {
    score: number;
    level: "poor" | "fair" | "good" | "excellent";
    recommendations: string[];
  } {
    let score = 0;
    const recommendations: string[] = [];

    // Tasa de ahorro (25 puntos máximo)
    const savingsRate = (data.savings / data.income) * 100;
    if (savingsRate >= 20) {
      score += 25;
    } else if (savingsRate >= 10) {
      score += 15;
      recommendations.push("Intenta ahorrar al menos el 20% de tus ingresos");
    } else {
      score += 5;
      recommendations.push(
        "Tu tasa de ahorro es muy baja, considera reducir gastos"
      );
    }

    // Ratio de gastos (25 puntos máximo)
    const expenseRatio = (data.expenses / data.income) * 100;
    if (expenseRatio <= 70) {
      score += 25;
    } else if (expenseRatio <= 80) {
      score += 15;
      recommendations.push(
        "Tus gastos están en el límite, controla mejor tu presupuesto"
      );
    } else {
      score += 5;
      recommendations.push(
        "Tus gastos son muy altos, necesitas reducirlos urgentemente"
      );
    }

    // Fondo de emergencia (25 puntos máximo)
    const monthlyExpenses = data.expenses;
    const emergencyMonths = data.emergencyFund / monthlyExpenses;
    if (emergencyMonths >= 6) {
      score += 25;
    } else if (emergencyMonths >= 3) {
      score += 15;
      recommendations.push(
        "Intenta tener 6 meses de gastos en tu fondo de emergencia"
      );
    } else {
      score += 5;
      recommendations.push(
        "Necesitas un fondo de emergencia de al menos 3-6 meses de gastos"
      );
    }

    // Deudas (25 puntos máximo)
    const debtRatio = (data.debt / data.income) * 100;
    if (debtRatio <= 20) {
      score += 25;
    } else if (debtRatio <= 40) {
      score += 15;
      recommendations.push(
        "Considera reducir tus deudas para mejorar tu salud financiera"
      );
    } else {
      score += 5;
      recommendations.push(
        "Tus deudas son muy altas, enfócate en pagarlas lo antes posible"
      );
    }

    let level: "poor" | "fair" | "good" | "excellent";
    if (score >= 80) level = "excellent";
    else if (score >= 60) level = "good";
    else if (score >= 40) level = "fair";
    else level = "poor";

    return { score, level, recommendations };
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatLargeNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  }

  static getMonthName(date: Date, locale: string = "es-MX"): string {
    return date.toLocaleDateString(locale, { month: "long" });
  }

  static getDayOfWeek(date: Date, locale: string = "es-MX"): string {
    return date.toLocaleDateString(locale, { weekday: "long" });
  }

  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      if (!this.isWeekend(result)) {
        addedDays++;
      }
    }

    return result;
  }

  static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  static generateColorPalette(count: number): string[] {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f43f5e",
      "#84cc16",
    ];

    if (count <= colors.length) {
      return colors.slice(0, count);
    }

    // Generar colores adicionales si se necesitan más
    const extraColors = [];
    for (let i = colors.length; i < count; i++) {
      const hue = (i * 137.508) % 360; // Golden angle approximation
      extraColors.push(`hsl(${hue}, 70%, 50%)`);
    }

    return [...colors, ...extraColors];
  }
}

export default AppConfigService;
