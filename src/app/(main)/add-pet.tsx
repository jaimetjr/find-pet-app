import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { brazilStates } from "@/helpers/states";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { addPet, getPet, updatePet } from "@/services/petService";
import { AddPetDTO, PetType, PetBreed } from "@/dtos/pet/addPetDto";
import { PetSize } from "@/enums/petSize-enum";

// Mock data for pet types and breeds with IDs
const petTypes: PetType[] = [
  { id: "550e8400-e29b-41d4-a716-446655440001", name: "Cachorro" },
  { id: "550e8400-e29b-41d4-a716-446655440002", name: "Gato" },
  { id: "550e8400-e29b-41d4-a716-446655440003", name: "Pássaro" },
  { id: "550e8400-e29b-41d4-a716-446655440004", name: "Peixe" },
  { id: "550e8400-e29b-41d4-a716-446655440005", name: "Hamster" },
  { id: "550e8400-e29b-41d4-a716-446655440006", name: "Coelho" },
  { id: "550e8400-e29b-41d4-a716-446655440007", name: "Tartaruga" },
  { id: "550e8400-e29b-41d4-a716-446655440008", name: "Cobra" },
  { id: "550e8400-e29b-41d4-a716-446655440009", name: "Porquinho da Índia" },
  { id: "550e8400-e29b-41d4-a716-446655440010", name: "Furão" },
];

