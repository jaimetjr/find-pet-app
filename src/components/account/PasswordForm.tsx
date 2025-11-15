import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomInput from "@/components/CustomInput";
import { Control, useWatch } from "react-hook-form";

export type PasswordFields = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFormProps = {
  hasPassword: boolean;
  control: Control<PasswordFields>;
  onSubmit: () => void;
  isLoading?: boolean;
  primaryColor: string;
};

export default function PasswordForm({ hasPassword, control, onSubmit, isLoading, primaryColor }: PasswordFormProps) {
  const newPassword = useWatch({ control, name: "newPassword" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });
  
  const requirements = useMemo(() => {
    const password = newPassword || "";
    return {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
      passwordsMatch: confirmPassword && password === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    console.log('PasswordForm hasPassword:', hasPassword);
  }, [hasPassword]);

  const handleSubmit = () => {
    const missingRequirements = [];
    
    if (!requirements.minLength) missingRequirements.push("Mínimo 8 caracteres");
    if (!requirements.hasLowercase) missingRequirements.push("Pelo menos 1 letra minúscula");
    if (!requirements.hasUppercase) missingRequirements.push("Pelo menos 1 letra maiúscula");
    if (!requirements.hasNumber) missingRequirements.push("Pelo menos 1 número");
    if (!requirements.hasSpecialChar) missingRequirements.push("Pelo menos 1 caractere especial");
    if (!requirements.passwordsMatch) missingRequirements.push("As senhas devem coincidir");

    if (missingRequirements.length > 0) {
      Alert.alert(
        "Requisitos não atendidos",
        "Por favor, atenda aos seguintes requisitos:\n\n• " + missingRequirements.join("\n• "),
        [{ text: "OK" }]
      );
      return;
    }

    onSubmit();
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{hasPassword ? 'Alterar senha' : 'Definir senha'}</Text>
      {hasPassword && (
        <CustomInput
          control={control}
          name="currentPassword"
          label="Senha atual"
          placeholder="Sua senha atual"
          secureTextEntry
        />
      )}
      <CustomInput
        control={control}
        name="newPassword"
        label="Nova senha"
        placeholder="Sua nova senha"
        secureTextEntry
      />
      <CustomInput
        control={control}
        name="confirmPassword"
        label="Confirmar nova senha"
        placeholder="Repita a nova senha"
        secureTextEntry
      />
      
      <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
      <Text style={[styles.requirement, requirements.minLength && styles.requirementMet]}>
        • Mínimo 8 caracteres
      </Text>
      <Text style={[styles.requirement, requirements.hasLowercase && styles.requirementMet]}>
        • Pelo menos 1 letra minúscula
      </Text>
      <Text style={[styles.requirement, requirements.hasUppercase && styles.requirementMet]}>
        • Pelo menos 1 letra maiúscula
      </Text>
      <Text style={[styles.requirement, requirements.hasNumber && styles.requirementMet]}>
        • Pelo menos 1 número
      </Text>
      <Text style={[styles.requirement, requirements.hasSpecialChar && styles.requirementMet]}>
        • Pelo menos 1 caractere especial
      </Text>
      <Text style={[styles.requirement, requirements.passwordsMatch && styles.requirementMet]}>
        • As senhas coincidem
      </Text>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: primaryColor }, isLoading && styles.saveButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>
            {hasPassword ? 'Salvar nova senha' : 'Definir senha'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  requirement: {
    fontSize: 12,
    color: '#666',
  },
  requirementMet: {
    color: '#4caf50',
    fontWeight: '600',
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


