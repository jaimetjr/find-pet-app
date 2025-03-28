import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import DrawerNavigator from "./navigation/DrawerNavigator";
import PetDetailScreen from "./screens/PetDetailScreen";
import { ThemeProvider } from "./context/ThemeContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { petData } from "./data/pets";
import type { RootStackParamList } from "./types/navigation";
import { AuthProvider } from "./context/AuthContext";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider allPets={petData}>
              <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator
                  initialRouteName="Drawer"
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="Drawer" component={DrawerNavigator} />
                  <Stack.Screen
                    name="PetDetail"
                    component={PetDetailScreen}
                    options={{
                      headerShown: true,
                      headerStyle: {
                        backgroundColor: "#F9B872", // Golden color
                      },
                      headerTintColor: "#7D4E24", // Dark brown
                      headerTitleStyle: {
                        fontWeight: "bold",
                      },
                      title: "Detalhes do Pet",
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
