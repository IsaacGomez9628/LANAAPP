import React, { useState } from "react";
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
import DateSelector from "@/components/DataSelector";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { Transaction, CATEGORIES } from "@/constants/transactions";

interface TransactionSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: any) => void;
  searchResults: Transaction[];
  onTransactionPress: (transaction: Transaction) => void;
}

const TransactionSearchModal: React.FC<TransactionSearchModalProps> = ({
  isVisible,
  onClose,
  onSearch,
  searchResults,
  onTransactionPress,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    importance: "all",
    dateRange: null as { start: Date; end: Date } | null,
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"start" | "end" | null>(
    null
  );

  const handleSearch = () => {
    onSearch(searchQuery, filters);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      type: "all",
      category: "all",
      importance: "all",
      dateRange: null,
    });
    onSearch("", {
      type: "all",
      category: "all",
      importance: "all",
      dateRange: null,
    });
  };

  const handleDateRangeSelect = (date: Date) => {
    if (activeFilter === "start") {
      setFilters({
        ...filters,
        dateRange: { ...filters.dateRange, start: date } as any,
      });
    } else if (activeFilter === "end") {
      setFilters({
        ...filters,
        dateRange: { ...filters.dateRange, end: date } as any,
      });
    }
    setActiveFilter(null);
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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return colors.rose;
      case "medium":
        return colors.yellow;
      case "low":
        return colors.green;
      default:
        return colors.neutral400;
    }
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
            Buscar Transacciones
          </Typo>
          <TouchableOpacity onPress={onClose}>
            <Icons.X size={verticalScale(24)} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icons.MagnifyingGlass
            size={verticalScale(20)}
            color={colors.neutral400}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción o categoría..."
            placeholderTextColor={colors.neutral500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icons.X size={verticalScale(18)} color={colors.neutral400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {/* Filtro por tipo */}
          <View style={styles.filterSection}>
            <Typo
              size={14}
              color={colors.neutral400}
              style={{ marginBottom: 8 }}
            >
              Tipo de Transacción
            </Typo>
            <View style={styles.filterOptions}>
              {[
                { key: "all", label: "Todas" },
                { key: "income", label: "Ingresos" },
                { key: "expense", label: "Gastos" },
                { key: "transfer", label: "Transferencias" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterButton,
                    filters.type === option.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, type: option.key })}
                >
                  <Typo
                    size={12}
                    color={
                      filters.type === option.key
                        ? colors.black
                        : colors.neutral400
                    }
                  >
                    {option.label}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro por categoría */}
          <View style={styles.filterSection}>
            <Typo
              size={14}
              color={colors.neutral400}
              style={{ marginBottom: 8 }}
            >
              Categoría
            </Typo>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.category === "all" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilters({ ...filters, category: "all" })}
                >
                  <Typo
                    size={12}
                    color={
                      filters.category === "all"
                        ? colors.black
                        : colors.neutral400
                    }
                  >
                    Todas
                  </Typo>
                </TouchableOpacity>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterButton,
                      filters.category === category.name && {
                        backgroundColor: category.color + "30",
                        borderColor: category.color,
                      },
                    ]}
                    onPress={() =>
                      setFilters({ ...filters, category: category.name })
                    }
                  >
                    <Typo
                      size={12}
                      color={
                        filters.category === category.name
                          ? category.color
                          : colors.neutral400
                      }
                    >
                      {category.name}
                    </Typo>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Filtro por importancia */}
          <View style={styles.filterSection}>
            <Typo
              size={14}
              color={colors.neutral400}
              style={{ marginBottom: 8 }}
            >
              Importancia
            </Typo>
            <View style={styles.filterOptions}>
              {[
                { key: "all", label: "Todas" },
                { key: "high", label: "Alta" },
                { key: "medium", label: "Media" },
                { key: "low", label: "Baja" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterButton,
                    filters.importance === option.key &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() =>
                    setFilters({ ...filters, importance: option.key })
                  }
                >
                  <Typo
                    size={12}
                    color={
                      filters.importance === option.key
                        ? colors.black
                        : colors.neutral400
                    }
                  >
                    {option.label}
                  </Typo>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtro por rango de fechas */}
          <View style={styles.filterSection}>
            <Typo
              size={14}
              color={colors.neutral400}
              style={{ marginBottom: 8 }}
            >
              Rango de Fechas
            </Typo>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setActiveFilter("start");
                  setShowDateRangePicker(true);
                }}
              >
                <Icons.Calendar
                  size={verticalScale(16)}
                  color={colors.neutral400}
                />
                <Typo size={12} color={colors.white}>
                  {filters.dateRange?.start
                    ? filters.dateRange.start.toLocaleDateString("es-MX")
                    : "Desde"}
                </Typo>
              </TouchableOpacity>
              <Typo size={12} color={colors.neutral400}>
                hasta
              </Typo>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setActiveFilter("end");
                  setShowDateRangePicker(true);
                }}
              >
                <Icons.Calendar
                  size={verticalScale(16)}
                  color={colors.neutral400}
                />
                <Typo size={12} color={colors.white}>
                  {filters.dateRange?.end
                    ? filters.dateRange.end.toLocaleDateString("es-MX")
                    : "Hasta"}
                </Typo>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Typo size={14} color={colors.rose}>
                Limpiar Filtros
              </Typo>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Typo size={14} fontWeight="600" color={colors.black}>
                Buscar
              </Typo>
            </TouchableOpacity>
          </View>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Typo size={16} fontWeight="600" style={{ marginBottom: 15 }}>
                Resultados ({searchResults.length})
              </Typo>
              {searchResults.map((transaction) => {
                const amount = formatAmount(
                  transaction.amount,
                  transaction.type
                );
                return (
                  <TouchableOpacity
                    key={transaction.id}
                    style={styles.resultItem}
                    onPress={() => {
                      onTransactionPress(transaction);
                      onClose();
                    }}
                  >
                    <View style={styles.resultContent}>
                      <View style={styles.resultHeader}>
                        <Typo size={14} fontWeight="500">
                          {transaction.description}
                        </Typo>
                        <View style={styles.resultInfo}>
                          <View
                            style={[
                              styles.importanceIndicator,
                              {
                                backgroundColor: getImportanceColor(
                                  transaction.importance
                                ),
                              },
                            ]}
                          />
                          <Typo size={16} fontWeight="600" color={amount.color}>
                            {amount.text}
                          </Typo>
                        </View>
                      </View>
                      <View style={styles.resultDetails}>
                        <Typo size={12} color={colors.neutral400}>
                          {transaction.category} •{" "}
                          {transaction.date.toLocaleDateString("es-MX")}
                        </Typo>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {searchResults.length === 0 &&
            (searchQuery || filters.type !== "all") && (
              <View style={styles.noResults}>
                <Icons.MagnifyingGlass
                  size={verticalScale(40)}
                  color={colors.neutral600}
                />
                <Typo size={14} color={colors.neutral400}>
                  No se encontraron transacciones
                </Typo>
              </View>
            )}
        </ScrollView>

        {/* Selector de fecha */}
        {showDateRangePicker && activeFilter && (
          <DateSelector
            value={
              activeFilter === "start"
                ? filters.dateRange?.start || new Date()
                : filters.dateRange?.end || new Date()
            }
            onChange={handleDateRangeSelect}
          />
        )}
      </View>
    </Modal>
  );
};

export default TransactionSearchModal;

const styles = StyleSheet.create({
  // TransactionSearchModal styles
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
    gap: spacingX._10,
  },
  filterButton: {
    paddingHorizontal: spacingX._12,
    paddingVertical: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
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
    borderRadius: radius._10,
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._10,
    gap: spacingX._5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacingX._15,
    marginBottom: spacingY._20,
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
    marginBottom: spacingY._10,
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
    gap: spacingX._10,
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
