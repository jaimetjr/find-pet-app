import {
  View,
  Text,
  Button,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import SignInScreen from "../../components/SignIn";
import CustomInput from "@/components/CustomInput";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import SignInWith from "@/components/SignInWith";
import SignIn from "../../components/SignIn";

const signInSchema = z.object({
  email: z.string({ message: "Email é obrigatório" }).email("Email inválido"),
  password: z
    .string({ message: "Senha é obrigatória" })
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type SignInFields = z.infer<typeof signInSchema>;

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/SimbaNala.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bem-vindo ao Achando Lar
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Conectando pets especiais a lares amorosos
          </Text>
        </View>
        <View style={styles.signInContainer}>
          <SignIn />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 20,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  signInContainer: {
    width: "100%",
    marginBottom: 30,
  },
});
