import {
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  View,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

type CustomInputProps<T extends FieldValues> = {
  control: Control<T>; // custom fields
  name: Path<T>;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
} & TextInputProps;

export default function CustomInput<T extends FieldValues>({
  control,
  name,
  ...props
}: CustomInputProps<T>) {
  const theme = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {props.label}
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {props.icon && (
              <Feather
                name={props.icon}
                size={20}
                color={theme.colors.text}
                style={styles.inputIcon}
              />
            )}
            <TextInput
              {...props}
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (props.onChangeText) {
                  props.onChangeText(text);
                }
              }}
              onBlur={onBlur}
              placeholderTextColor={`${theme.colors.text}80`}
              style={[
                styles.input,
                props.style,
                {
                  borderColor: error ? "crimson" : "gray",
                  color: theme.colors.text,
                },
              ]}
            />
          </View>
          {error && (
            <View>
              <Text style={[styles.error]}>{error.message}</Text>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: "crimson",
    minHeight: 18,
  },
});
