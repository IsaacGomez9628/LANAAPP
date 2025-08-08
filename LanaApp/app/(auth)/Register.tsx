import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import { Alert } from "rn-custom-alert-prompt";

const Register: React.FC = () => {
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const nameRef = useRef<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");

  const router = useRouter();

  const checkPasswordStrength = (password: string): string => {
    if (password.length === 0) return "";
    if (password.length < 6) return "weak";
    if (password.length >= 6 && password.length < 10) return "medium";
    if (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    )
      return "strong";
    return "medium";
  };

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isEmailValid = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (): Promise<void> => {
    // Validación de contraseña

    if (!passwordRef.current || !emailRef.current || !nameRef.current) {
      Alert.alert({
        title: "Crear cuenta",
        description: "Por favor, Llena todos los espacios faltantes",
        showCancelButton: true,
        icon: "error",
        iconColor: colors.neutral300,
        cancelText: "Cancelar",
        confirmText: "Entendido",
      });
      return;
    } else if (!passwordRef.current) {
      Alert.alert({
        title: "Faltan datos",
        description: "Por favor, verifica tu contraseña",
        showCancelButton: true,
        icon: "error",
        iconColor: colors.neutral300,
        cancelText: "Cancelar",
        confirmText: "Entendido",
      });
      return;
    } else if (!isEmailValid(emailRef.current)) {
      Alert.alert({
        title: "Correo inválido",
        description: "Por favor, ingresa un correo válido.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    } else if (nameRef.current) {
      Alert.alert({
        title: "Nombre Invalido",
        description: "Por favor, ingresa un nombre de usuario correcto.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    }

    setLoading(true);
    try {
      // Simular proceso de autenticación
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Login exitoso
      Alert.alert({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta!",
        icon: "success",
        confirmText: "Continuar",
      });

      // Navegar al dashboard o pantalla principal
      // router.push("/dashboard");
    } catch (error) {
      Alert.alert({
        title: "Error de login",
        description: "Credenciales incorrectas. Intenta de nuevo.",
        icon: "error",
        confirmText: "Reintentar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    Alert.alert({
      title: "Recuperar contraseña",
      description: "¿Deseas recuperar tu contraseña?",
      showCancelButton: true,
      icon: "question",
      cancelText: "Cancelar",
      confirmText: "Sí, recuperar",
    });
  };

  return (
    <ScreenWrapper size={0.07}>
      <View style={styles.container}>
        <BackButton iconSize={20} />

        <View style={styles.welcomeSection}>
          <Typo size={30} fontWeight={"800"} style={{ color: colors.primary }}>
            Vamos,
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            a empezar
          </Typo>
        </View>

        {/* Formulario de login */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Crea una nueva cuenta en LanaApp y asi organizas todos tus ahorros
          </Typo>

          <Input
            placeholder="Enter your Name"
            onChangeText={(value: string) => (emailRef.current = value)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={
              <Icons.User
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          <Input
            placeholder="Enter your Email"
            onChangeText={(value: string) => (emailRef.current = value)}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={
              <Icons.At
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          <Input
            placeholder="Enter your Password"
            secureTextEntry
            onChangeText={(value: string) => (passwordRef.current = value)}
            icon={
              <Icons.Lock
                size={verticalScale(26)}
                color={colors.neutral300}
                weight="fill"
              />
            }
          />

          <Pressable onPress={handleForgotPassword}>
            <Typo
              size={14}
              color={colors.text}
              style={styles.forgotPasswordText}
            >
              ¿Olvidaste tu contraseña?
            </Typo>
          </Pressable>

          <Button
            loading={isLoading}
            onPress={handleSubmit}
            style={{ backgroundColor: colors.primary }}
          >
            <Typo fontWeight={"700"} color={colors.black} size={19}>
              Registrarse
            </Typo>
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typo size={15}>¿Ya tienes cuenta?</Typo>
          <Pressable onPress={() => router.push("/(auth)/Login")}>
            <Typo size={15} fontWeight={"700"} color={colors.primaryDark}>
              Inicia Sesión
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._20,
    paddingHorizontal: spacingX._20,
  },
  welcomeSection: {
    gap: 5,
    marginTop: spacingY._5,
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
    gap: 8,
  },
});
