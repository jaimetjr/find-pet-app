import { Redirect} from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import Drawer from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const theme = useTheme();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <ErrorBoundary>
      <Drawer
        screenOptions={{
          headerShown: true,
          headerLeft: ({ tintColor }) => (
            <DrawerToggleButton tintColor={tintColor} />
          ),
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          drawerActiveTintColor: theme.colors.primary,
          drawerInactiveTintColor: theme.colors.text,
          drawerStyle: {
            backgroundColor: theme.colors.background,
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            title: "Home",
            drawerLabel: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile-setup"
          options={{
            title: "Configuração do Perfil",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
            headerLeft: () => null, // Remove hamburger button
            swipeEnabled: false, // Disable opening drawer via gesture
          }}
        />
        <Drawer.Screen
          name="my-pets"
          options={{
            title: "",
            drawerLabel: "Meus Pets",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="paw" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="add-pet"
          options={{
            title: "Adicionar Pet",
            drawerLabel: "Adicionar Pet",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="add-pet-images"
          options={{
            title: "Adicionar Fotos",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
          }}
        />
        <Drawer.Screen
          name="edit-profile"
          options={{
            title: "Editar Perfil",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
          }}
        />
        <Drawer.Screen
          name="favorites"
          options={{
            title: "Favorites",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Configurações",
            drawerLabel: "Configurações",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="messages"
          options={{
            title: "Mensagens",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="signout"
          options={{
            title: "Sair",
            drawerLabel: "Sign Out",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="log-out" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="pet-detail"
          options={{
            title: "Detalhes do Pet",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
          }}
        />
        <Drawer.Screen
          name="chat"
          options={{
            title: "",
            drawerItemStyle: { display: "none" }, // Hide from drawer menu
          }}
        />
      </Drawer>
    </ErrorBoundary>
  );
}
