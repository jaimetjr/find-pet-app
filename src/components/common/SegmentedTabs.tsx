import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

type TabKey = 'profile' | 'account';

type SegmentedTabsProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  textColor: string;
  borderColor: string;
  cardColor: string;
};

export default function SegmentedTabs({ active, onChange, textColor, borderColor, cardColor }: SegmentedTabsProps) {
  return (
    <View style={[styles.tabsContainer, { borderColor }]}> 
      <TouchableOpacity
        style={[styles.tabButton, active === 'profile' && { backgroundColor: cardColor }]}
        onPress={() => onChange('profile')}
      >
        <Text style={[styles.tabText, { color: textColor }, active === 'profile' && styles.tabTextActive]}>Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, active === 'account' && { backgroundColor: cardColor }]}
        onPress={() => onChange('account')}
      >
        <Text style={[styles.tabText, { color: textColor }, active === 'account' && styles.tabTextActive]}>Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  tabTextActive: {
    opacity: 1,
  },
});


