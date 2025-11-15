import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type ConnectedProvidersProps = {
  isProviderLinked: (provider: 'google' | 'apple' | 'facebook') => boolean;
  linkProvider: (strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook') => Promise<void> | void;
  unlinkProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<void> | void;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  isLoading?: boolean;
};

export default function ConnectedProviders({ isProviderLinked, linkProvider, unlinkProvider, textColor, borderColor, primaryColor, isLoading }: ConnectedProvidersProps) {
  const rows: Array<{ label: string; icon: any; provider: 'google' | 'apple' | 'facebook'; strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook'; }> = [
    { label: 'Google', icon: 'logo-google', provider: 'google', strategy: 'oauth_google' },
    { label: 'Apple', icon: 'logo-apple', provider: 'apple', strategy: 'oauth_apple' },
    { label: 'Facebook', icon: 'logo-facebook', provider: 'facebook', strategy: 'oauth_facebook' },
  ];

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>Contas conectadas</Text>
      {rows.map((row) => (
        <View key={row.provider} style={[styles.accountRow, { borderColor }]}>
          <View style={styles.accountInfo}>
            <Ionicons name={row.icon as any} size={20} color={textColor} />
            <Text style={[styles.accountText, { color: textColor }]}>{row.label}</Text>
          </View>
          {isProviderLinked(row.provider) ? (
            <TouchableOpacity style={styles.unlinkButton} onPress={() => unlinkProvider(row.provider)} disabled={isLoading}>
              <Text style={styles.unlinkButtonText}>Desvincular</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.linkButton, { backgroundColor: primaryColor }]} onPress={() => linkProvider(row.strategy)} disabled={isLoading}>
              <Text style={styles.linkButtonText}>Vincular</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
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
  infoText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    opacity: 0.7,
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


