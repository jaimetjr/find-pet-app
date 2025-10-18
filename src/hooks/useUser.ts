import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useRouter } from 'expo-router';
import { UserDTO } from '@/dtos/user/userDto';

type UserWithDetails = UserDTO & {
  birthDate?: string;
  cpf?: string;
  phone?: string;
  bio?: string;
  cep?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  number?: string;
  complement?: string;
  notifications?: boolean;
  avatar?: string;
  expoPushToken?: string;
};

export const useUser = () => {
  const { userId } = useAuth();
  
  const { getUser } = useUserAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [hasCheckedUser, setHasCheckedUser] = useState<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userDto = await getUser(userId);
        if (userDto) {
          setUser(userDto as UserWithDetails);
        } else {
          // Only redirect to profile setup if user doesn't exist
          router.push("/(main)/profile-setup");
        }
      } catch (error) {
        console.log('Error loading user:', error);
        // Don't redirect on error - let the user try again
      } finally {
        setIsLoading(false);
        setHasCheckedUser(true);
      }
    };

    loadUser();
  }, [userId, getUser, router]);

  return {
    user,
    isLoading,
    userId,
    hasCheckedUser,
  };
}; 