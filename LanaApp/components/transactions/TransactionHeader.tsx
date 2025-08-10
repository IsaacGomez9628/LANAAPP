import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "react-native-size-matters";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";

interface TransactionHeaderProps {
  onSearch?: () => void;
  onFavorite?: () => void;
  onMenu?: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  onSearch,
  onFavorite,
  onMenu,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onSearch}>
        <Icons.MagnifyingGlass size={verticalScale(24)} color={colors.white} />
      </TouchableOpacity>

      <Typo size={20} fontWeight="600">
        Trans.
      </Typo>

      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onFavorite}>
          <Icons.Star size={verticalScale(24)} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenu}>
          <Icons.DotsThreeVertical
            size={verticalScale(24)}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransactionHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacingX._15,
  },
});
