import {
  View,
  Text,
  Button,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/contexts/ThemeContext";

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=1000&auto=format&fit=crop",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bem-vindo ao Achando Lar
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Conectando pets especiais a lares amorosos
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              Criar Conta
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text }]}>
            Ao continuar, você concorda com nossos Termos de Serviço e Política
            de Privacidade
          </Text>
        </View>
      </View>
    </SafeAreaView>
    /*<View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to the App!</Text>
      <Button title="Login" onPress={() => router.push('/(auth)/sign-in')} />
      <View style={{ height: 10 }} />
      <Button title="Sign Up" onPress={() => router.push('/(auth)/sign-up')} />
    </View>*/
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginBottom: 30,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 30,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  guestButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  guestButtonText: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
});
