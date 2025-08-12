import React, { useState } from "react";
import { SavingsGoal } from "@/types";
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface AddMoneyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (amount: number, description: string) => void;
  goal: SavingsGoal | null;
  currentBalance: number;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isVisible,
  onClose,
  onSave,
  goal,
  currentBalance,
}) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;
  const amountValue = parseFloat(amount) || 0;
  const wouldComplete = goal.currentAmount + amountValue >= goal.targetAmount;
  const exceedsBalance = amountValue > currentBalance;

  const handleSave = () => {
    if (!amount || amountValue <= 0) {
      Alert.alert("Error", "Por favor ingresa una cantidad válida");
      return;
    }

    if (exceedsBalance) {
      Alert.alert("Error", "No tienes suficiente saldo para este ahorro");
      return;
    }

    onSave(amountValue, description);
    setAmount("");
    setDescription("");
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Typo size={20} fontWeight="600">
            Ahorrar para: {goal.name}
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Información de la meta */}
        <View style={styles.goalInfo}>
          <View style={styles.goalProgress}>
            <Typo size={12} color={colors.neutral400}>
              Progreso actual
            </Typo>
            <Typo size={18} fontWeight="600" color={goal.color}>
              ${goal.currentAmount.toLocaleString("es-MX")} / $
              {goal.targetAmount.toLocaleString("es-MX")}
            </Typo>
          </View>
          <View style={styles.goalRemaining}>
            <Typo size={12} color={colors.neutral400}>
              Te faltan
            </Typo>
            <Typo size={16} fontWeight="600" color={colors.orange}>
              ${remaining.toLocaleString("es-MX")}
            </Typo>
          </View>
        </View>

        {/* Balance disponible */}
        <View style={styles.balanceInfo}>
          <View style={styles.balanceItem}>
            <Typo size={12} color={colors.neutral400}>
              Saldo disponible
            </Typo>
            <Typo size={16} fontWeight="600" color={colors.blue}>
              ${currentBalance.toLocaleString("es-MX")}
            </Typo>
          </View>
          {amountValue > 0 && (
            <View style={styles.balanceItem}>
              <Typo size={12} color={colors.neutral400}>
                Saldo después
              </Typo>
              <Typo
                size={16}
                fontWeight="600"
                color={exceedsBalance ? colors.rose : colors.green}
              >
                ${(currentBalance - amountValue).toLocaleString("es-MX")}
              </Typo>
            </View>
          )}
        </View>

        {/* Cantidad a ahorrar */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Cantidad a Ahorrar
          </Typo>
          <TextInput
            style={[styles.input, exceedsBalance && styles.inputError]}
            placeholder="$0.00"
            placeholderTextColor={colors.neutral600}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          {exceedsBalance && (
            <View style={styles.warningContainer}>
              <Icons.Warning size={verticalScale(16)} color={colors.rose} />
              <Typo size={12} color={colors.rose}>
                Esta cantidad excede tu saldo disponible
              </Typo>
            </View>
          )}
          {wouldComplete && !exceedsBalance && (
            <View style={styles.successContainer}>
              <Icons.CheckCircle
                size={verticalScale(16)}
                color={colors.green}
              />
              <Typo size={12} color={colors.green}>
                ¡Con este ahorro completarás tu meta!
              </Typo>
            </View>
          )}
        </View>

        {/* Descripción */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Descripción (Opcional)
          </Typo>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Ej: Ahorro quincenal, venta de algo..."
            placeholderTextColor={colors.neutral600}
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Atajos rápidos */}
        <View style={styles.quickAmounts}>
          <Typo
            size={14}
            color={colors.neutral400}
            style={{ marginBottom: 10 }}
          >
            Atajos Rápidos
          </Typo>
          <View style={styles.quickAmountButtons}>
            {[
              { label: "Meta mensual", value: goal.monthlyTarget },
              { label: "Completar", value: remaining },
              { label: "10%", value: currentBalance * 0.1 },
              { label: "5%", value: currentBalance * 0.05 },
            ]
              .filter((item) => item.value > 0 && item.value <= currentBalance)
              .map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(item.value.toFixed(0))}
                >
                  <Typo size={11} color={colors.neutral300}>
                    {item.label}
                  </Typo>
                  <Typo size={12} fontWeight="600" color={colors.white}>
                    ${item.value.toLocaleString("es-MX")}
                  </Typo>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            exceedsBalance && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={exceedsBalance}
        >
          <Typo
            size={16}
            fontWeight="600"
            color={exceedsBalance ? colors.neutral500 : colors.black}
          >
            Confirmar Ahorro
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default { AddMoneyModal };

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
    maxHeight: "95%",
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: spacingY._5,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: spacingY._5,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutral600,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.neutral700,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginBottom: spacingY._15,
  },
  goalProgress: {
    alignItems: "center",
  },
  goalRemaining: {
    alignItems: "center",
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.neutral700,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginBottom: spacingY._15,
  },
  balanceItem: {
    alignItems: "center",
  },
  quickAmounts: {
    marginBottom: spacingY._15,
  },
  quickAmountButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._7,
  },
  quickAmountButton: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: radius._6,
    alignItems: "center",
    minWidth: "22%",
  },
});
