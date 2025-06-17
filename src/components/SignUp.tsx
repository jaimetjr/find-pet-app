import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomInput from "./CustomInput";
import { isClerkAPIResponseError, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const signUpFieldsSchema = z.object({
  name: z.string({ message: "Nome é obrigatório" }),
  email: z.string({ message: "Email é obrigatório" }).email("Email inválido"),
  password: z
    .string({ message: "Senha é obrigatória" })
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z
    .string({ message: "Confirmação de senha é obrigatória" })
    .min(8, "Confirmação de senha deve ter pelo menos 8 caracteres"),
});

type SignUpFields = z.infer<typeof signUpFieldsSchema>;

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


export default function SignUp() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isLoaded } = useSignUp();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFields>({
    resolver: zodResolver(signUpFieldsSchema),
  });

  const onNextStep = async (data: SignUpFields) => {
    if (!isLoaded) return;
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "As senhas não coincidem",
      });
      return;
    }
    if (!termsAccepted) {
      setError("root", {
        type: "manual",
        message: "Você deve aceitar os termos de uso e política de privacidade",
      });
      return;
    }

    try {
      setIsLoading(true);
      const name = data?.name.split(" ");
      let firstName = "";
      let lastName = "";
      if (name.length > 1) {
        firstName = name[0];
        lastName = name[1];
      } else {
        firstName = name[0];
        lastName = "";
      }

      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp?.prepareVerification({ strategy: "email_code" });

      await signUp.update({
        firstName: firstName,
        lastName: lastName,
      });

      router.push("/(auth)/verify");
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
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <CustomInput
          control={control}
          name="name"
          label="Nome Completo *"
          icon="user"
          placeholder="Seu nome completo"
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomInput
          control={control}
          name="email"
          label="E-mail *"
          icon="mail"
          placeholder="seu.email@exemplo.com"
          autoComplete="email"
        />
      </View>
      <View style={styles.inputContainer}>
        <CustomInput
          control={control}
          name="password"
          label="Senha *"
          icon="lock"
          placeholder="Sua senha"
          secureTextEntry={true}
        />
      </View>

      <View style={styles.inputContainer}>
        <CustomInput
          control={control}
          name="confirmPassword"
          label="Confirmar Senha *"
          icon="lock"
          placeholder="Confirme sua senha"
          secureTextEntry={true}
        />
      </View>

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setTermsAccepted(!termsAccepted)}
        disabled={isLoading}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: termsAccepted
                ? theme.colors.primary
                : "transparent",
              borderColor: theme.colors.border,
            },
          ]}
        >
          {termsAccepted && <Feather name="check" size={16} color="#FFFFFF" />}
        </View>
        <Text style={[styles.termsText, { color: theme.colors.text }]}>
          Eu li e aceito os Termos de Uso e Política de Privacidade
        </Text>
      </TouchableOpacity>

      {errors.root && (
        <Text style={{ color: "crimson", paddingBottom: 10 }}>
          {errors.root.message}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit(onNextStep)}
        disabled={isLoading}
      >
        <Text style={[styles.nextButtonText, { color: theme.colors.text }]}>
          Criar conta
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  registerButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flex: 2,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
