import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { verticalScale } from "react-native-size-matters";

// Lottie
import BusinessMan from "../assets/lotties/Businessman flies up with rocket.json";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/(auth)/Welcome");
    }, 3000); // Duración de la animación de carga (3 segundos)

    return () => clearTimeout(timeout);
  }, [router]);

  // Solo mostrar la pantalla de carga - removido el estado showSplash
  return (
    <View style={styles.splashContainer}>
      <LottieView
        source={BusinessMan}
        autoPlay
        loop={false}
        resizeMode="contain"
        style={styles.lottie}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.neutral900,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: "100%",
    height: verticalScale(200),
    alignSelf: "center",
    marginTop: verticalScale(30),
  },
});
