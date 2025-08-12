import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Importa tus screens
// import HomeScreen from "./index";
// import ProfileScreen from "./profile";
// import StadisticsScreen from "./stadistics";
// import WalletScreen from "./wallet";
// import Tabs from "@/components/Tabs";
import { Tabs } from "expo-router";
import { colors } from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { useState } from "react";
import CustomTabs from "@/components/CustomTabs";

export default function TabsNavigator() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <Tabs tabBar={CustomTabs} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
