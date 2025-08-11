import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface BudgetValidatorProps {
  currentBalance: number;
}

const BudgetValidator: React.FC<BudgetValidatorProps> = ({
  currentBalance,
}) => {
  const getBudgetStatus = () => {
    if (currentBalance < 1000) {
      return {
        color: colors.rose,
        icon: "Warning",
        message: "Saldo bajo - Considera reducir gastos",
        level: "Crítico",
      };
    } else if (currentBalance < 5000) {
      return {
        color: colors.yellow,
        icon: "Info",
        message: "Saldo moderado - Mantén control de gastos",
        level: "Precaución",
      };
    } else {
      return {
        color: colors.green,
        icon: "CheckCircle",
        message: "Saldo saludable - Puedes realizar gastos normalmente",
        level: "Bueno",
      };
    }
  };

  const status = getBudgetStatus();
  const IconComponent = Icons[status.icon as keyof typeof Icons] as any;

  return (
    <View style={[styles.container, { borderColor: status.color }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconComponent size={verticalScale(20)} color={status.color} />
        </View>
        <View style={styles.statusInfo}>
          <Typo size={14} fontWeight="600" color={status.color}>
            Estado del Presupuesto: {status.level}
          </Typo>
          <Typo size={12} color={colors.neutral400}>
            {status.message}
          </Typo>
        </View>
      </View>

      <View style={styles.recommendations}>
        <Typo size={12} color={colors.neutral400} style={{ marginBottom: 8 }}>
          Recomendaciones:
        </Typo>
        {currentBalance < 1000 ? (
          <>
            <Typo size={11} color={colors.neutral300}>
              • Revisa gastos recurrentes innecesarios
            </Typo>
            <Typo size={11} color={colors.neutral300}>
              • Considera aumentar ingresos
            </Typo>
            <Typo size={11} color={colors.neutral300}>
              • Evita gastos no esenciales
            </Typo>
          </>
        ) : currentBalance < 5000 ? (
          <>
            <Typo size={11} color={colors.neutral300}>
              • Mantén seguimiento de gastos diarios
            </Typo>
            <Typo size={11} color={colors.neutral300}>
              • Revisa presupuestos por categoría
            </Typo>
          </>
        ) : (
          <>
            <Typo size={11} color={colors.neutral300}>
              • Considera aumentar ahorros
            </Typo>
            <Typo size={11} color={colors.neutral300}>
              • Evalúa inversiones a largo plazo
            </Typo>
          </>
        )}
      </View>
    </View>
  );
};

export default BudgetValidator;

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
  section: {
    marginBottom: spacingY._25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginBottom: spacingY._10,
  },
  expenseIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: verticalScale(20),
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: spacingX._5,
    paddingVertical: 2,
    borderRadius: radius._6,
  },
  expenseAmount: {
    alignItems: "flex-end",
  },

  // BudgetValidator
  container: {
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._15,
    borderWidth: 1,
    marginBottom: spacingY._40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  iconContainer: {
    width: verticalScale(36),
    height: verticalScale(36),
    borderRadius: verticalScale(18),
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._12,
  },
  statusInfo: {
    flex: 1,
  },
  recommendations: {
    gap: 4,
  },
});
