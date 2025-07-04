import { Redirect, Stack, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useEffect } from 'react';
import Drawer from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded, signOut} = useAuth();
  const theme = useTheme();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="home" 
        options={{ 
          title: "Home", 
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="profile-setup" 
        options={{ 
          title: "Profile Setup", 
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }} 
      />
      <Drawer.Screen 
        name="my-pets" 
        options={{ 
          title: "", 
          drawerLabel: "Meus Pets",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="add-pet" 
        options={{ 
          title: "Adicionar Pet", 
          drawerLabel: "Adicionar Pet",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="add-pet-images" 
        options={{ 
          title: "Adicionar Fotos",
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }} 
      />
      <Drawer.Screen 
        name="favorites" 
        options={{ 
          title: "Favorites", 
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }} 
      />
      <Drawer.Screen 
        name="settings" 
        options={{ 
          title: "Settings", 
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="signout" 
        options={{ 
          title: "Sign Out", 
          drawerLabel: "Sign Out",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out" size={size} color={color} />
          ),
        }} 
      />
      
    </Drawer>
  );
}
