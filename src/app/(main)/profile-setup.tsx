import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import CustomInput from "@/components/CustomInput";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDatePicker from "@/components/CustomDatePicker";
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
import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ProviderEnum } from "@/enums/provider-enum";
import { formatDateForBackend } from "@/utils/dateUtils";
import { ContactType } from "@/enums/contactType";

const profileSetupSchema = z.object({
  birthDate: z
    .string({ message: "Data de nascimento é obrigatória" })
    .min(1, "Data de nascimento é obrigatória")
    .refine((date) => {
      if (!date) return false;
      // Accept both ISO format (YYYY-MM-DD) and Brazilian format (DD/MM/YYYY)
      return date.includes('-') || date.includes('/');
    }, "Data deve estar no formato DD/MM/AAAA"),
  cpf: z
    .string({ message: "CPF é obrigatório" })
    .min(11, "CPF deve ter 11 dígitos")
    .max(14, "CPF deve ter no máximo 14 caracteres"),
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
  number: z.string({ message: "Número é obrigatório" }),
  complement: z.string().optional(),
  contactType: z.string({ message: "Tipo de contato é obrigatório" }),
});

type ProfileSetupFields = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const { userDb, updateUser, registerUser } = useUserAuth();
  const { isLoaded, userId } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProfileSetupFields>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      location: "0,0", // Default location to satisfy validation
      contactType: ContactType.App.toString(), // Default to App contact type
    },
  });

  const onSubmit = async (data: ProfileSetupFields) => {
    if (!isLoaded) return;
    if (!userId) return;
    if (!user) return;
    setIsLoading(true);

    const notifications = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Notificações",
        "Gostaria de receber notificações?",
        [
          {
            text: "Não",
            onPress: () => resolve(false),
            style: "cancel",
          },
          {
            text: "Sim",
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });

    try {
      const registerDto = new RegisterUserDTO(
        userId,
        user.firstName || "" + " " + user.lastName || "",
        user.emailAddresses[0].emailAddress || "",
        formatDateForBackend(data.birthDate),
        data.cpf,
        data.phone,
        data.bio,
        data.cep,
        data.address,
        data.neighborhood,
        data.city,
        data.state,
        data.number,
        ProviderEnum.Email,
        parseInt(data.contactType) as ContactType,
        data.complement,
        notifications
      );
      const result = await registerUser(registerDto, avatar || undefined);
      if (result.success) {
        Alert.alert("Sucesso", "Perfil criado com sucesso, você sera direcionado ao aplicatio!");
        router.push("/(main)/home");
      } else {
        setError("root", { message: result.errors.join("\n") });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("root", { message: error as string || "Erro ao criar perfil" });
    } finally {
      setIsLoading(false);
    }
  };

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
    if (cep.length !== 8) return;
    try {
      setIsLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setValue("address", data.logradouro || "");
        setValue("neighborhood", data.bairro || "");
        setValue("city", data.localidade || "");
        setValue("state", data.uf || "");
      }
    } catch (error) {
      console.warn("Erro ao buscar dados do CEP", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['left','right','bottom']}
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
            
            <CustomDatePicker
              control={control}
              name="birthDate"
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
            />

            <CustomInput
              control={control}
              name="cpf"
              label="CPF"
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />

            <CustomInput
              control={control}
              name="phone"
              label="Celular"
              keyboardType="phone-pad"
            />

            <CustomInput
              control={control}
              name="cep"
              label="CEP"
              keyboardType="numeric"
              onChangeText={handleCepChange}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  control={control}
                  name="address"
                  label="Endereço"
                  editable={!isLoading}
                />
              </View>
              <View style={{ flex: 0.5 }}>
                <CustomInput
                  control={control}
                  name="number"
                  label="Número"
                  editable={!isLoading}
                />
              </View>
            </View>
            <CustomInput
              control={control}
              name="neighborhood"
              label="Bairro"
              editable={!isLoading}
            />

            <CustomDropdown
              disabled={isLoading}
              name="state"
              control={control}
              label="Estado"
              options={brazilStates.map((s) => ({
                label: s.name,
                value: s.uf,
              }))}
            />

            <CustomInput
              control={control}
              name="city"
              label="Cidade"
              editable={!isLoading}
            />

            <CustomInput
              control={control}
              name="complement"
              label="Complemento"
              editable={!isLoading}
            />

            <CustomInput
              control={control}
              name="bio"
              label="Bio"
              multiline
              style={{ height: 100, textAlignVertical: "top" }}
              numberOfLines={4}
            />

            <CustomDropdown
              name="contactType"
              control={control}
              label="Tipo de Contato"
              options={[
                { label: "Apenas pelo App", value: ContactType.App.toString() },
                { label: "Apenas por Telefone", value: ContactType.Phone.toString() },
                { label: "App e Telefone", value: ContactType.Both.toString() },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleSubmit(onSubmit)}
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
  loadingCard: {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -40 }],
    width: 150,
    padding: 16,

    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  loadingText: {
    marginTop: 8,
    color: "#333",
    fontSize: 14,
  },
});
