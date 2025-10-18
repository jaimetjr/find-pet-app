import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet, Platform, TextInput } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateForDisplay, formatDateForBackend } from "@/utils/dateUtils";

type CustomDatePickerProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
};

export default function CustomDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "DD/MM/AAAA",
}: CustomDatePickerProps<T>) {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  // Minimum age: 13 years old
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const minDate = new Date(1900, 0, 1);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        // Parse value to Date
        let dateValue: Date | undefined = undefined;
        if (value) {
          const iso = formatDateForBackend(value);
          if (iso) dateValue = new Date(iso);
        }
        return (
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
            <TouchableOpacity
              style={[
                styles.pickerContainer,
                { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              ]}
              onPress={() => setShow(true)}
              activeOpacity={0.8}
            >
              <TextInput
                style={{ color: theme.colors.text, flex: 1 }}
                placeholder={placeholder}
                value={value}
                keyboardType="numeric"
                onChangeText={(text) => {
                  // Allow free input
                  const numericText = text.replace(/[^0-9]/g, '');
                  let formattedText = numericText;
                  // Format the input into a date format only when the input is complete
                  if (numericText.length === 8) {
                    formattedText = numericText.slice(0, 2) + '/' + numericText.slice(2, 4) + '/' + numericText.slice(4);
                  }
                  // Update the input value
                  onChange(formattedText);
                }}
              />
              <Ionicons name="calendar-outline" size={20} color={theme.colors.text} style={styles.calendarIcon} />
            </TouchableOpacity>
            {show && (
              <DateTimePicker
                value={dateValue || maxDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShow(Platform.OS === 'ios');
                  if (selectedDate) {
                    // Format for display (DD/MM/YYYY)
                    const iso = selectedDate.toISOString().split('T')[0];
                    const display = formatDateForDisplay(iso);
                    onChange(display);
                  }
                }}
                maximumDate={maxDate}
                minimumDate={minDate}
                locale="pt-BR"
              />
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    marginTop: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  calendarIcon: {
    marginLeft: 8,
  },
}); 