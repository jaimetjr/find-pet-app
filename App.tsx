import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import HomeScreen from "./screens/HomeScreen"
import PetDetailScreen from "./screens/PetDetailScreen"
import { ThemeProvider } from "./context/ThemeContext"
import type { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#F9B872", // Golden color
              },
              headerTintColor: "#7D4E24", // Dark brown
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Achando um Lar" }} />
            <Stack.Screen
              name="PetDetail"
              component={PetDetailScreen}
              options={({ route }) => ({ title: route.params?.name || "Pet Details" })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

