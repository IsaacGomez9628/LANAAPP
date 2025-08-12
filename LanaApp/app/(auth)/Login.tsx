import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View, Alert } from "react-native";
import { verticalScale } from "react-native-size-matters";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cambia esta IP por la IP donde corre tu API
const API_BASE_URL = "http://192.168.163.214:5000";

const Login: React.FC = () => {
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const isEmailValid = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!passwordRef.current || !emailRef.current) {
      Alert.alert(
        "Faltan datos",
        "Por favor, ingresa tu correo o contraseña",
        [{ text: "Entendido" }]
      );
      return;
    }

    if (!isEmailValid(emailRef.current)) {
      Alert.alert(
        "Correo inválido",
        "Por favor, ingresa un correo válido.",
        [{ text: "Ok" }]
      );
      return;
    }

    setLoading(true);
    try {
      console.log("Intentando login con:", emailRef.current);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: emailRef.current.toLowerCase().trim(),
          password: passwordRef.current,
        }),
      });

      console.log("Status de respuesta:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Credenciales incorrectas");
      }

      const data = await response.json();
      console.log("Respuesta exitosa:", data);

      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("user_data", JSON.stringify(data.user));

      Alert.alert(
        "Inicio de sesión exitoso",
        `¡Bienvenido de vuelta, ${data.user.nombre_usuario}!`,
        [{ text: "Continuar", onPress: () => router.push("/(tabs)") }]
      );

    } catch (error: any) {
      console.error("Error en login:", error);
      Alert.alert(
        "Error de login",
        error.message || "Credenciales incorrectas. Intenta de nuevo.",
        [{ text: "Reintentar" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    Alert.alert(
      "Recuperar contraseña",
      "¿Deseas recuperar tu contraseña?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, recuperar" }
      ]
    );
  };

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        <BackButton iconSize={20} />

        <View style={styles.welcomeSection}>
          <Typo size={30} fontWeight={"800"} style={{ color: colors.primary }}>
            Hey,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Regresaste de vuelta
          </Typo>
        </View>

        {/* Formulario de login */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Inicia sesión para seguir con tus finanzas
          </Typo>

          <Input
            placeholder="Enter your Email"
            onChangeText={(value: string) => (emailRef.current = value)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={
              <Icons.At size={verticalScale(26)} color={colors.neutral300} weight="fill" />
            }
          />

          <Input
            placeholder="Enter your Password"
            secureTextEntry
            onChangeText={(value: string) => (passwordRef.current = value)}
            icon={
              <Icons.Lock size={verticalScale(26)} color={colors.neutral300} weight="fill" />
            }
          />

          <Pressable onPress={handleForgotPassword}>
            <Typo size={14} color={colors.text} style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Typo>
          </Pressable>

          <Button loading={isLoading} onPress={handleSubmit} style={{ backgroundColor: colors.primary }}>
            <Typo fontWeight={"700"} color={colors.black} size={19}>
              Login
            </Typo>
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typo size={15}>¿No tienes cuenta?</Typo>
          <Pressable onPress={() => router.push("/(auth)/Register")}>
            <Typo size={15} fontWeight={"700"} color={colors.primaryDark}>
              Regístrate
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeSection: {
    gap: 5,
    marginTop: spacingY._20,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPasswordText: {
    alignSelf: "flex-end",
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
