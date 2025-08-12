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

interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextPayment: Date;
  isActive: boolean;
  color: string;
}

interface RecurringPaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (payment: Omit<RecurringPayment, "id" | "nextPayment">) => void;
  editingPayment?: RecurringPayment | null;
}

const RecurringPaymentModal: React.FC<RecurringPaymentModalProps> = ({
  isVisible,
  onClose,
  onSave,
  editingPayment,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Servicios",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    isActive: true,
  });

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        name: editingPayment.name,
        amount: editingPayment.amount.toString(),
        category: editingPayment.category,
        frequency: editingPayment.frequency,
        isActive: editingPayment.isActive,
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        category: "Servicios",
        frequency: "monthly",
        isActive: true,
      });
    }
  }, [editingPayment]);

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    ) {
      return;
    }

    const selectedCategory = CATEGORIES.find(
      (c) => c.name === formData.category
    );

    onSave({
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      isActive: formData.isActive,
      color: selectedCategory?.color || colors.neutral400,
    });

    setFormData({
      name: "",
      amount: "",
      category: "Servicios",
      frequency: "monthly",
      isActive: true,
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
            {editingPayment
              ? "Editar Pago Recurrente"
              : "Nuevo Pago Recurrente"}
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Nombre del pago */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Nombre del Pago
          </Typo>
          <TextInput
            style={styles.input}
            placeholder="Ej: Netflix, Renta, etc."
            placeholderTextColor={colors.neutral600}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        {/* Cantidad */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Cantidad
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

        {/* Frecuencia */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Frecuencia
          </Typo>
          <View style={styles.frequencyGrid}>
            {(["daily", "weekly", "monthly", "yearly"] as const).map(
              (frequency) => (
                <TouchableOpacity
                  key={frequency}
                  style={[
                    styles.frequencyButton,
                    formData.frequency === frequency &&
                      styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, frequency })}
                >
                  <Typo
                    size={12}
                    color={
                      formData.frequency === frequency
                        ? colors.black
                        : colors.neutral400
                    }
                    fontWeight={
                      formData.frequency === frequency ? "600" : "400"
                    }
                  >
                    {frequency === "daily"
                      ? "Diario"
                      : frequency === "weekly"
                      ? "Semanal"
                      : frequency === "monthly"
                      ? "Mensual"
                      : "Anual"}
                  </Typo>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Estado activo */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() =>
              setFormData({ ...formData, isActive: !formData.isActive })
            }
          >
            <View style={styles.toggleInfo}>
              <Typo size={14} color={colors.white}>
                Pago Activo
              </Typo>
              <Typo size={12} color={colors.neutral400}>
                El pago se ejecutará automáticamente
              </Typo>
            </View>
            <View
              style={[styles.toggle, formData.isActive && styles.toggleActive]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  formData.isActive && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Typo size={16} fontWeight="600" color={colors.black}>
            {editingPayment ? "Actualizar Pago" : "Crear Pago Recurrente"}
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default RecurringPaymentModal;

const styles = StyleSheet.create({
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
  frequencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._10,
    marginTop: spacingY._7,
  },
  frequencyButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: spacingY._10,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
  },
  frequencyButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    padding: spacingX._15,
    borderRadius: radius._10,
    marginTop: spacingY._7,
  },
  toggleInfo: {
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral600,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
});
