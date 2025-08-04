import {
  View,
  Text,
  Button,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import SignInScreen from "../../components/SignIn";
import CustomInput from "@/components/CustomInput";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import SignInWith from "@/components/SignInWith";
import SignIn from "../../components/SignIn";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const signInSchema = z.object({
  email: z.string({ message: "Email é obrigatório" }).email("Email inválido"),
  password: z
    .string({ message: "Senha é obrigatória" })
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type SignInFields = z.infer<typeof signInSchema>;

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
  });

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={10}
      extraHeight={10}
      contentContainerStyle={{flexGrow: 1}}
      style={styles.container}
      >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, { marginTop: 32 }]}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/SimbaNala.png")}
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
              <View style={styles.signInContainer}>
                <SignIn />
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
    marginBottom: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  signInContainer: {
    width: "100%",
    marginBottom: 16,
  },
});
