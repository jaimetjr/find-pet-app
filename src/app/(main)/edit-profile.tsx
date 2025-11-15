import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import * as ImagePicker from "expo-image-picker";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth, useUser as useClerkUser } from "@clerk/clerk-expo";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { UpdateUserDTO } from "@/dtos/user/updateUserDto";
import { formatDateForDisplay, formatDateForBackend } from "@/utils/dateUtils";
import { ContactType } from "@/enums/contactType";
import SegmentedTabs from "@/components/common/SegmentedTabs";
import AvatarPicker from "@/components/profile/AvatarPicker";
import ConnectedProviders from "@/components/account/ConnectedProviders";
import PasswordForm from "@/components/account/PasswordForm";
import ProfileForm from "@/components/profile/ProfileForm";

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
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const { updateUser, updateUserProfile } = useUserAuth();
  const { userId } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const { user } = useUser();
  const { user: clerkUser }= useClerkUser()
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  
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

  // Password form schema and controller (Account tab)
  // PasswordForm component handles all validation logic
  const passwordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  });

  type PasswordFields = z.infer<typeof passwordSchema>;

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
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
      ;
      const result = await updateUserProfile(updateDto, avatar || undefined);
    
      if (result.success) {
        // Update local state
        const updatedUser = {
          avatar: avatar || user?.avatar,
          phone: data.phone,
          birthDate: data.birthDate,
          cpf: data.cpf,
          bio: data.bio,
          cep: data.cep,
          address: data.address,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          number: data.number,
          complement: data.complement,
          notifications: data.notifications,
          // contactType stored in backend; not part of User in context type
        } as const;
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

  const hasPassword = (() => {
    try {
      // Clerk user may expose hasPassword or passwordEnabled depending on SDK version
      return Boolean((clerkUser as any)?.hasPassword ?? (clerkUser as any)?.passwordEnabled);
    } catch {
      return false;
    }
  })();

  const isProviderLinked = (provider: 'google' | 'apple' | 'facebook') => {
    const accounts = (clerkUser?.externalAccounts || []) as any[];
    return accounts?.some((acc) => {
      const p = String(acc?.provider || '').toLowerCase();
      return p.includes(provider);
    });
  };

  const linkProvider = async (
    strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook'
  ) => {
    try {
      console.log('Link provider called with strategy:', strategy);
      setIsLoading(true);
      
      // For Apple and Facebook, we can't use createExternalAccount because it returns unverified status
      // and we can't manually open the verification URL due to native bridge issues
      // So we need to show a message to the user that they should use the web flow
      if (strategy === 'oauth_apple' || strategy === 'oauth_facebook') {
        Alert.alert(
          'Not supported',
          `Linking ${strategy === 'oauth_apple' ? 'Apple' : 'Facebook'} accounts is not supported in the mobile app. Please use the web version or contact support.`
        );
        return;
      }
      
      // Try createExternalAccount first
      if ((clerkUser as any)?.createExternalAccount) {
        console.log('Using createExternalAccount method for strategy:', strategy);
        const result = await (clerkUser as any).createExternalAccount({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri({ native: 'findpetapp://oauth-callback' }),
        });
        console.log('createExternalAccount result:', result);
      } else {
        console.log('createExternalAccount not available, using startSSOFlow for strategy:', strategy);
        const { createdSessionId, setActive, authSessionResult, signIn, signUp } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri({ native: 'findpetapp://oauth-callback' }),
        });
        
        console.log('Link provider result:', { strategy, createdSessionId, hasSignIn: !!signIn, hasSignUp: !!signUp });
        
        if (createdSessionId && setActive) {
          console.log('Session created, setting active');
          await setActive({ session: createdSessionId });
        } else if (signIn || signUp) {
          console.log('Link flow completed but no new session created');
        }
      }
      
      await (clerkUser as any)?.reload?.();
      Alert.alert('Sucesso', 'Conta vinculada com sucesso.');
    } catch (error) {
      console.error('Link provider error', error);
      
      // Check if the error is due to user cancellation
      const errorString = error ? JSON.stringify(error) : '';
      if (errorString.includes('cancelled') || errorString.includes('cancel') || errorString.includes('{}')) {
        // User cancelled the OAuth flow, don't show an error
        console.log('OAuth flow cancelled by user');
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível vincular a conta.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkProvider = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const accounts = ((clerkUser as any)?.externalAccounts || []) as any[];
      const account = accounts.find((acc) => String(acc?.provider || '').toLowerCase().includes(provider));
      if (!account) {
        Alert.alert('Aviso', 'Essa conta não está vinculada.');
        return;
      }

      // Check if this is the last authentication method
      const hasPasswordAuth = hasPassword;
      const totalAccounts = accounts.length;
      
      if (totalAccounts === 1 && !hasPasswordAuth) {
        Alert.alert(
          'Aviso', 
          'Você não pode desvincular esta conta pois é o único método de autenticação. Defina uma senha primeiro ou vincule outra conta.'
        );
        return;
      }

      setIsLoading(true);

      // Use the ExternalAccount.destroy() method when available
      if (typeof (account as any)?.destroy === 'function') {
        await (account as any).destroy();
      } else {
        throw new Error('Método de desvincular não suportado pelo SDK atual');
      }

      // Reload user to reflect changes
      await (clerkUser as any)?.reload?.();
      
      // Verify the unlink worked
      const updatedAccounts = ((clerkUser as any)?.externalAccounts || []) as any[];
      const stillLinked = updatedAccounts.find((acc) => String(acc?.provider || '').toLowerCase().includes(provider));
      
      if (stillLinked) {
        console.error('Account still linked after unlinking');
        Alert.alert('Erro', 'A conta não foi desvinculada corretamente. Por favor, tente novamente.');
      } else {
        Alert.alert('Sucesso', 'Conta desvinculada com sucesso.');
      }
    } catch (error) {
      console.error('Unlink provider error', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível desvincular a conta.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePassword = async (data: PasswordFields) => {
    try {
      setIsLoading(true);
      
      await (clerkUser as any)?.updatePassword?.({
        newPassword: data.newPassword,
        // Require current password only if a password already exists
        currentPassword: hasPassword ? data.currentPassword : undefined,
      });
      resetPasswordForm();
      Alert.alert('Sucesso', hasPassword ? 'Senha alterada com sucesso.' : 'Senha definida com sucesso.');
    } catch (error) {
      console.error('Change password error', error);
      Alert.alert('Erro', 'Não foi possível atualizar a senha.');
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
      <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => router.push('/(main)/settings')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Editar Perfil
          </Text>
          <View style={styles.placeholder} />
        </View>

        <SegmentedTabs
          active={activeTab}
          onChange={setActiveTab}
          textColor={theme.colors.text}
          borderColor={theme.colors.border}
          cardColor={theme.colors.card}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'profile' && (
          <>
          <AvatarPicker
            avatar={avatar}
            onPickImage={pickImage}
            onTakePhoto={takePhoto}
            onRemove={removeAvatar}
            placeholderBg={theme.colors.card}
            primaryColor={theme.colors.primary}
            iconColor={theme.colors.text}
          />

          <View style={styles.formSection}>
            {/* Generic form extracted */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {/** Keep using local control types */}
            <ProfileForm<any> control={control as any} onCepChange={handleCepChange} />
          </View>

          {/* Error Display */}
          {errors.root && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.root.message}</Text>
            </View>
          )}

          {/* Already included inside ProfileForm */}

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
          </>
          )}

          {activeTab === 'account' && (
          <>
            <ConnectedProviders
              isProviderLinked={isProviderLinked}
              linkProvider={linkProvider}
              unlinkProvider={unlinkProvider}
              textColor={theme.colors.text}
              borderColor={theme.colors.border}
              primaryColor={theme.colors.primary}
              isLoading={isLoading}
            />

            <PasswordForm
              hasPassword={hasPassword}
              control={passwordControl as any}
              onSubmit={handlePasswordSubmit(onChangePassword)}
              isLoading={isLoading}
              primaryColor={theme.colors.primary}
            />
          </>
          )}
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  tabTextActive: {
    opacity: 1,
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
  section: {
    marginTop: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  linkButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  unlinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ff4757',
  },
  unlinkButtonText: {
    color: 'white',
    fontWeight: '700',
  },
}); 