const breedOptions: Record<string, PetBreed[]> = {
  "550e8400-e29b-41d4-a716-446655440001": [
    // Cachorro
    { id: "550e8400-e29b-41d4-a716-446655440101", name: "Golden Retriever" },
    { id: "550e8400-e29b-41d4-a716-446655440102", name: "Labrador Retriever" },
    { id: "550e8400-e29b-41d4-a716-446655440103", name: "Pastor Alemão" },
    { id: "550e8400-e29b-41d4-a716-446655440104", name: "Bulldog" },
    { id: "550e8400-e29b-41d4-a716-446655440105", name: "Poodle" },
    { id: "550e8400-e29b-41d4-a716-446655440106", name: "Beagle" },
    { id: "550e8400-e29b-41d4-a716-446655440107", name: "Rottweiler" },
    { id: "550e8400-e29b-41d4-a716-446655440108", name: "Yorkshire Terrier" },
    { id: "550e8400-e29b-41d4-a716-446655440109", name: "Boxer" },
    { id: "550e8400-e29b-41d4-a716-446655440110", name: "Dachshund" },
    { id: "550e8400-e29b-41d4-a716-446655440111", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440002": [
    // Gato
    { id: "550e8400-e29b-41d4-a716-446655440201", name: "Persa" },
    { id: "550e8400-e29b-41d4-a716-446655440202", name: "Siamês" },
    { id: "550e8400-e29b-41d4-a716-446655440203", name: "Maine Coon" },
    { id: "550e8400-e29b-41d4-a716-446655440204", name: "Ragdoll" },
    { id: "550e8400-e29b-41d4-a716-446655440205", name: "Bengala" },
    { id: "550e8400-e29b-41d4-a716-446655440206", name: "Abissínio" },
    { id: "550e8400-e29b-41d4-a716-446655440207", name: "Sphynx" },
    { id: "550e8400-e29b-41d4-a716-446655440208", name: "Munchkin" },
    { id: "550e8400-e29b-41d4-a716-446655440209", name: "British Shorthair" },
    { id: "550e8400-e29b-41d4-a716-446655440210", name: "Russian Blue" },
    { id: "550e8400-e29b-41d4-a716-446655440211", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440003": [
    // Pássaro
    { id: "550e8400-e29b-41d4-a716-446655440301", name: "Canário" },
    { id: "550e8400-e29b-41d4-a716-446655440302", name: "Periquito" },
    { id: "550e8400-e29b-41d4-a716-446655440303", name: "Cacatua" },
    { id: "550e8400-e29b-41d4-a716-446655440304", name: "Papagaio" },
    { id: "550e8400-e29b-41d4-a716-446655440305", name: "Agapornis" },
    { id: "550e8400-e29b-41d4-a716-446655440306", name: "Calopsita" },
    { id: "550e8400-e29b-41d4-a716-446655440307", name: "Mandarim" },
    { id: "550e8400-e29b-41d4-a716-446655440308", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440004": [
    // Peixe
    { id: "550e8400-e29b-41d4-a716-446655440401", name: "Betta" },
    { id: "550e8400-e29b-41d4-a716-446655440402", name: "Goldfish" },
    { id: "550e8400-e29b-41d4-a716-446655440403", name: "Tetra" },
    { id: "550e8400-e29b-41d4-a716-446655440404", name: "Guppy" },
    { id: "550e8400-e29b-41d4-a716-446655440405", name: "Molly" },
    { id: "550e8400-e29b-41d4-a716-446655440406", name: "Platy" },
    { id: "550e8400-e29b-41d4-a716-446655440407", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440005": [
    // Hamster
    { id: "550e8400-e29b-41d4-a716-446655440501", name: "Sírio" },
    { id: "550e8400-e29b-41d4-a716-446655440502", name: "Anão Russo" },
    { id: "550e8400-e29b-41d4-a716-446655440503", name: "Chinês" },
    { id: "550e8400-e29b-41d4-a716-446655440504", name: "Roborovski" },
    { id: "550e8400-e29b-41d4-a716-446655440505", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440006": [
    // Coelho
    { id: "550e8400-e29b-41d4-a716-446655440601", name: "Holland Lop" },
    { id: "550e8400-e29b-41d4-a716-446655440602", name: "Netherland Dwarf" },
    { id: "550e8400-e29b-41d4-a716-446655440603", name: "Rex" },
    { id: "550e8400-e29b-41d4-a716-446655440604", name: "Angorá" },
    { id: "550e8400-e29b-41d4-a716-446655440605", name: "Lionhead" },
    { id: "550e8400-e29b-41d4-a716-446655440606", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440007": [
    // Tartaruga
    {
      id: "550e8400-e29b-41d4-a716-446655440701",
      name: "Tartaruga de Orelha Vermelha",
    },
    { id: "550e8400-e29b-41d4-a716-446655440702", name: "Tartaruga Painted" },
    { id: "550e8400-e29b-41d4-a716-446655440703", name: "Tartaruga Box" },
    { id: "550e8400-e29b-41d4-a716-446655440704", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440008": [
    // Cobra
    { id: "550e8400-e29b-41d4-a716-446655440801", name: "Cobra do Milho" },
    { id: "550e8400-e29b-41d4-a716-446655440802", name: "Python Bola" },
    { id: "550e8400-e29b-41d4-a716-446655440803", name: "Cobra do Rei" },
    { id: "550e8400-e29b-41d4-a716-446655440804", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440009": [
    // Porquinho da Índia
    { id: "550e8400-e29b-41d4-a716-446655440901", name: "Americano" },
    { id: "550e8400-e29b-41d4-a716-446655440902", name: "Abissínio" },
    { id: "550e8400-e29b-41d4-a716-446655440903", name: "Peruano" },
    { id: "550e8400-e29b-41d4-a716-446655440904", name: "Silkie" },
    { id: "550e8400-e29b-41d4-a716-446655440905", name: "Outro" },
  ],
  "550e8400-e29b-41d4-a716-446655440010": [
    // Furão
    { id: "550e8400-e29b-41d4-a716-446655441001", name: "Furão Doméstico" },
    { id: "550e8400-e29b-41d4-a716-446655441002", name: "Outro" },
  ],
};

const dogSizes = ["Pequeno", "Médio", "Grande", "Gigante"];



// Zod schema for validation
const addPetSchema = z.object({
  name: z
    .string({ message: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  type: z.string({ message: "Tipo é obrigatório" }),
  breed: z.string({ message: "Raça é obrigatória" }),
  size: z.nativeEnum(PetSize, { message: "Tamanho é obrigatório" }),
  age: z
    .number({ message: "Idade é obrigatória" })
    .min(0, "Idade deve ser maior ou igual a 0")
    .max(30, "Idade deve ser menor ou igual a 30"),
  bio: z
    .string({ message: "Bio é obrigatória" })
    .min(10, "Bio deve ter pelo menos 10 caracteres"),
  history: z
    .string({ message: "Histórico de doenças é obrigatório" })
    .min(5, "Histórico deve ter pelo menos 5 caracteres"),
  cep: z
    .string({ message: "CEP é obrigatório" })
    .min(8, "CEP deve ter 8 dígitos"),
  address: z.string({ message: "Endereço é obrigatório" }),
  neighborhood: z.string({ message: "Bairro é obrigatório" }),
  state: z.string({ message: "Estado é obrigatório" }),
  city: z.string({ message: "Cidade é obrigatória" }),
  number: z.string({ message: "Número é obrigatório" }),
  complement: z.string().optional(),
});

type AddPetFields = z.infer<typeof addPetSchema>;

export default function AddPetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams();
  const petId = params.petId as string;
  const isEditMode = !!petId;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPet, setIsLoadingPet] = useState(isEditMode);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [selectedBreed, setSelectedBreed] = useState<PetBreed | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<AddPetFields>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      size: PetSize.Small, // Default size for non-dogs
    },
  });

  const watchedType = watch("type");
  const watchedSize = watch("size");

  // Load pet data when in edit mode
  useEffect(() => {
    const loadPetData = async () => {
      if (!isEditMode || !petId) return;
      try {
        setIsLoadingPet(true);
        const result = await getPet(petId);
        
        if (result.success && result.value) {
          const pet = result.value;
          
          // Set form values with all available properties
          reset({
            name: pet.name,
            type: pet.type.id,
            breed: pet.breed.id,
            size: pet.size,
            age: pet.age,
            bio: pet.bio,
            history: pet.history,
            cep: pet.cep,
            address: pet.address,
            neighborhood: pet.neighborhood,
            state: pet.state,
            city: pet.city,
            number: pet.number,
            complement: pet.complement || "",
          });
          
          // Set selected type and breed
          setSelectedType(pet.type);
          setSelectedBreed({ ...pet.breed, type: pet.type });
        }
      } catch (error) {
        console.error('Error loading pet data:', error);
        Alert.alert('Erro', 'Erro ao carregar dados do pet');
      } finally {
        setIsLoadingPet(false);
      }
    }; 

    loadPetData();
  }, [isEditMode, petId, reset]);

  // Ensure we always start at step 1
  useEffect(() => {
    setCurrentStep(1);
  }, []);

  // Helper function to get size display name
  const getSizeDisplayName = (size: PetSize): string => {
    switch (size) {
      case PetSize.Small:
        return "Pequeno";
      case PetSize.Medium:
        return "Médio";
      case PetSize.Large:
        return "Grande";
      case PetSize.Gigant:
        return "Gigante";
      default:
        return "Pequeno";
    }
  };

  // Helper function to get size from display name
  const getSizeFromDisplayName = (displayName: string): PetSize => {
    switch (displayName) {
      case "Pequeno":
        return PetSize.Small;
      case "Médio":
        return PetSize.Medium;
      case "Grande":
        return PetSize.Large;
      case "Gigante":
        return PetSize.Gigant;
      default:
        return PetSize.Small;
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

  const onSubmit = async (data: AddPetFields) => {
    if (!selectedType || !selectedBreed) {
      Alert.alert(
        "Dados Incompletos",
        "Por favor, selecione o tipo e raça do pet."
      );
      return;
    }

    if (!userId) {
      Alert.alert(
        "Erro",
        "Usuário não autenticado. Por favor, faça login novamente."
      );
      return;
    }

    setIsLoading(true);

    try {
      const petDTO = new AddPetDTO(
        userId,
        data.name,
        selectedType,
        selectedBreed,
        data.size,
        data.age,
        data.bio,
        data.history,
        data.cep,
        data.address,
        data.neighborhood,
        data.state,
        data.city,
        data.number,
        data.complement
      );

      let result;
      if (isEditMode && petId) {
        result = await updatePet(petId, petDTO);
      } else {
        result = await addPet(petDTO);
      }

      //console.log(result);

      if (result.success) {
        const action = isEditMode ? "atualizado" : "registrado";
        Alert.alert(
          "Sucesso",
          `Pet ${action} com sucesso! Deseja adicionar fotos agora?`,
          [
            {
              text: "Não",
              style: "cancel",
              onPress: () => {
                if (!isEditMode) {
                  resetForm();
                }
                router.back();
              },
            },
            {
              text: "Sim",
              onPress: () =>
                router.push({
                  pathname: "/(main)/add-pet-images",
                  params: { petId: result.value.id },
                }),
            },
          ]
        );
      } else {
        const action = isEditMode ? "atualizar" : "registrar";
        Alert.alert("Erro", `Erro ao ${action} pet, tente novamente mais tarde.`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = isEditMode ? "Erro ao atualizar pet" : "Erro ao registrar pet";

      if (Array.isArray(error)) {
        errorMessage = error.join("\n");
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    reset({
      name: "",
      type: "",
      breed: "",
      size: PetSize.Small,
      age: undefined,
      bio: "",
      history: "",
      cep: "",
      address: "",
      neighborhood: "",
      state: "",
      city: "",
      number: "",
      complement: "",
    });
    setSelectedType(null);
    setSelectedBreed(null);
    setCurrentStep(1);
  };

  const handleCancel = () => {
    router.back();
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof AddPetFields)[] = [];

    // Define which fields to validate for each step
    if (currentStep === 1) {
      fieldsToValidate = ["name", "type", "breed", "size"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["age", "bio", "history"];
    } else if (currentStep === 3) {
      fieldsToValidate = [
        "cep",
        "address",
        "neighborhood",
        "state",
        "city",
        "number",
        "complement",
      ];
    }

    // Trigger validation for current step fields
    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (step: number) => {
    // Prevent going to step 1 if we're already there (to avoid unnecessary resets)
    if (step === 1 && currentStep === 1) {
      return;
    }
    
    // If trying to go to a later step, validate current step first
    if (step > currentStep) {
      let fieldsToValidate: (keyof AddPetFields)[] = [];

      if (currentStep === 1) {
        fieldsToValidate = ["name", "type", "breed", "size"];
      } else if (currentStep === 2) {
        fieldsToValidate = ["age", "bio", "history"];
      } else if (currentStep === 3) {
        fieldsToValidate = [
          "cep",
          "address",
          "neighborhood",
          "state",
          "city",
          "number",
          "complement",
        ];
      }

      const isValid = await trigger(fieldsToValidate);
      if (!isValid) {
        return; // Don't proceed if validation fails
      }
    }

    // Allow going to any step (forward or backward)
    setCurrentStep(step);
  };

  const renderDropdownButton = (
    value: string,
    placeholder: string,
    onPress: () => void,
    disabled?: boolean
  ) => (
    <TouchableOpacity
      style={[
        styles.dropdownButton,
        {
          backgroundColor: theme.colors.card,
          borderColor: errors[value as keyof AddPetFields]
            ? "red"
            : theme.colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.dropdownButtonText,
          { color: value ? theme.colors.text : theme.colors.text + "80" },
        ]}
      >
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
    </TouchableOpacity>
  );

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: string[],
    onSelect: (item: string) => void
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text
                  style={[styles.modalItemText, { color: theme.colors.text }]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <TouchableOpacity
          key={step}
          style={styles.stepContainer}
          onPress={() => goToStep(step)}
        >
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor:
                  step <= currentStep
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: step <= currentStep ? "white" : theme.colors.text },
              ]}
            >
              {step}
            </Text>
          </View>
          <Text style={[styles.stepLabel, { color: theme.colors.text }]}>
            {step === 1 ? "Básico" : step === 2 ? "Detalhes" : "Localização"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Informações Básicas
      </Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Nome do Pet *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.name ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Digite o nome do pet"
              placeholderTextColor={theme.colors.text + "80"}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Tipo *</Text>
        <Controller
          control={control}
          name="type"
          render={({ field: { value } }) => (
            <>
              {renderDropdownButton(
                selectedType?.name || "",
                "Selecione o tipo do pet",
                () => setShowTypeModal(true)
              )}
              {errors.type && (
                <Text style={styles.errorText}>{errors.type.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Raça *</Text>
        <Controller
          control={control}
          name="breed"
          render={({ field: { value } }) => (
            <>
              {renderDropdownButton(
                selectedBreed?.name || "",
                selectedType ? "Selecione a raça" : "Primeiro selecione o tipo",
                () => (selectedType ? setShowBreedModal(true) : null),
                !selectedType
              )}
              {errors.breed && (
                <Text style={styles.errorText}>{errors.breed.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Tamanho *
        </Text>
        <Controller
          control={control}
          name="size"
          render={({ field: { value } }) => (
            <>
              {renderDropdownButton(
                getSizeDisplayName(value),
                selectedType?.id === "550e8400-e29b-41d4-a716-446655440001"
                  ? "Selecione o tamanho"
                  : "Pequeno (automático)",
                () =>
                  selectedType?.id === "550e8400-e29b-41d4-a716-446655440001"
                    ? setShowSizeModal(true)
                    : null,
                selectedType?.id !== "550e8400-e29b-41d4-a716-446655440001"
              )}
              {errors.size && (
                <Text style={styles.errorText}>{errors.size.message}</Text>
              )}
            </>
          )}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Detalhes do Pet
      </Text>

      <Controller
        control={control}
        name="age"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Idade *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.age ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value?.toString() || ""}
              onChangeText={(text) => {
                // Only allow numbers
                const numericText = text.replace(/[^0-9]/g, '');
                // Convert to number or set to undefined if empty
                const numValue = numericText ? parseInt(numericText, 10) : undefined;
                onChange(numValue);
              }}
              placeholder="Ex: 3"
              placeholderTextColor={theme.colors.text + "80"}
              keyboardType="numeric"
            />
            {errors.age && (
              <Text style={styles.errorText}>{errors.age.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Bio *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.bio ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Conte um pouco sobre seu pet..."
              placeholderTextColor={theme.colors.text + "80"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.bio && (
              <Text style={styles.errorText}>{errors.bio.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="history"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Histórico de Doenças *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.history ? "red" : theme.colors.border,
                  color: theme.colors.text,
                  minHeight: 120,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Informe doenças prévias, tratamentos, etc..."
              placeholderTextColor={theme.colors.text + "80"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.history && (
              <Text style={styles.errorText}>{errors.history.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Localização
      </Text>

      <Controller
        control={control}
        name="cep"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              CEP *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.cep ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                handleCepChange(text);
              }}
              placeholder="00000-000"
              placeholderTextColor={theme.colors.text + "80"}
              keyboardType="numeric"
              maxLength={8}
            />
            {errors.cep && (
              <Text style={styles.errorText}>{errors.cep.message}</Text>
            )}
          </View>
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Endereço *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: errors.address ? "red" : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="Rua, Avenida, etc."
                placeholderTextColor={theme.colors.text + "80"}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address.message}</Text>
              )}
            </View>
          )}
        />
        <Controller
          control={control}
          name="number"
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Número *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: errors.number ? "red" : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                placeholder="123"
                placeholderTextColor={theme.colors.text + "80"}
              />
              {errors.number && (
                <Text style={styles.errorText}>{errors.number.message}</Text>
              )}
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="neighborhood"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Bairro *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.neighborhood
                    ? "red"
                    : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Nome do bairro"
              placeholderTextColor={theme.colors.text + "80"}
            />
            {errors.neighborhood && (
              <Text style={styles.errorText}>
                {errors.neighborhood.message}
              </Text>
            )}
          </View>
        )}
      />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Estado *
        </Text>
        <Controller
          control={control}
          name="state"
          render={({ field: { value } }) => (
            <>
              {renderDropdownButton(value, "Selecione o estado", () =>
                setShowStateModal(true)
              )}
              {errors.state && (
                <Text style={styles.errorText}>{errors.state.message}</Text>
              )}
            </>
          )}
        />
      </View>

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Cidade *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.city ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Nome da cidade"
              placeholderTextColor={theme.colors.text + "80"}
            />
            {errors.city && (
              <Text style={styles.errorText}>{errors.city.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="complement"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Complemento *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: errors.complement ? "red" : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={value}
              onChangeText={onChange}
              placeholder="Apartamento, bloco, etc."
              placeholderTextColor={theme.colors.text + "80"}
            />
            {errors.complement && (
              <Text style={styles.errorText}>{errors.complement.message}</Text>
            )}
          </View>
        )}
      />
    </View>
  );

  // Show loading screen when loading pet data in edit mode
  if (isLoadingPet) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Carregando dados do pet...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        {renderStepIndicator()}

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={prevStep}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.colors.primary },
                  ]}
                >
                  Anterior
                </Text>
              </TouchableOpacity>
            )}

            {currentStep < 3 ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={nextStep}
              >
                <Text style={styles.primaryButtonText}>Próximo</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text style={styles.primaryButtonText}>
                  {isEditMode ? "Atualizar Pet" : "Salvar Pet"}
                </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Type Modal */}
        {renderModal(
          showTypeModal,
          () => setShowTypeModal(false),
          "Selecione o Tipo",
          petTypes.map((type) => type.name),
          (typeName) => {
            const selectedType = petTypes.find((type) => type.name === typeName);
            if (selectedType) {
              setSelectedType(selectedType);
              setValue("type", selectedType.id);
              setSelectedBreed(null);
              setValue("breed", "");
              setValue(
                "size",
                selectedType.id === "550e8400-e29b-41d4-a716-446655440001"
                  ? PetSize.Small
                  : PetSize.Small
              ); // Reset size for dogs
            }
          }
        )}

        {/* Breed Modal */}
        {renderModal(
          showBreedModal,
          () => setShowBreedModal(false),
          "Selecione a Raça",
          selectedType
            ? breedOptions[selectedType.id]?.map((breed) => breed.name) || []
            : [],
          (breedName) => {
            if (selectedType) {
              const selectedBreed = breedOptions[selectedType.id]?.find(
                (breed) => breed.name === breedName
              );
              if (selectedBreed) {
                setSelectedBreed({ ...selectedBreed, type: selectedType });
                setValue("breed", selectedBreed.id);
              }
            }
          }
        )}

        {/* Size Modal */}
        {renderModal(
          showSizeModal,
          () => setShowSizeModal(false),
          "Selecione o Tamanho",
          dogSizes,
          (sizeDisplayName) =>
            setValue("size", getSizeFromDisplayName(sizeDisplayName))
        )}

        {/* State Modal */}
        {renderModal(
          showStateModal,
          () => setShowStateModal(false),
          "Selecione o Estado",
          brazilStates.map((state) => state.name),
          (stateName) => {
            const state = brazilStates.find((s) => s.name === stateName);
            setValue("state", state?.uf || "");
          }
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdownButtonText: {
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
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
});
