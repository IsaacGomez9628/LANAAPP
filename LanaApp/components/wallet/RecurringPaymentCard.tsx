import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface RecurringPayment {
  name: string;
  category: string;
  frequency: string;
  amount: number;
  color: string;
  isActive: boolean;
  nextPayment: Date;
}

interface RecurringPaymentCardProps {
  payment: RecurringPayment;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  delay?: number;
}

const RecurringPaymentCard: React.FC<RecurringPaymentCardProps> = ({
  payment,
  onEdit,
  onToggle,
  onDelete,
  delay = 0,
}) => {
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Diario";
      case "weekly":
        return "Semanal";
      case "monthly":
        return "Mensual";
      case "yearly":
        return "Anual";
      default:
        return frequency;
    }
  };

  const daysUntilNext = Math.ceil(
    (payment.nextPayment.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={[styles.card, !payment.isActive && styles.cardInactive]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.paymentInfo}>
          <View
            style={[styles.colorIndicator, { backgroundColor: payment.color }]}
          />
          <View>
            <Typo
              size={16}
              fontWeight="600"
              color={payment.isActive ? colors.white : colors.neutral500}
            >
              {payment.name}
            </Typo>
            <Typo size={12} color={colors.neutral400}>
              {payment.category} • {getFrequencyText(payment.frequency)}
            </Typo>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onToggle} style={styles.actionButton}>
            <Icons.Power
              size={verticalScale(18)}
              color={payment.isActive ? colors.green : colors.neutral500}
              weight={payment.isActive ? "fill" : "regular"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Icons.PencilSimple
              size={verticalScale(18)}
              color={colors.neutral400}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Icons.Trash size={verticalScale(18)} color={colors.rose} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.amountContainer}>
          <Typo size={24} fontWeight="700" color={payment.color}>
            ${payment.amount.toLocaleString("es-MX")}
          </Typo>
          <Typo size={12} color={colors.neutral400}>
            por {getFrequencyText(payment.frequency).toLowerCase()}
          </Typo>
        </View>

        <View style={styles.nextPaymentContainer}>
          <Typo size={12} color={colors.neutral400}>
            Próximo pago en
          </Typo>
          <Typo
            size={14}
            fontWeight="600"
            color={daysUntilNext <= 3 ? colors.yellow : colors.white}
          >
            {daysUntilNext} días
          </Typo>
          <Typo size={11} color={colors.neutral500}>
            {payment.nextPayment.toLocaleDateString("es-MX")}
          </Typo>
        </View>
      </View>

      {!payment.isActive && (
        <View style={styles.inactiveOverlay}>
          <Typo size={12} color={colors.neutral400}>
            Pago pausado
          </Typo>
        </View>
      )}
    </Animated.View>
  );
};

export default RecurringPaymentCard;

const styles = StyleSheet.create({
  // Shared modal styles
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._30,
    borderTopRightRadius: radius._30,
    padding: spacingX._20,
    paddingBottom: Platform.OS === "ios" ? spacingY._40 : spacingY._20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._20,
  },
  inputContainer: {
    marginBottom: spacingY._15,
  },
  input: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._12,
    color: colors.white,
    fontSize: verticalScale(14),
    marginTop: spacingY._7,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.rose,
  },
  categoryScroll: {
    marginTop: spacingY._7,
  },
  categoryButton: {
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._7,
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    marginRight: spacingX._10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
  card: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    marginBottom: spacingY._10,
    borderWidth: 1,
    borderColor: colors.neutral700,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    flex: 1,
  },
  colorIndicator: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
  actions: {
    flexDirection: "row",
    gap: spacingX._10,
  },
  actionButton: {
    padding: spacingX._5,
  },
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountContainer: {
    flex: 1,
  },
  nextPaymentContainer: {
    alignItems: "flex-end",
  },
  inactiveOverlay: {
    position: "absolute",
    top: spacingY._10,
    right: spacingX._15,
    backgroundColor: colors.neutral700,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._10,
  },
});
