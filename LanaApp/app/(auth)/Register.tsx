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
  const phoneRef = useRef<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  // Configuración de la API - Ajusta esta URL según tu entorno
  const API_BASE_URL = "http://192.168.163.214:5000"; // Tu IP local
  
  // Tipos para la request
  interface UserCreateRequest {
    nombre_usuario: string;
    email: string;
    password: string;
    telefono: string;
  }

  const isEmailValid = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isPhoneValid = (phone: string): boolean => {
    // Validación básica de teléfono (puedes ajustarla según tus necesidades)
    return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
  };

  const createUser = async (userData: UserCreateRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lanaapp/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 422) {
          throw new Error("Error de validación: Verifica que todos los datos sean correctos");
        } else if (response.status === 500) {
          throw new Error("Error interno del servidor. Por favor, intenta más tarde.");
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error de conexión. Verifica tu red e intenta de nuevo.");
    }
  };

  const handleSubmit = async (): Promise<void> => {
    // Validaciones
    if (!nameRef.current || !emailRef.current || !passwordRef.current || !phoneRef.current) {
      Alert.alert({
        title: "Crear cuenta",
        description: "Por favor, llena todos los campos requeridos",
        showCancelButton: true,
        icon: "error",
        iconColor: colors.neutral300,
        cancelText: "Cancelar",
        confirmText: "Entendido",
      });
      return;
    }

    if (!isEmailValid(emailRef.current)) {
      Alert.alert({
        title: "Correo inválido",
        description: "Por favor, ingresa un correo válido.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    }

    if (nameRef.current.length < 3) {
      Alert.alert({
        title: "Nombre inválido",
        description: "El nombre de usuario debe tener al menos 3 caracteres.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    }

    if (passwordRef.current.length < 6) {
      Alert.alert({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    }

    if (!isPhoneValid(phoneRef.current)) {
      Alert.alert({
        title: "Teléfono inválido",
        description: "Por favor, ingresa un número de teléfono válido.",
        icon: "error",
        iconColor: "orange",
        confirmText: "Ok",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nombre_usuario: nameRef.current.trim(),
        email: emailRef.current.trim().toLowerCase(),
        password: passwordRef.current,
        telefono: phoneRef.current.trim(),
      };

      await createUser(userData);

      // Registro exitoso
      Alert.alert({
        title: "¡Cuenta creada exitosamente!",
        description: "Tu cuenta ha sido registrada. Ahora puedes iniciar sesión.",
        icon: "success",
        confirmText: "Continuar",
      });

      // Navegar al login después de un breve delay
      setTimeout(() => {
        router.push("/(auth)/Login");
      }, 1500);

    } catch (error) {
      console.error("Error al crear usuario:", error);
      
      let errorMessage = "Ocurrió un error inesperado. Intenta de nuevo.";
      
      if (error instanceof Error) {
        if (error.message.includes("duplicate") || error.message.includes("already exists")) {
          errorMessage = "Este correo o nombre de usuario ya está registrado.";
        } else if (error.message.includes("validación")) {
          errorMessage = "Por favor, verifica que todos los datos sean correctos.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert({
        title: "Error al crear cuenta",
        description: errorMessage,
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

        {/* Formulario de registro */}
        <View style={styles.form}>
          <Typo size={16} color={colors.textLighter}>
            Crea una nueva cuenta en LanaApp y así organizas todos tus ahorros
          </Typo>

          <Input
            placeholder="Enter your Name"
            onChangeText={(value: string) => (nameRef.current = value)}
            autoCapitalize="words"
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
            placeholder="Enter your Phone"
            onChangeText={(value: string) => (phoneRef.current = value)}
            keyboardType="phone-pad"
            icon={
              <Icons.Phone
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