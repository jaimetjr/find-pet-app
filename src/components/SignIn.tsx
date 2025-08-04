import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isClerkAPIResponseError, useSignIn } from "@clerk/clerk-expo";
import SignInWith from "@/components/SignInWith";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const signInSchema = z.object({
  email: z.string({ message: "Email é obrigatório" }).email("Email inválido"),
  password: z
    .string({ message: "Senha é obrigatória" })
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type SignInFields = z.infer<typeof signInSchema>;

const mapClerkErrorToFormField = (error: any) => {
  switch (error.meta?.paramName) {
    case "identifier":
      return "email";
    case "password":
      return "password";
    default:
      return "root";
  }
};

export default function SignIn() {
  const theme = useTheme();
  const behavior = Platform.OS === "ios" ? "padding" : "height";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
  });

  const { signIn, isLoaded, setActive } = useSignIn();

  const onSignIn = async (data: SignInFields) => {
    if (!isLoaded || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const signInAttempt = await signIn?.create({
        identifier: data.email,
        password: data.password,
      });

      if (signInAttempt?.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
      } else {
        setError("root", { message: "Erro ao fazer login" });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach((error) => {
          const field = mapClerkErrorToFormField(error);
          setError(field, { message: error.longMessage || error.message });
        });
      } else {
        setError("root", { message: "Erro ao fazer login" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={120}
      extraHeight={120}
      contentContainerStyle={{flexGrow: 1}}
      style={styles.container}
      >
      <View>
        <View style={styles.form}>
          <CustomInput
            control={control}
            name="email"
            placeholder="seu.email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            label="Email"
            icon="mail"
          />

          <CustomInput
            control={control}
            name="password"
            placeholder="Senha"
            autoCapitalize="none"
            secureTextEntry={true}
            label="Senha"
            icon="lock"
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() =>
            Alert.alert(
              "Recuperação de senha",
              "Funcionalidade em desenvolvimento."
            )
          }
        >
          <Text
            style={[styles.forgotPasswordText, { color: theme.colors.primary }]}
          >
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>

        {errors.root && (
          <Text style={{ color: "crimson" }}>{errors.root.message}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSubmit(onSignIn)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text
              style={[styles.loginButtonText, { color: theme.colors.text }]}
            >
              Entrar
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <Text style={[styles.dividerText, { color: theme.colors.text }]}>
            ou
          </Text>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
        </View>

        <View
          style={{ flexDirection: "row", gap: 10, marginHorizontal: "auto" }}
        >
          <SignInWith strategy="oauth_google" />
          <SignInWith strategy="oauth_apple" />
          <SignInWith strategy="oauth_facebook" />
        </View>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: theme.colors.text }]}>
            Não tem uma conta?
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
            <Text
              style={[styles.registerLink, { color: theme.colors.primary }]}
            >
              Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    marginRight: 4,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
  signInContainer: {
    width: "100%",
    marginBottom: 30,
  },
});
