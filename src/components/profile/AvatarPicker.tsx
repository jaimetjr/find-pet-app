import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type AvatarPickerProps = {
  avatar: string | null;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRemove: () => void;
  placeholderBg: string;
  primaryColor: string;
  iconColor: string;
};

export default function AvatarPicker({ avatar, onPickImage, onTakePhoto, onRemove, placeholderBg, primaryColor, iconColor }: AvatarPickerProps) {
  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: placeholderBg }]}>
            <Ionicons name="person" size={40} color={iconColor} />
          </View>
        )}

        <View style={styles.avatarActions}>
          <TouchableOpacity onPress={onPickImage} style={[styles.avatarActionButton, { backgroundColor: primaryColor }]}>
            <Ionicons name="images" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onTakePhoto} style={[styles.avatarActionButton, { backgroundColor: primaryColor }]}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
          {!!avatar && (
            <TouchableOpacity onPress={onRemove} style={[styles.avatarActionButton, { backgroundColor: '#ff4757' }]}>
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});


