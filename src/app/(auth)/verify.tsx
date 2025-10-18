import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "@/components/CustomInput";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

const verifySchema = z.object({
  code: z.string({ message: "Code is required" }).length(6, "Invalid code"),
});

type VerifyFields = z.infer<typeof verifySchema>;

const mapClerkErrorToFormField = (error: any) => {
  switch (error.meta?.paramName) {
    case "code":
      return "code";
    default:
      return "root";
  }
};

export default function VerifyScreen() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<VerifyFields>({
    resolver: zodResolver(verifySchema),
  });

  const { signUp, isLoaded, setActive } = useSignUp();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const onVerify = async ({ code }: VerifyFields) => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        setActive({ session: signUpAttempt.createdSessionId });
      } else {
        setError("root", { message: "Could not complete the sign up" });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        err.errors.forEach((error) => {
          const fieldName = mapClerkErrorToFormField(error);
          setError(fieldName, {
            message: error.longMessage,
          });
        });
      } else {
        setError("root", { message: "Unknown error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Verifique seu email
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Enviamos um código de verificação para seu email.
          </Text>
        </View>
        <View style={styles.signInContainer}>
          <CustomInput
            control={control}
            name="code"
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            autoCapitalize="none"
            label="Código de verificação"
            icon="mail"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.loginButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSubmit(onVerify)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text
              style={[styles.loginButtonText, { color: theme.colors.text }]}
            >
              Entrar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    /*<SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>Verifique seu email</Text>

        <CustomInput
          label="Código de verificação"
          control={control}
          name="code"
          placeholder="123456"
          autoFocus
          autoCapitalize="none"
          keyboardType="number-pad"
          autoComplete="one-time-code"
        />

        <TouchableOpacity
          style={[
            styles.registerButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleSubmit(onVerify)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text
              style={[styles.registerButtonText, { color: theme.colors.text }]}
            >
              Criar Conta
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>*/
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 80,
  },
  signInContainer: {
    width: "100%",
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});
