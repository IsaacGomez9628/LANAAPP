import React, { useState, useEffect } from "react";
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

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: string;
  priority: "high" | "medium" | "low";
  color: string;
  description: string;
  isActive: boolean;
  monthlyTarget: number;
}

interface SavingsGoalsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (
    goal: Omit<SavingsGoal, "id" | "currentAmount" | "monthlyTarget">
  ) => void;
  editingGoal?: SavingsGoal | null;
}

const GOAL_CATEGORIES = [
  { name: "Emergencias", color: colors.rose, icon: "ShieldWarning" },
  { name: "Vacaciones", color: colors.blue, icon: "Airplane" },
  { name: "Casa", color: colors.green, icon: "House" },
  { name: "Auto", color: colors.orange, icon: "Car" },
  { name: "Educación", color: colors.purple, icon: "GraduationCap" },
  { name: "Inversión", color: colors.cyan, icon: "TrendUp" },
  { name: "Tecnología", color: colors.pink, icon: "Laptop" },
  { name: "Salud", color: colors.yellow, icon: "Heart" },
  { name: "Otro", color: colors.neutral400, icon: "Target" },
];

const SavingsGoalsModal: React.FC<SavingsGoalsModalProps> = ({
  isVisible,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año por defecto
    category: "Emergencias",
    priority: "medium" as "high" | "medium" | "low",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        targetAmount: editingGoal.targetAmount.toString(),
        deadline: editingGoal.deadline,
        category: editingGoal.category,
        priority: editingGoal.priority,
        description: editingGoal.description,
        isActive: editingGoal.isActive,
      });
    } else {
      setFormData({
        name: "",
        targetAmount: "",
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        category: "Emergencias",
        priority: "medium",
        description: "",
        isActive: true,
      });
    }
  }, [editingGoal]);

  const calculateMonthsToDeadline = () => {
    const now = new Date();
    const diffTime = formData.deadline.getTime() - now.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(1, diffMonths);
  };

  const calculateMonthlyTarget = () => {
    const targetAmount = parseFloat(formData.targetAmount) || 0;
    const months = calculateMonthsToDeadline();
    return targetAmount / months;
  };

  const handleSave = () => {
    const targetAmount = parseFloat(formData.targetAmount);

    if (!formData.name.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para la meta");
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      Alert.alert("Error", "Por favor ingresa una cantidad válida");
      return;
    }

    if (formData.deadline <= new Date()) {
      Alert.alert("Error", "La fecha límite debe ser en el futuro");
      return;
    }

    const selectedCategory = GOAL_CATEGORIES.find(
      (c) => c.name === formData.category
    );

    onSave({
      name: formData.name,
      targetAmount,
      deadline: formData.deadline,
      category: formData.category,
      priority: formData.priority,
      color: selectedCategory?.color || colors.neutral400,
      description: formData.description,
      isActive: formData.isActive,
    });

    setFormData({
      name: "",
      targetAmount: "",
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      category: "Emergencias",
      priority: "medium",
      description: "",
      isActive: true,
    });
  };

  const monthlyTarget = calculateMonthlyTarget();
  const monthsRemaining = calculateMonthsToDeadline();

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
            {editingGoal ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Nombre de la meta */}
          <View style={styles.inputContainer}>
            <Typo size={14} color={colors.neutral400}>
              Nombre de la Meta
            </Typo>
            <TextInput
              style={styles.input}
              placeholder="Ej: Fondo de emergencia, Vacaciones..."
              placeholderTextColor={colors.neutral600}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          {/* Cantidad objetivo */}
          <View style={styles.inputContainer}>
            <Typo size={14} color={colors.neutral400}>
              Cantidad Objetivo
            </Typo>
            <TextInput
              style={styles.input}
              placeholder="$0.00"
              placeholderTextColor={colors.neutral600}
              keyboardType="numeric"
              value={formData.targetAmount}
              onChangeText={(text) =>
                setFormData({ ...formData, targetAmount: text })
              }
            />
            {monthlyTarget > 0 && (
              <View style={styles.calculationInfo}>
                <Icons.Calculator
                  size={verticalScale(16)}
                  color={colors.blue}
                />
                <Typo size={12} color={colors.blue}>
                  Meta mensual: ${monthlyTarget.toLocaleString("es-MX")} (
                  {monthsRemaining} meses)
                </Typo>
              </View>
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
              {GOAL_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.name}
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

          {/* Fecha límite */}
          <View style={styles.inputContainer}>
            <Typo size={14} color={colors.neutral400}>
              Fecha Límite
            </Typo>
            <DateSelector
              value={formData.deadline}
              onChange={(date) => setFormData({ ...formData, deadline: date })}
              minDate={new Date()}
            />
          </View>

          {/* Prioridad */}
          <View style={styles.inputContainer}>
            <Typo size={14} color={colors.neutral400}>
              Prioridad
            </Typo>
            <View style={styles.prioritySelector}>
              {(["high", "medium", "low"] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority && {
                      backgroundColor:
                        priority === "high"
                          ? colors.rose + "30"
                          : priority === "medium"
                          ? colors.yellow + "30"
                          : colors.green + "30",
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, priority })}
                >
                  <Typo
                    size={12}
                    color={
                      formData.priority === priority
                        ? priority === "high"
                          ? colors.rose
                          : priority === "medium"
                          ? colors.yellow
                          : colors.green
                        : colors.neutral400
                    }
                  >
                    {priority === "high"
                      ? "Alta"
                      : priority === "medium"
                      ? "Media"
                      : "Baja"}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Typo size={14} color={colors.neutral400}>
              Descripción (Opcional)
            </Typo>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Describe tu meta de ahorro..."
              placeholderTextColor={colors.neutral600}
              multiline
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
            />
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
                  Meta Activa
                </Typo>
                <Typo size={12} color={colors.neutral400}>
                  Las metas activas aparecen en el dashboard
                </Typo>
              </View>
              <View
                style={[
                  styles.toggle,
                  formData.isActive && styles.toggleActive,
                ]}
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

          {/* Recomendaciones */}
          {monthlyTarget > 0 && (
            <View style={styles.recommendationContainer}>
              <View style={styles.recommendationHeader}>
                <Icons.Lightbulb
                  size={verticalScale(18)}
                  color={colors.yellow}
                />
                <Typo size={14} fontWeight="600" color={colors.yellow}>
                  Recomendaciones
                </Typo>
              </View>
              <View style={styles.recommendationList}>
                <Typo size={12} color={colors.neutral300}>
                  • Configura un pago recurrente automático de $
                  {monthlyTarget.toFixed(0)}
                </Typo>
                <Typo size={12} color={colors.neutral300}>
                  • Revisa tu progreso cada semana
                </Typo>
                {formData.priority === "high" && (
                  <Typo size={12} color={colors.neutral300}>
                    • Considera reducir gastos no esenciales para esta meta
                    prioritaria
                  </Typo>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Botón Guardar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Typo size={16} fontWeight="600" color={colors.black}>
            {editingGoal ? "Actualizar Meta" : "Crear Meta de Ahorro"}
          </Typo>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SavingsGoalsModal;

const styles = StyleSheet.create({
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
  prioritySelector: {
    flexDirection: "row",
    gap: spacingX._10,
    marginTop: spacingY._7,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
  },
  calculationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginTop: spacingY._5,
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
  recommendationContainer: {
    backgroundColor: colors.yellow + "10",
    borderWidth: 1,
    borderColor: colors.yellow + "30",
    borderRadius: radius._10,
    padding: spacingX._15,
    marginTop: spacingY._10,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    marginBottom: spacingY._10,
  },
  recommendationList: {
    gap: spacingY._5,
  },
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
});
