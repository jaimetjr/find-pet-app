"use client"
import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { CreateUserScreenNavigationProp } from "../types/navigation"

type CreateUserScreenProps = {
  navigation: CreateUserScreenNavigationProp
}

const CreateUserScreen: React.FC<CreateUserScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleCreateUser = () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.")
      return
    }

    // Here you would call your API to create the user
    Alert.alert("Sucesso", "Conta criada com sucesso!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("UserProfile"),
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Criar Conta</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Preencha os campos abaixo para se cadastrar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Nome Completo *</Text>
            <View
              style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Feather name="user" size={20} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Seu nome completo"
                placeholderTextColor={`${theme.colors.text}80`}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>E-mail *</Text>
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
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Senha *</Text>
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Confirmar Senha *</Text>
            <View
              style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Feather name="lock" size={20} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirme sua senha"
                placeholderTextColor={`${theme.colors.text}80`}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Telefone</Text>
            <View
              style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <Feather name="phone" size={20} color={theme.colors.text} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="(00) 00000-0000"
                placeholderTextColor={`${theme.colors.text}80`}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreateUser}
          >
            <Text style={[styles.createButtonText, { color: theme.colors.text }]}>Criar Conta</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.colors.text }]}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("UserProfile")}>
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Faça login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
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
  createButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  createButtonText: {
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
})

export default CreateUserScreen

