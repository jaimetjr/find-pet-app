import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdoptionRequestStatus, AdoptionRequestStatusHelper } from '@/enums/adoptionRequestStatus-enum';

interface StatusBadgeProps {
  status: AdoptionRequestStatus;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function StatusBadge({ status, size = 'medium', showIcon = true }: StatusBadgeProps) {
  const label = AdoptionRequestStatusHelper.getLabel(status);
  const color = AdoptionRequestStatusHelper.getColor(status);
  const icon = AdoptionRequestStatusHelper.getIcon(status);

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
      icon: 12,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
      icon: 16,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
      icon: 20,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, { backgroundColor: `${color}20`, borderColor: color }]}>
      {showIcon && (
        <Ionicons name={icon as any} size={currentSize.icon} color={color} style={styles.icon} />
      )}
      <Text style={[styles.text, currentSize.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
  textLarge: {
    fontSize: 15,
  },
});

