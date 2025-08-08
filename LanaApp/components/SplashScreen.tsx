import LottieView from "lottie-react-native";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import LoaderAnimation from "../assets/lotties/Loader Animation using box.json";

const SplashScreen = () => {
  return (
    <SafeAreaView>
      <LottieView
        source={LoaderAnimation}
        autoPlay
        resizeMode="cover"
        loop={false}
        style={{
          flex: 1,
          width: "100%",
        }}
      />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
