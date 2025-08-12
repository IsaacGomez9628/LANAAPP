import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import DateSelector from "@/components/DateSelector";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { CATEGORIES } from "@/constants/transactions";

interface Expense {
  amount: number;
  category: string;
  description: string;
  date: Date;
  type: "planned" | "recurring" | "manual";
}

interface ExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  currentBalance: number;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isVisible,
  onClose,
  onSave,
  currentBalance,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "Comida",
    description: "",
    date: new Date(),
  });

  const [warningShown, setWarningShown] = useState(false);

  const checkBudgetWarning = (amount: number) => {
    if (amount > currentBalance && !warningShown) {
      setWarningShown(true);
      Alert.alert(
        "⚠️ Saldo Insuficiente",
        `Este gasto excede tu saldo actual de $${currentBalance.toLocaleString(
          "es-MX"
        )}`,
        [{ text: "Entendido" }]
      );
    }
  };

  const handleAmountChange = (text: string) => {
    setFormData({ ...formData, amount: text });
    const amount = parseFloat(text);
    if (amount > 0) {
      checkBudgetWarning(amount);
    }
  };

  const handleSave = () => {
    const amount = parseFloat(formData.amount);
    if (!formData.amount || amount <= 0) {
      Alert.alert("Error", "Por favor ingresa una cantidad válida");
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert("Error", "Por favor ingresa una descripción");
      return;
    }

    onSave({
      amount,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: "manual",
    });

    setFormData({
      amount: "",
      category: "Comida",
      description: "",
      date: new Date(),
    });
    setWarningShown(false);
  };

  const remainingBalance = currentBalance - parseFloat(formData.amount || "0");

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
            Registrar Gasto
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Balance actual */}
        <View style={styles.balanceInfo}>
          <View style={styles.balanceItem}>
            <Typo size={12} color={colors.neutral400}>
              Saldo actual
            </Typo>
            <Typo size={16} fontWeight="600" color={colors.blue}>
              ${currentBalance.toLocaleString("es-MX")}
            </Typo>
          </View>
          {formData.amount && (
            <View style={styles.balanceItem}>
              <Typo size={12} color={colors.neutral400}>
                Saldo después
              </Typo>
              <Typo
                size={16}
                fontWeight="600"
                color={remainingBalance < 0 ? colors.rose : colors.green}
              >
                ${remainingBalance.toLocaleString("es-MX")}
              </Typo>
            </View>
          )}
        </View>

        {/* Cantidad */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Cantidad del Gasto
          </Typo>
          <TextInput
            style={[styles.input, remainingBalance < 0 && styles.inputError]}
            placeholder="$0.00"
            placeholderTextColor={colors.neutral600}
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={handleAmountChange}
          />
          {remainingBalance < 0 && (
            <Typo size={12} color={colors.rose} style={{ marginTop: 5 }}>
              Este gasto excede tu saldo disponible
            </Typo>
          )}
        </View>

        {/* Categoría */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Categoría
          </Typo>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  formData.category === category.name && {
                    backgroundColor: category.color + "30",
                    borderColor: category.color,
                  },
                ]}
                onPress={() =>
                  setFormData({ ...formData, category: category.name })
                }
              >
                <Typo
                  size={12}
                  color={
                    formData.category === category.name
                      ? category.color
                      : colors.neutral400
                  }
                >
                  {category.name}
                </Typo>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Descripción */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Descripción
          </Typo>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="¿En qué gastaste?"
            placeholderTextColor={colors.neutral600}
            multiline
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>

        {/* Fecha */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Fecha del Gasto
          </Typo>
          <DateSelector
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Typo size={16} fontWeight="600" color={colors.black}>
            Registrar Gasto
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ExpenseModal;

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
});
