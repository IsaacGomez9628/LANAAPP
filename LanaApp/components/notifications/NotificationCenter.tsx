// LanaApp/components/notifications/NotificationCenter.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import NotificationService, {
  NotificationItem,
  NotificationSettings,
} from "@/services/NotificationService";

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isVisible,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(
    NotificationService.getInstance().getSettings()
  );
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "settings">(
    "all"
  );

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (isVisible) {
      loadNotifications();
    }
  }, [isVisible]);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationService.removeNotification(notificationId);
    loadNotifications();
  };

  const handleClearAll = () => {
    Alert.alert(
      "Limpiar Notificaciones",
      "¿Estás seguro de eliminar todas las notificaciones?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar Todas",
          style: "destructive",
          onPress: () => {
            notificationService.clearAllNotifications();
            loadNotifications();
          },
        },
      ]
    );
  };

  const handleUpdateSettings = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "budget_warning":
        return <Icons.Warning size={verticalScale(20)} color={colors.yellow} />;
      case "goal_reminder":
        return <Icons.Target size={verticalScale(20)} color={colors.blue} />;
      case "payment_due":
        return <Icons.Clock size={verticalScale(20)} color={colors.rose} />;
      case "achievement":
        return <Icons.Trophy size={verticalScale(20)} color={colors.green} />;
      case "tip":
        return (
          <Icons.Lightbulb size={verticalScale(20)} color={colors.purple} />
        );
      case "expense_alert":
        return (
          <Icons.TrendDown size={verticalScale(20)} color={colors.orange} />
        );
      default:
        return (
          <Icons.Bell size={verticalScale(20)} color={colors.neutral400} />
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.rose;
      case "medium":
        return colors.yellow;
      case "low":
        return colors.blue;
      default:
        return colors.neutral400;
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "all":
      default:
        return notifications;
    }
  };

  const renderNotificationItem = (
    notification: NotificationItem,
    index: number
  ) => (
    <Animated.View
      key={notification.id}
      entering={FadeInUp.delay(index * 50).springify()}
      style={[
        styles.notificationItem,
        !notification.isRead && styles.unreadNotification,
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() =>
          !notification.isRead && handleMarkAsRead(notification.id)
        }
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationMeta}>
            {getNotificationIcon(notification.type)}
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(notification.priority) },
              ]}
            />
            {!notification.isRead && <View style={styles.unreadDot} />}
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteNotification(notification.id)}
            style={styles.deleteButton}
          >
            <Icons.X size={verticalScale(14)} color={colors.neutral500} />
          </TouchableOpacity>
        </View>

        <View style={styles.notificationBody}>
          <Typo size={14} fontWeight="600" color={colors.white}>
            {notification.title}
          </Typo>
          <Typo size={12} color={colors.neutral300} style={{ marginTop: 4 }}>
            {notification.message}
          </Typo>
          <View style={styles.notificationFooter}>
            <Typo size={10} color={colors.neutral500}>
              {notification.timestamp.toLocaleDateString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </Typo>
            {notification.actionText && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  notification.onAction?.();
                  handleMarkAsRead(notification.id);
                }}
              >
                <Typo size={11} color={colors.primary} fontWeight="500">
                  {notification.actionText}
                </Typo>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSettings = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.settingsContainer}>
        <Typo size={16} fontWeight="600" style={{ marginBottom: 20 }}>
          Configuración de Notificaciones
        </Typo>

        {[
          {
            key: "budgetWarnings",
            label: "Alertas de Presupuesto",
            icon: "Warning",
            description: "Notificaciones cuando excedas presupuestos",
          },
          {
            key: "goalReminders",
            label: "Recordatorios de Metas",
            icon: "Target",
            description: "Recordatorios sobre tus metas de ahorro",
          },
          {
            key: "paymentDue",
            label: "Pagos Próximos",
            icon: "Clock",
            description: "Alertas de pagos recurrentes próximos",
          },
          {
            key: "achievements",
            label: "Logros",
            icon: "Trophy",
            description: "Celebra cuando alcances tus objetivos",
          },
          {
            key: "dailyTips",
            label: "Consejos Diarios",
            icon: "Lightbulb",
            description: "Tips financieros útiles",
          },
          {
            key: "expenseAlerts",
            label: "Alertas de Gastos",
            icon: "TrendDown",
            description: "Avisos sobre gastos inusuales",
          },
          {
            key: "weeklyReports",
            label: "Reportes Semanales",
            icon: "ChartLine",
            description: "Resumen semanal de tus finanzas",
          },
        ].map((setting) => {
          const IconComponent = Icons[
            setting.icon as keyof typeof Icons
          ] as any;
          const isEnabled = settings[setting.key as keyof NotificationSettings];

          return (
            <View key={setting.key} style={styles.settingItem}>
              <View style={styles.settingContent}>
                <View style={styles.settingIcon}>
                  <IconComponent
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Typo size={14} fontWeight="500">
                    {setting.label}
                  </Typo>
                  <Typo size={12} color={colors.neutral400}>
                    {setting.description}
                  </Typo>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, isEnabled && styles.toggleActive]}
                  onPress={() =>
                    handleUpdateSettings(
                      setting.key as keyof NotificationSettings,
                      !isEnabled
                    )
                  }
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      isEnabled && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.settingsNote}>
          <Icons.Info size={verticalScale(16)} color={colors.blue} />
          <Typo size={11} color={colors.neutral400}>
            Los cambios se aplicarán inmediatamente. Puedes activar o desactivar
            cualquier tipo de notificación según tus preferencias.
          </Typo>
        </View>
      </View>
    </ScrollView>
  );

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
            <Icons.Bell size={verticalScale(24)} color={colors.white} />
            <Typo size={20} fontWeight="600">
              Notificaciones
            </Typo>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Typo size={10} color={colors.white} fontWeight="600">
                  {unreadCount}
                </Typo>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.headerAction}
              >
                <Icons.Trash size={verticalScale(18)} color={colors.rose} />
              </TouchableOpacity>
            )}
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.headerAction}
              >
                <Icons.CheckCircle
                  size={verticalScale(18)}
                  color={colors.green}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <Icons.X size={verticalScale(24)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: "all", label: "Todas", count: notifications.length },
            { key: "unread", label: "No leídas", count: unreadCount },
            { key: "settings", label: "Configuración", count: 0 },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Typo
                size={12}
                color={
                  activeTab === tab.key ? colors.primary : colors.neutral400
                }
                fontWeight={activeTab === tab.key ? "600" : "400"}
              >
                {tab.label}
                {tab.count > 0 && ` (${tab.count})`}
              </Typo>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "settings" ? (
            renderSettings()
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) =>
                  renderNotificationItem(notification, index)
                )
              ) : (
                <View style={styles.emptyState}>
                  <Icons.BellSlash
                    size={verticalScale(40)}
                    color={colors.neutral600}
                  />
                  <Typo
                    size={16}
                    color={colors.neutral400}
                    style={{ marginTop: 15 }}
                  >
                    {activeTab === "unread"
                      ? "No tienes notificaciones sin leer"
                      : "No hay notificaciones"}
                  </Typo>
                  <Typo
                    size={12}
                    color={colors.neutral500}
                    style={{ marginTop: 5 }}
                  >
                    {activeTab === "unread"
                      ? "¡Estás al día con todas tus notificaciones!"
                      : "Las notificaciones aparecerán aquí cuando ocurran eventos importantes"}
                  </Typo>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NotificationCenter;

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
    height: "90%",
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
  unreadBadge: {
    backgroundColor: colors.rose,
    borderRadius: verticalScale(10),
    width: verticalScale(20),
    height: verticalScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._15,
  },
  headerAction: {
    padding: spacingX._5,
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
  notificationItem: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    marginBottom: spacingY._10,
    overflow: "hidden",
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    padding: spacingX._15,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._7,
  },
  notificationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  priorityDot: {
    width: verticalScale(6),
    height: verticalScale(6),
    borderRadius: verticalScale(3),
  },
  unreadDot: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
    backgroundColor: colors.primary,
  },
  deleteButton: {
    padding: spacingX._5,
  },
  notificationBody: {
    gap: spacingY._5,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacingY._7,
  },
  actionButton: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._60,
  },
  settingsContainer: {
    paddingBottom: spacingY._20,
  },
  settingItem: {
    marginBottom: spacingY._15,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    padding: spacingX._15,
  },
  settingIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: radius._10,
    backgroundColor: colors.neutral600,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._15,
  },
  settingInfo: {
    flex: 1,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral600,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  settingsNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacingX._7,
    backgroundColor: colors.blue + "10",
    borderWidth: 1,
    borderColor: colors.blue + "30",
    borderRadius: radius._10,
    padding: spacingX._15,
    marginTop: spacingY._20,
  },
});
