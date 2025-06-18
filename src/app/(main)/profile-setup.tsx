import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomInput from "@/components/CustomInput";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import RNPickerSelect from "react-native-picker-select";
import { brazilStates } from "@/helpers/states";
import CustomDropdown from "@/components/CustomDropdown";

const profileSetupSchema = z.object({
  phone: z
    .string({ message: "Telefone é obrigatório" })
    .min(11, "Telefone deve ter pelo menos 11 dígitos"),
  bio: z
    .string({ message: "Bio é obrigatória" })
    .min(10, "Bio deve ter pelo menos 10 caracteres"),
  location: z.string({ message: "Localização é obrigatória" }),
  cep: z.string({ message: "CEP é obrigatório" }),
  address: z.string({ message: "Endereço é obrigatório" }),
  neighborhood: z.string({ message: "Bairro é obrigatório" }),
  city: z.string({ message: "Cidade é obrigatória" }),
  state: z.string({ message: "Estado é obrigatório" }),
});

type ProfileSetupFields = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { userDb, updateUser } = useUserAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProfileSetupFields>({
    resolver: zodResolver(profileSetupSchema),
  });

  /*useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = `${loc.coords.latitude.toFixed(
          5
        )}, ${loc.coords.longitude.toFixed(5)}`;
        console.log("User location:", coords);
        setLocation(coords);
        setValue("location", coords);
      } catch (error) {
        console.error("Error getting location:", error);
        setLocation(null);
      }
    })();
  }, []);*/

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleCepChange = async (cep: string) => {
    console.log(cep);
    if (cep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      console.log(data);
      if (!data.erro) {
        setValue("address", data.logradouro || "");
        setValue("neighborhood", data.bairro || "");
        setValue("city", data.localidade || "");
        setValue("state", data.uf || "");
      }
    } catch (error) {
      console.warn("Erro ao buscar dados do CEP", error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Complete seu perfil
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Para finalizarmos seu cadastro, precisamos que você nos informe
              alguns dados.
            </Text>
          </View>
          <View style={styles.signInContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={{ color: theme.colors.text }}>
                  Escolher Avatar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
              <Text style={styles.cameraButtonText}>Tirar Foto</Text>
            </TouchableOpacity>
            <CustomInput
              control={control}
              name="phone"
              label="Telefone"
              keyboardType="phone-pad"
            />
            <CustomInput
              control={control}
              name="bio"
              label="Bio"
              multiline
              numberOfLines={4}
            />

            <CustomInput
              control={control}
              name="cep"
              label="CEP"
              keyboardType="numeric"
              onChangeText={handleCepChange}
            />
            <CustomInput control={control} name="address" label="Endereço" />
            <CustomInput control={control} name="neighborhood" label="Bairro" />

            <CustomDropdown
              name="state"
              control={control}
              label="Estado"
              options={brazilStates.map((s) => ({
                label: s.name,
                value: s.uf,
              }))}
            />

            <CustomInput control={control} name="city" label="Cidade" />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {}}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text
                style={[styles.loginButtonText, { color: theme.colors.text }]}
              >
                Criar perfil
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  avatarPicker: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cameraButton: {
    alignSelf: "center",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#888",
    borderRadius: 6,
  },
  cameraButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "white",
    minHeight: 44,
    justifyContent: "center",
    pointerEvents: "box-none",
  },
  label: {
    marginBottom: 4,
    marginTop: 8,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#0066cc",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "white", fontWeight: "bold" },
  signInContainer: {
    width: "100%",
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  subtitle: {
    fontSize: 16,
  },
});
