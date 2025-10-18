import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { useTheme } from "@/contexts/ThemeContext";

type Option = { label: string; value: string };

type CustomDropdownProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: Option[];
} & TouchableOpacityProps;

export default function CustomDropdown<T extends FieldValues>({ name, control, label, options, ...props }: CustomDropdownProps<T>) {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const selectedLabel =
          options.find((opt) => opt.value === value)?.label || "Selecione";

        return (
          <>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {label}
            </Text>
            <TouchableOpacity
              {...props}
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border || "#ccc",
                },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={{
                  color: value ? theme.colors.text : "#999",
                  paddingHorizontal: 10,
                }}
              >
                {selectedLabel}
              </Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setModalVisible(false)}
                activeOpacity={1}
              >
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: theme.colors.background },
                  ]}
                >
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          onChange(item.value);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={{ color: theme.colors.text }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </>
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
    marginBottom: 16,
    minHeight: 44,
    justifyContent: "center",
    pointerEvents: "box-none",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 8,
    maxHeight: "60%",
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
