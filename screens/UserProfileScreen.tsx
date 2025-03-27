"use client"
import type React from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { UserProfileScreenNavigationProp } from "../types/navigation"

type UserProfileScreenProps = {
  navigation: UserProfileScreenNavigationProp
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const theme = useTheme()

  // Placeholder user data
  const user = {
    name: "Usuário",
    email: "usuario@example.com",
    phone: "(11) 98765-4321",
    isLoggedIn: false,
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user.isLoggedIn ? (
          <>
            <View style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.colors.secondary }]}>
                <Feather name="user" size={50} color={theme.colors.text} />
              </View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.text }]}>{user.email}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações Pessoais</Text>
              <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.infoRow}>
                  <Feather name="mail" size={20} color={theme.colors.text} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>{user.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="phone" size={20} color={theme.colors.text} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>{user.phone}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ações</Text>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => navigation.navigate("CreatePet")}
              >
                <Feather name="plus-circle" size={20} color={theme.colors.text} />
                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Cadastrar Novo Pet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <Feather name="edit" size={20} color={theme.colors.text} />
                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Editar Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              >
                <Feather name="log-out" size={20} color={theme.colors.text} />
                <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Sair</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.loginContainer}>
            <View style={[styles.loginCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Feather name="user" size={50} color={theme.colors.text} style={styles.loginIcon} />
              <Text style={[styles.loginTitle, { color: theme.colors.text }]}>Faça login para continuar</Text>
              <Text style={[styles.loginSubtitle, { color: theme.colors.text }]}>
                Acesse sua conta para gerenciar seus pets e favoritos
              </Text>
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  // Handle login
                }}
              >
                <Text style={[styles.loginButtonText, { color: theme.colors.text }]}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.registerButton, { borderColor: theme.colors.primary }]}
                onPress={() => navigation.navigate("CreateUser")}
              >
                <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>Criar Conta</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  profileHeader: {
    padding: 20,
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 12,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loginCard: {
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  loginIcon: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default UserProfileScreen

