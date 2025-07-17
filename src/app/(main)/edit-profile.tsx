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
  Alert,
} from "react-native";
import CustomInput from "@/components/CustomInput";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import * as ImagePicker from "expo-image-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "@/components/CustomDropdown";
import CustomDatePicker from "@/components/CustomDatePicker";
import { brazilStates } from "@/helpers/states";
import { useAuth, useUser as useClerkUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { UpdateUserDTO } from "@/dtos/user/updateUserDto";
import { formatDateForDisplay, formatDateForBackend } from "@/utils/dateUtils";
import CustomCheckbox from "@/components/CustomCheckbox";
import { ContactType } from "@/enums/contactType";

const editProfileSchema = z.object({
  name: z
    .string({ message: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string({ message: "E-mail é obrigatório" })
    .email("E-mail inválido"),
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
  cep: z.string({ message: "CEP é obrigatório" }),
  address: z.string({ message: "Endereço é obrigatório" }),
  neighborhood: z.string({ message: "Bairro é obrigatório" }),
  city: z.string({ message: "Cidade é obrigatória" }),
  state: z.string({ message: "Estado é obrigatório" }),
  number: z.string({ message: "Número é obrigatório" }),
  complement: z.string().optional(),
  id: z.string({ message: "ID é obrigatório" }),
  notifications: z.boolean({ message: "Notificações são obrigatórias" }),
  contactType: z.string({ message: "Tipo de contato é obrigatório" }),
});

type EditProfileFields = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const { updateUser, updateUserProfile } = useUserAuth();
  const { userId } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const { user } = useUser();
  const { user: clerkUser }= useClerkUser()
  const router = useRouter();
  
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditProfileFields>({
    resolver: zodResolver(editProfileSchema),
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Set form values with current user data
      setValue("id", user.id || "");
      setValue("name", clerkUser?.fullName || "");
      setValue("email", clerkUser?.primaryEmailAddress?.emailAddress || "");
      setValue("birthDate", formatDateForDisplay(user.birthDate || ""));
      setValue("cpf", user.cpf || "");
      setValue("phone", user.phone || "");
      setValue("bio", user.bio || "");
      setValue("cep", user.cep || "");
      setValue("address", user.address || "");
      setValue("neighborhood", user.neighborhood || "");
      setValue("city", user.city || "");
      setValue("state", user.state || "");
      setValue("number", user.number || "");
      setValue("complement", user.complement || "");
      setValue("notifications", user.notifications || false);
      setValue("contactType", (user.contactType || ContactType.App).toString());
      
      // Set avatar if exists
      if (user.avatar) {
        setAvatar(user.avatar);
      }
      
      setIsLoadingProfile(false);
    }
  }, [user, setValue, clerkUser]);

  const handleCepChange = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setValue("address", data.logradouro || "");
          setValue("neighborhood", data.bairro || "");
          setValue("city", data.localidade || "");
          setValue("state", data.uf || "");
        }
      } catch (error) {
        console.error("Error fetching CEP:", error);
      }
    }
  };

  const onSubmit = async (data: EditProfileFields) => {
    if (!userId) return;
    
    setIsLoading(true);

    try {
      const updateDto = new UpdateUserDTO(data.id, data.birthDate, data.cpf, data.phone, data.bio, data.cep, data.address, data.neighborhood, data.city, data.state, data.number, data.notifications, parseInt(data.contactType), data.complement);
      
      console.log(updateDto);
      const result = await updateUserProfile(updateDto, avatar || undefined);
    
      if (result.success) {
        // Update local state
        const updatedUser = {
          ...user,
          ...data,
          avatar: avatar || user?.avatar,
        };
        updateUser(updatedUser);
        
        Alert.alert(
          "Sucesso", 
          "Perfil atualizado com sucesso!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        setError("root", { message: result.errors?.join("\n") || "Erro ao atualizar perfil" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("root", { message: "Erro ao atualizar perfil" });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert("Permissão necessária", "Permissão para acessar a câmera é necessária!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Editar Perfil
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.card }]}>
                  <Ionicons name="person" size={40} color={theme.colors.text} />
                </View>
              )}
              
              {/* Avatar Actions */}
              <View style={styles.avatarActions}>
                <TouchableOpacity 
                  onPress={pickImage} 
                  style={[styles.avatarActionButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="images" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={takePhoto} 
                  style={[styles.avatarActionButton, { backgroundColor: theme.colors.primary }]}
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
                
                {avatar && (
                  <TouchableOpacity 
                    onPress={removeAvatar} 
                    style={[styles.avatarActionButton, { backgroundColor: '#ff4757' }]}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <CustomInput
              control={control}
              name="email"
              label="E-mail"
              placeholder="E-mail"
              editable={false}
              style={{ backgroundColor: theme.colors.card, color: theme.colors.text + '80' }}
            />
            <CustomInput
              control={control}
              name="name"
              label="Nome Completo"
              placeholder="Digite seu nome completo"
              editable={false}
              style={{ backgroundColor: theme.colors.card, color: theme.colors.text + '80' }}
            />

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
              label="Telefone"
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />

            <CustomInput
              control={control}
              name="cep"
              label="CEP"
              placeholder="00000-000"
              keyboardType="numeric"
              onChangeText={handleCepChange}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  control={control}
                  name="address"
                  label="Endereço"
                  placeholder="Rua, Avenida, etc."
                />
              </View>
              <View style={{ flex: 0.5, marginLeft: 8 }}>
                <CustomInput
                  control={control}
                  name="number"
                  label="Número"
                  placeholder="123"
                />
              </View>
            </View>

            <CustomInput
              control={control}
              name="neighborhood"
              label="Bairro"
              placeholder="Nome do bairro"
            />

            <CustomDropdown
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
              placeholder="Nome da cidade"
            />

            <CustomInput
              control={control}
              name="complement"
              label="Complemento (opcional)"
              placeholder="Apartamento, bloco, etc."
            />

            <CustomInput
              control={control}
              name="bio"
              label="Sobre você"
              placeholder="Conte um pouco sobre você e sua experiência com pets..."
              multiline
              style={{ height: 100, textAlignVertical: "top" }}
              numberOfLines={4}
            />
          </View>

          {/* Error Display */}
          {errors.root && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.root.message}</Text>
            </View>
          )}

          <CustomCheckbox
            control={control}
            name="notifications"
            label="Receber notificações"
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

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>
                Salvar Alterações
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarActions: {
    flexDirection: "row",
    gap: 12,
  },
  avatarActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  formSection: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 