"use client"
import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import type { LoginScreenNavigationProp } from "../types/navigation"

type LoginScreenProps = {
  navigation: LoginScreenNavigationProp
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const { login, googleLogin, isLoading, error } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.")
      return
    }

    try {
      await login(email, password)
      // If login is successful, navigate to profile
      navigation.navigate("UserProfile")
    } catch (err) {
      // Error is handled in the auth context
      console.error("Login failed:", err)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await googleLogin()
      // Navigation will happen after successful login in the auth context
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Entrar</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>Faça login para acessar sua conta</Text>
          </View>

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: "#FFEBEE" }]}>
              <Text style={[styles.errorText, { color: "#D32F2F" }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>E-mail</Text>
              <View
                style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <Feather name="mail" size={20} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="seu.email@exemplo.com"
                  placeholderTextColor={`${theme.colors.text}80`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Senha</Text>
              <View
                style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <Feather name="lock" size={20} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Sua senha"
                  placeholderTextColor={`${theme.colors.text}80`}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} />
              ) : (
                <Text style={[styles.loginButtonText, { color: theme.colors.text }]}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.text }]}>ou</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, { backgroundColor: "#fff" }]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <View style={styles.googleButtonContent}>
                <Feather name="chrome" size={20} color="#4285F4" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Entrar com Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: theme.colors.text }]}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("CreateUser")}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  form: {
    flex: 1,
  },
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
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
  googleButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
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
})

export default LoginScreen

