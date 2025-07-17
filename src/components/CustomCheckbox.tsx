import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

type CustomCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
};

export default function CustomCheckbox<T extends FieldValues>({ control, name, label }: CustomCheckboxProps<T>) {
  const theme = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <TouchableOpacity
          style={styles.container}
          onPress={() => onChange(!value)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, { borderColor: theme.colors.primary, backgroundColor: value ? theme.colors.primary : 'transparent' }]}> 
            {value && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
          <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  },
}); 