import React, { useState } from "react";
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
import { Transaction, CATEGORIES } from "@/constants/transactions";

interface TransactionDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isVisible,
  onClose,
  transaction,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

  React.useEffect(() => {
    if (transaction) {
      setEditData(transaction);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editData.amount && editData.amount > 0 && editData.description) {
      onEdit({
        ...transaction,
        ...editData,
        amount: editData.amount,
        description: editData.description,
      } as Transaction);
      setIsEditing(false);
    } else {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
    }
  };

  const handleCancelEdit = () => {
    setEditData(transaction);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Transacción",
      "¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(transaction.id),
        },
      ]
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "expense" ? "-" : type === "income" ? "+" : "";
    const color =
      type === "expense"
        ? colors.rose
        : type === "income"
        ? colors.green
        : colors.neutral400;
    return { text: `${prefix}$${amount.toLocaleString("es-MX")}`, color };
  };

  type IconName = keyof typeof Icons;

  const getImportanceInfo = (importance: string) => {
    switch (importance) {
      case "high":
        return {
          color: colors.rose,
          label: "Alta",
          icon: "ArrowUp" as IconName,
        };
      case "medium":
        return {
          color: colors.yellow,
          label: "Media",
          icon: "Minus" as IconName,
        };
      case "low":
        return {
          color: colors.green,
          label: "Baja",
          icon: "ArrowDown" as IconName,
        };
      default:
        return {
          color: colors.neutral400,
          label: "Media",
          icon: "Minus" as IconName,
        };
    }
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "income":
        return { label: "Ingreso", icon: "TrendUp", color: colors.green };
      case "expense":
        return { label: "Gasto", icon: "TrendDown", color: colors.rose };
      case "transfer":
        return {
          label: "Transferencia",
          icon: "ArrowsLeftRight",
          color: colors.blue,
        };
      default:
        return {
          label: "Desconocido",
          icon: "Question",
          color: colors.neutral400,
        };
    }
  };

  const amount = formatAmount(transaction.amount, transaction.type);
  const importance = getImportanceInfo(transaction.importance);
  const typeInfo = getTypeInfo(transaction.type);
  const category = CATEGORIES.find((c) => c.name === transaction.category);
  const IconComponent = Icons[
    importance.icon as keyof typeof Icons
  ] as React.ElementType;
  const TypeIconComponent = Icons[typeInfo.icon as keyof typeof Icons] as any;

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
            {isEditing ? "Editar Transacción" : "Detalles de Transacción"}
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {!isEditing ? (
          // Vista de solo lectura
          <View style={styles.detailsContainer}>
            {/* Información principal */}
            <View style={styles.mainInfo}>
              <View style={styles.amountContainer}>
                <Typo size={32} fontWeight="700" color={amount.color}>
                  {amount.text}
                </Typo>
                <View style={styles.typeContainer}>
                  <TypeIconComponent
                    size={verticalScale(16)}
                    color={typeInfo.color}
                  />
                  <Typo size={14} color={typeInfo.color} fontWeight="500">
                    {typeInfo.label}
                  </Typo>
                </View>
              </View>

              <View style={styles.importanceContainer}>
                <IconComponent
                  size={verticalScale(18)}
                  color={importance.color}
                />
                <Typo size={14} color={importance.color} fontWeight="500">
                  {importance.label}
                </Typo>
              </View>
            </View>

            {/* Información detallada */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Icons.FileText
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typo size={12} color={colors.neutral400}>
                    Descripción
                  </Typo>
                  <Typo size={14} fontWeight="500">
                    {transaction.description}
                  </Typo>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View
                  style={[
                    styles.infoIcon,
                    { backgroundColor: category?.color + "20" },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category?.color || colors.neutral400 },
                    ]}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typo size={12} color={colors.neutral400}>
                    Categoría
                  </Typo>
                  <Typo size={14} fontWeight="500">
                    {transaction.category}
                  </Typo>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Icons.Calendar
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typo size={12} color={colors.neutral400}>
                    Fecha
                  </Typo>
                  <Typo size={14} fontWeight="500">
                    {transaction.date.toLocaleDateString("es-MX", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typo>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Icons.Clock
                    size={verticalScale(20)}
                    color={colors.neutral400}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Typo size={12} color={colors.neutral400}>
                    ID de Transacción
                  </Typo>
                  <Typo size={14} fontWeight="500" color={colors.neutral300}>
                    #{transaction.id.slice(-8).toUpperCase()}
                  </Typo>
                </View>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Icons.PencilSimple
                  size={verticalScale(18)}
                  color={colors.white}
                />
                <Typo size={14} fontWeight="500" color={colors.white}>
                  Editar
                </Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Icons.Trash size={verticalScale(18)} color={colors.white} />
                <Typo size={14} fontWeight="500" color={colors.white}>
                  Eliminar
                </Typo>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Vista de edición
          <View style={styles.editContainer}>
            <View style={styles.editField}>
              <Typo size={14} color={colors.neutral400}>
                Cantidad
              </Typo>
              <TextInput
                style={styles.editInput}
                value={editData.amount?.toString() || ""}
                onChangeText={(text) =>
                  setEditData({ ...editData, amount: parseFloat(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.neutral600}
              />
            </View>

            <View style={styles.editField}>
              <Typo size={14} color={colors.neutral400}>
                Descripción
              </Typo>
              <TextInput
                style={[styles.editInput, { height: 60 }]}
                value={editData.description || ""}
                onChangeText={(text) =>
                  setEditData({ ...editData, description: text })
                }
                placeholder="Descripción de la transacción"
                placeholderTextColor={colors.neutral600}
                multiline
              />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Typo size={14} color={colors.neutral400}>
                  Cancelar
                </Typo>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Typo size={14} fontWeight="600" color={colors.black}>
                  Guardar Cambios
                </Typo>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default TransactionDetailsModal;

const styles = StyleSheet.create({
  detailsContainer: {
    gap: spacingY._20,
  },
  mainInfo: {
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._15,
    padding: spacingX._20,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: spacingY._15,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
    marginTop: spacingY._5,
  },
  importanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
    backgroundColor: colors.neutral600,
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    borderRadius: radius._12,
  },
  infoGrid: {
    gap: spacingY._15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._15,
  },
  infoIcon: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: radius._10,
    backgroundColor: colors.neutral700,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryDot: {
    width: verticalScale(12),
    height: verticalScale(12),
    borderRadius: verticalScale(6),
  },
  infoContent: {
    flex: 1,
    gap: spacingY._5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacingX._15,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    backgroundColor: colors.blue,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
    backgroundColor: colors.rose,
    paddingVertical: spacingY._15,
    borderRadius: radius._12,
  },
  editContainer: {
    gap: spacingY._20,
  },
  editField: {
    gap: spacingY._10,
  },
  editInput: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    color: colors.white,
    fontSize: verticalScale(14),
  },
  editActions: {
    flexDirection: "row",
    gap: spacingX._15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacingY._15,
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacingY._15,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius._12,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._12,
    paddingHorizontal: spacingX._15,
    marginBottom: spacingY._20,
    gap: spacingX._10,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: verticalScale(14),
    paddingVertical: spacingY._12,
  },
  filtersContainer: {
    flex: 1,
  },
  filterSection: {
    marginBottom: spacingY._20,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacingX._7,
  },
  filterButton: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._7,
    backgroundColor: colors.neutral700,
    borderRadius: radius._6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._6,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._7,
    gap: spacingX._5,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacingY._12,
    alignItems: "center",
    backgroundColor: colors.rose + "20",
    borderRadius: radius._10,
  },
  searchButton: {
    flex: 1,
    paddingVertical: spacingY._12,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius._10,
  },
  resultsSection: {
    marginTop: spacingY._10,
  },
  resultItem: {
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._15,
    marginBottom: spacingY._7,
  },
  resultContent: {
    gap: spacingY._5,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._7,
  },
  importanceIndicator: {
    width: verticalScale(8),
    height: verticalScale(8),
    borderRadius: verticalScale(4),
  },
  resultDetails: {
    marginTop: spacingY._5,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacingY._40,
  },
});
