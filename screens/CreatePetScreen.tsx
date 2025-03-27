"use client"
import type React from "react"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { CreatePetScreenNavigationProp } from "../types/navigation"

type CreatePetScreenProps = {
  navigation: CreatePetScreenNavigationProp
}

const CreatePetScreen: React.FC<CreatePetScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [breed, setBreed] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [size, setSize] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [images, setImages] = useState<string[]>([])

  const handleAddImage = () => {
    // In a real app, you would use image picker here
    const placeholderImage =
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=1000&auto=format&fit=crop"
    setImages([...images, placeholderImage])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleCreatePet = () => {
    // Validate inputs
    if (
      !name ||
      !type ||
      !breed ||
      !age ||
      !gender ||
      !size ||
      !location ||
      !description ||
      !contactName ||
      !contactPhone
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (images.length === 0) {
      Alert.alert("Erro", "Por favor, adicione pelo menos uma imagem do pet.")
      return
    }

    // Here you would call your API to create the pet
    Alert.alert("Sucesso", "Pet cadastrado com sucesso!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Main"),
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Cadastrar Pet</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Preencha os campos abaixo para cadastrar um pet para adoção
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações Básicas</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Nome do Pet *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                ]}
                placeholder="Nome do pet"
                placeholderTextColor={`${theme.colors.text}80`}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Tipo *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Ex: Cachorro, Gato"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={type}
                  onChangeText={setType}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Raça *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Raça do pet"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={breed}
                  onChangeText={setBreed}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Idade (anos) *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Idade"
                  placeholderTextColor={`${theme.colors.text}80`}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Sexo *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Macho ou Fêmea"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={gender}
                  onChangeText={setGender}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Porte *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Pequeno, Médio, Grande"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={size}
                  onChangeText={setSize}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Localização *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  ]}
                  placeholder="Cidade, Estado"
                  placeholderTextColor={`${theme.colors.text}80`}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Descrição *</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                ]}
                placeholder="Descreva o pet, sua personalidade, necessidades especiais, etc."
                placeholderTextColor={`${theme.colors.text}80`}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações de Contato</Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Nome para Contato *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                ]}
                placeholder="Seu nome"
                placeholderTextColor={`${theme.colors.text}80`}
                value={contactName}
                onChangeText={setContactName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Telefone para Contato *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                ]}
                placeholder="(00) 00000-0000"
                placeholderTextColor={`${theme.colors.text}80`}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fotos</Text>
            <Text style={[styles.photoHelp, { color: theme.colors.text }]}>
              Adicione fotos do pet para aumentar as chances de adoção
            </Text>

            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Feather name="x" size={16} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
                onPress={handleAddImage}
              >
                <Feather name="plus" size={24} color={theme.colors.text} />
                <Text style={[styles.addImageText, { color: theme.colors.text }]}>Adicionar Foto</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleCreatePet}
          >
            <Text style={[styles.submitButtonText, { color: theme.colors.text }]}>Cadastrar Pet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 100,
  },
  row: {
    flexDirection: "row",
  },
  photoHelp: {
    fontSize: 14,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default CreatePetScreen

