import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import BottomTabNavigator from "./navigation/BottomTabNavigator"
import PetDetailScreen from "./screens/PetDetailScreen"
import { ThemeProvider } from "./context/ThemeContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { petData } from "./data/pets"
import type { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FavoritesProvider allPets={petData}>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Main"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Main" component={BottomTabNavigator} />
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
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

