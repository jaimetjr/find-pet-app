"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import BottomTabNavigator from "./BottomTabNavigator"
import UserProfileScreen from "../screens/UserProfileScreen"
import CreateUserScreen from "../screens/CreateUserScreen"
import CreatePetScreen from "../screens/CreatePetScreen"
import LoginScreen from "../screens/LoginScreen"
import type { DrawerParamList } from "../types/navigation"

const Drawer = createDrawerNavigator<DrawerParamList>()

// Custom drawer content component
const CustomDrawerContent = (props: any) => {
  const theme = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    props.navigation.closeDrawer()
    props.navigation.navigate("Main")
  }

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.userInfoContainer}>
          <View style={[styles.userAvatar, { backgroundColor: theme.colors.secondary }]}>
            <Feather name="user" size={30} color={theme.colors.text} />
          </View>
          <View style={styles.userTextContainer}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {isAuthenticated ? user?.name : "Convidado"}
            </Text>
            <Text style={[styles.userSubtitle, { color: theme.colors.text }]}>
              {isAuthenticated ? user?.email : "Faça login ou cadastre-se"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>

      {isAuthenticated && (
        <View style={styles.drawerFooter}>
          <TouchableOpacity
            style={[styles.logoutButton, { borderTopColor: theme.colors.border }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={theme.colors.text} />
            <Text style={[styles.logoutText, { color: theme.colors.text }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  )
}

const DrawerNavigator = () => {
  const theme = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        drawerActiveBackgroundColor: theme.colors.primary,
        drawerActiveTintColor: theme.colors.text,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: {
          marginLeft: 16,
          fontSize: 16,
        },
        drawerItemStyle: {
          paddingVertical: 5,
        },
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{
          title: "Início",
          drawerIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          title: "Meu Perfil",
          drawerIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />

      <Drawer.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Entrar",
          drawerIcon: ({ color, size }) => <Feather name="log-in" color={color} size={size} />,
          drawerItemStyle: isAuthenticated ? { display: "none" } : undefined,
        }}
      />
      <Drawer.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{
          title: "Criar Conta",
          drawerIcon: ({ color, size }) => <Feather name="user-plus" color={color} size={size} />,
          drawerItemStyle: isAuthenticated ? { display: "none" } : undefined,
        }}
      />
      {isAuthenticated && (
        <Drawer.Screen
          name="CreatePet"
          component={CreatePetScreen}
          options={{
            title: "Cadastrar Pet",
            drawerIcon: ({ color, size }) => <Feather name="plus-circle" color={color} size={size} />,
          }}
        />
      )}
    </Drawer.Navigator>
  )
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  userTextContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 10,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 10,
  },
})

export default DrawerNavigator

