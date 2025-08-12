import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "./Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface DateSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Seleccionar fecha",
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-MX", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Icons.Calendar size={verticalScale(20)} color={colors.neutral400} />
        <Typo size={14} color={colors.white}>
          {value ? formatDate(value) : placeholder}
        </Typo>
        <Icons.CaretDown size={verticalScale(16)} color={colors.neutral400} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={minDate}
          maximumDate={maxDate}
          style={Platform.OS === "ios" ? styles.iosPicker : undefined}
        />
      )}
    </View>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
  container: {
    marginTop: spacingY._7,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral700,
    borderRadius: radius._10,
    padding: spacingX._12,
    gap: spacingX._10,
  },
  iosPicker: {
    backgroundColor: colors.neutral700,
    marginTop: spacingY._10,
    borderRadius: radius._10,
  },
});
