import { Stack } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { AlertContainer } from "rn-custom-alert-prompt";

const _layout = () => {
  // Detectar el sistema operativo para el theme
  const alertTheme = Platform.OS === "ios" ? "ios" : "android";

  return (
    <View style={styles.container}>
      <AlertContainer
        theme={alertTheme}
        appearance="light"
        animationType="fade"
      />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
};

export default _layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
