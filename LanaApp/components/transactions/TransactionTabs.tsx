import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { TabType } from "@/constants/transactions";

interface TransactionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TransactionTabs: React.FC<TransactionTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: { key: TabType; label: string }[] = [
    { key: "calendar", label: "Calendar" },
    { key: "monthly", label: "Monthly" },
    { key: "summary", label: "Summary" },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
        >
          <Typo
            size={14}
            color={activeTab === tab.key ? colors.white : colors.neutral500}
            fontWeight={activeTab === tab.key ? "600" : "400"}
          >
            {tab.label}
          </Typo>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TransactionTabs;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacingX._20,
    marginBottom: spacingY._10,
  },
  tab: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.rose,
  },
});
