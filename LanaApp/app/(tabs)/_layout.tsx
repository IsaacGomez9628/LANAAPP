import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Importa tus screens
import HomeScreen from "./index";
import ProfileScreen from "./profile";
import StadisticsScreen from "./stadistics";
import WalletScreen from "./wallet";
// import Tabs from "@/components/Tabs";
import { colors } from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { useState } from "react";

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    // <SafeAreaView>
    //   <Tabs
    //     data={[
    //       { icon: "Sailboat", label: "Sail" },
    //       { icon: "Ship", label: "Ship it" },
    //       { icon: "LifeBuoy", label: "Buoy" },
    //       { icon: "Fish", label: "Fresh fish" },
    //     ]}
    //     onChange={(index) => setSelectedIndex(index)}
    //     selectedIndex={selectedIndex}
    //   />
    // </SafeAreaView>

    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case "Home":
              IconComponent = Icons.House;
              break;
            case "Stadistics":
              IconComponent = Icons.ChartBar;
              break;
            case "Wallet":
              IconComponent = Icons.Wallet;
              break;
            case "Profile":
              IconComponent = Icons.User;
              break;
            default:
              IconComponent = Icons.House;
          }

          return (
            <IconComponent
              size={size}
              color={color}
              weight={focused ? "fill" : "regular"}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral300,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutral200,
          paddingBottom: 5,
          height: 90,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stadistics" component={StadisticsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
