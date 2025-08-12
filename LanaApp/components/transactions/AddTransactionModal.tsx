import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import {
  Transaction,
  TransactionType,
  ImportanceType,
  CATEGORIES,
} from "@/constants/transactions";

interface AddTransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id">) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: "expense",
    amount: 0,
    category: "Otros",
    date: new Date(),
    description: "",
    importance: "medium",
  });

  const handleSave = () => {
    onSave({
      type: formData.type as TransactionType,
      amount: formData.amount || 0,
      category: formData.category || "Otros",
      date: formData.date || new Date(),
      description: formData.description || "",
      importance: formData.importance as ImportanceType,
    });

    // Reset form
    setFormData({
      type: "expense",
      amount: 0,
      category: "Otros",
      date: new Date(),
      description: "",
      importance: "medium",
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
            Nueva Transacción
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Tipo de transacción */}
        <View style={styles.typeSelector}>
          {(["income", "expense", "transfer"] as TransactionType[]).map(
            (type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Typo
                  size={14}
                  color={
                    formData.type === type ? colors.black : colors.neutral400
                  }
                  fontWeight={formData.type === type ? "600" : "400"}
                >
                  {type === "income"
                    ? "Ingreso"
                    : type === "expense"
                    ? "Gasto"
                    : "Transferencia"}
                </Typo>
              </TouchableOpacity>
            )
          )}
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
            value={formData.amount?.toString() || ""}
            onChangeText={(text) =>
              setFormData({ ...formData, amount: parseFloat(text) || 0 })
            }
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

        {/* Fecha */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Fecha
          </Typo>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icons.Calendar
              size={verticalScale(20)}
              color={colors.neutral400}
            />
            <Typo size={14} color={colors.white}>
              {formData.date?.toLocaleDateString("es-MX")}
            </Typo>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setFormData({ ...formData, date });
            }}
          />
        )}

        {/* Importancia */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Importancia
          </Typo>
          <View style={styles.importanceSelector}>
            {(["high", "medium", "low"] as ImportanceType[]).map(
              (importance) => (
                <TouchableOpacity
                  key={importance}
                  style={[
                    styles.importanceButton,
                    formData.importance === importance && {
                      backgroundColor:
                        importance === "high"
                          ? colors.rose + "30"
                          : importance === "medium"
                          ? colors.yellow + "30"
                          : colors.green + "30",
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, importance })}
                >
                  <Typo
                    size={12}
                    color={
                      formData.importance === importance
                        ? importance === "high"
                          ? colors.rose
                          : importance === "medium"
                          ? colors.yellow
                          : colors.green
                        : colors.neutral400
                    }
                  >
                    {importance === "high"
                      ? "Alta"
                      : importance === "medium"
                      ? "Media"
                      : "Baja"}
                  </Typo>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.inputContainer}>
          <Typo size={14} color={colors.neutral400}>
            Descripción
          </Typo>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Descripción opcional..."
            placeholderTextColor={colors.neutral600}
            multiline
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Typo size={16} fontWeight="600" color={colors.black}>
            Guardar Transacción
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default AddTransactionModal;

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
  typeSelector: {
    flexDirection: "row",
    marginBottom: spacingY._20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    marginHorizontal: spacingX._5,
    borderRadius: radius._10,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._12,
    marginTop: spacingY._7,
    gap: spacingX._10,
  },
  importanceSelector: {
    flexDirection: "row",
    gap: spacingX._10,
    marginTop: spacingY._7,
  },
  importanceButton: {
    flex: 1,
    paddingVertical: spacingY._7,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
    alignItems: "center",
    marginTop: spacingY._20,
  },
});
