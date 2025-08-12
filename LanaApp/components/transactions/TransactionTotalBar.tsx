import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";

interface TransactionTotalsBarProps {
  income: number;
  expenses: number;
  total: number;
  count?: number;
  balance?: number;
  onBalancePress?: () => void;
}

const TransactionTotalsBar: React.FC<TransactionTotalsBarProps> = ({
  income,
  expenses,
  total,
  count = 0,
  balance,
  onBalancePress,
}) => {
  const netChange = income - expenses;
  const isPositive = netChange >= 0;

  return (
    <Animated.View entering={FadeIn.springify()} style={styles.container}>
      <View style={styles.totalsContainer}>
        {/* Ingresos */}
        <View style={styles.totalItem}>
          <View style={styles.totalHeader}>
            <Icons.TrendUp
              size={verticalScale(16)}
              color={colors.green}
              weight="fill"
            />
            <Typo size={11} color={colors.neutral400}>
              Ingresos
            </Typo>
          </View>
          <Typo size={15} color={colors.green} fontWeight="600">
            ${income.toLocaleString("es-MX")}
          </Typo>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Gastos */}
        <View style={styles.totalItem}>
          <View style={styles.totalHeader}>
            <Icons.TrendDown
              size={verticalScale(16)}
              color={colors.rose}
              weight="fill"
            />
            <Typo size={11} color={colors.neutral400}>
              Gastos
            </Typo>
          </View>
          <Typo size={15} color={colors.rose} fontWeight="600">
            ${expenses.toLocaleString("es-MX")}
          </Typo>
        </View>

        {/* Separador */}
        <View style={styles.separator} />

        {/* Balance del período */}
        <View style={styles.totalItem}>
          <View style={styles.totalHeader}>
            <Icons.Equals
              size={verticalScale(16)}
              color={isPositive ? colors.blue : colors.orange}
              weight="bold"
            />
            <Typo size={11} color={colors.neutral400}>
              Balance
            </Typo>
          </View>
          <Typo
            size={15}
            color={isPositive ? colors.blue : colors.orange}
            fontWeight="600"
          >
            ${Math.abs(total).toLocaleString("es-MX")}
          </Typo>
        </View>

        {/* Balance actual (si está disponible) */}
        {balance !== undefined && (
          <>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.totalItem}
              onPress={onBalancePress}
              activeOpacity={0.7}
            >
              <View style={styles.totalHeader}>
                <Icons.Wallet
                  size={verticalScale(16)}
                  color={colors.neutral300}
                  weight="fill"
                />
                <Typo size={11} color={colors.neutral400}>
                  Actual
                </Typo>
              </View>
              <Typo size={15} color={colors.white} fontWeight="600">
                ${balance.toLocaleString("es-MX")}
              </Typo>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Información adicional */}
      {count > 0 && (
        <View style={styles.additionalInfo}>
          <View style={styles.infoItem}>
            <Icons.ListNumbers
              size={verticalScale(14)}
              color={colors.neutral500}
            />
            <Typo size={11} color={colors.neutral500}>
              {count} transacciones
            </Typo>
          </View>
          {expenses > 0 && (
            <View style={styles.infoItem}>
              <Icons.ChartLine
                size={verticalScale(14)}
                color={colors.neutral500}
              />
              <Typo size={11} color={colors.neutral500}>
                Promedio: $
                {(expenses / Math.max(count, 1)).toLocaleString("es-MX")}
              </Typo>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

export default TransactionTotalsBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral800,
    marginHorizontal: spacingX._20,
    marginBottom: spacingY._15,
    borderRadius: radius._12,
    overflow: "hidden",
  },
  totalsContainer: {
    flexDirection: "row",
    paddingVertical: spacingY._15,
  },
  totalItem: {
    flex: 1,
    alignItems: "center",
    gap: spacingY._5,
  },
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  separator: {
    width: 1,
    backgroundColor: colors.neutral600,
    marginVertical: spacingY._5,
  },
  additionalInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacingX._20,
    paddingVertical: spacingY._7,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
});
