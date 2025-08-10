import React from "react";
import { View, StyleSheet } from "react-native";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface TransactionTotalsBarProps {
  income: number;
  expenses: number;
  total: number;
}

const TransactionTotalsBar: React.FC<TransactionTotalsBarProps> = ({
  income,
  expenses,
  total,
}) => {
  return (
    <View style={styles.totalsBar}>
      <View style={styles.totalItem}>
        <Typo size={12} color={colors.neutral400}>
          Income
        </Typo>
        <Typo size={16} color={colors.blue} fontWeight="600">
          {income.toLocaleString("es-MX")}
        </Typo>
      </View>
      <View style={styles.totalItem}>
        <Typo size={12} color={colors.neutral400}>
          Exp.
        </Typo>
        <Typo size={16} color={colors.rose} fontWeight="600">
          {expenses.toLocaleString("es-MX")}
        </Typo>
      </View>
      <View style={styles.totalItem}>
        <Typo size={12} color={colors.neutral400}>
          Total
        </Typo>
        <Typo size={16} color={colors.white} fontWeight="600">
          {total.toLocaleString("es-MX")}
        </Typo>
      </View>
    </View>
  );
};

export default TransactionTotalsBar;

const styles = StyleSheet.create({
  totalsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.neutral800,
    paddingVertical: spacingY._12,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._10,
    borderRadius: radius._10,
  },
  totalItem: {
    alignItems: "center",
  },
});
