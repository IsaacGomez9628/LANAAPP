// LanaApp/components/budget/BudgetModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { CATEGORIES } from "@/constants/transactions";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  color: string;
  period: "monthly" | "weekly" | "daily";
}

interface BudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, "id" | "spent">) => void;
  editingBudget?: Budget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isVisible,
  onClose,
  onSave,
  editingBudget,
}) => {
  const [formData, setFormData] = useState({
    category: "Comida",
    amount: "",
    period: "monthly" as "monthly" | "weekly" | "daily",
  });

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category,
        amount: editingBudget.amount.toString(),
        period: editingBudget.period,
      });
    } else {
      setFormData({
        category: "Comida",
        amount: "",
        period: "monthly",
      });
    }
  }, [editingBudget]);

  const handleSave = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    const selectedCategory = CATEGORIES.find(
      (c) => c.name === formData.category
    );

    onSave({
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
      color: selectedCategory?.color || colors.neutral400,
    });

    setFormData({
      category: "Comida",
      amount: "",
      period: "monthly",
    });
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
            {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
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

        {/* Cantidad */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Cantidad del Presupuesto
          </Typo>
          <TextInput
            style={styles.input}
            placeholder="$0.00"
            placeholderTextColor={colors.neutral600}
            keyboardType="numeric"
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
          />
        </View>

        {/* Período */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Período
          </Typo>
          <View style={styles.periodSelector}>
            {(["monthly", "weekly", "daily"] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  formData.period === period && styles.periodButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, period })}
              >
                <Typo
                  size={12}
                  color={
                    formData.period === period
                      ? colors.black
                      : colors.neutral400
                  }
                  fontWeight={formData.period === period ? "600" : "400"}
                >
                  {period === "monthly"
                    ? "Mensual"
                    : period === "weekly"
                    ? "Semanal"
                    : "Diario"}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Typo size={16} fontWeight="600" color={colors.black}>
            {editingBudget ? "Actualizar Presupuesto" : "Crear Presupuesto"}
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default BudgetModal;

const styles = StyleSheet.create({
  // BudgetModal styles
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
  periodSelector: {
    flexDirection: "row",
    gap: spacingX._10,
    marginTop: spacingY._7,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
});
