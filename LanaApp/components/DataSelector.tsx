import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "./Typo";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";

interface DateSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("es-MX", options);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Icons.Calendar size={verticalScale(20)} color={colors.neutral400} />
        <Typo size={14} color={value ? colors.white : colors.neutral500}>
          {value ? formatDate(value) : placeholder}
        </Typo>
        <Icons.CaretDown size={verticalScale(16)} color={colors.neutral400} />
      </TouchableOpacity>

      {Platform.OS === "ios" ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Typo size={16} color={colors.neutral400}>
                    Cancelar
                  </Typo>
                </TouchableOpacity>
                <Typo size={18} fontWeight="600">
                  Seleccionar Fecha
                </Typo>
                <TouchableOpacity onPress={handleConfirm}>
                  <Typo size={16} color={colors.primary} fontWeight="600">
                    Confirmar
                  </Typo>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                textColor={colors.white}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
        )
      )}
    </>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._12,
    gap: spacingX._10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerContainer: {
    backgroundColor: colors.neutral800,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    paddingBottom: Platform.OS === "ios" ? spacingY._30 : spacingY._20,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral700,
  },
  datePicker: {
    height: verticalScale(200),
    backgroundColor: colors.neutral800,
  },
});
