import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import { Alert } from "rn-custom-alert-prompt";
import Header from "@/components/Header";
import Typo from "@/components/Typo";
import { Image } from "expo-image";

const Profile = () => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const Home = () => {
    setLoading(true);
    Alert.alert({
      title: "Cerrando Sesion",
      description: "Por favor, Espere",
      showCancelButton: false,
      icon: "success",
      iconColor: colors.primary,
    });
  };
  const router = useRouter();

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        <Header title="Profile" style={{ marginVertical: spacingY._10 }} />

        <View style={styles.userInfo}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {/* User image */}
            <Image
              source="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
          </View>
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight={"600"} color={colors.neutral100}>
              Nombre de usuario
            </Typo>
            <Typo size={24} fontWeight={"600"} color={colors.neutral400}>
              usuario@gmail.com
            </Typo>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
  },
  editIcons: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundImage: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
});
