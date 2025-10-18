import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe, register, updateProfile } from "@/services/authService";
import { UserDTO } from "@/dtos/user/userDto";
import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { UpdateUserDTO } from "@/dtos/user/updateUserDto";
import { Result } from "@/dtos/result";
import { UserApiResponse } from "@/types/api"; // Import UserApiResponse for type conversion

export interface User {
  id?: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  birthDate?: string; // ISO date string
  cpf?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  cep?: string;
  state?: string;
  city?: string;
  number?: string;
  complement?: string;
  bio?: string;
  notifications: boolean;
}

interface UserAuthContextType {
  userDb: User | null;
  updateUser: (user: Partial<User>) => void;
  getUser: (clerkId: string) => Promise<UserDTO | null>;
  registerUser: (user: RegisterUserDTO, avatar?: string) => Promise<Result<UserDTO>>;
  updateUserProfile: (user: UpdateUserDTO, avatar?: string) => Promise<Result<UserDTO>>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

interface UserAuthProviderProps {
  children: ReactNode;
}

function mapUserApiResponseToUserDTO(user: UserApiResponse): UserDTO {
  return {
    ...user,
    contactType: user.contactType ?? 0,
  } as UserDTO;
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
  const [userDb, setUser] = useState<User | null>(null);

  const updateUser = (user: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...user } : prev));
  };

  const getUser = async (clerkId: string): Promise<UserDTO | null> => {
    const user = await getMe(clerkId);
    if (!user) return null;
    return mapUserApiResponseToUserDTO(user);
  };

  const registerUser = async (user: RegisterUserDTO, avatar?: string): Promise<Result<UserDTO>> => {
    const result = await register(user, avatar);
    if (result.success && result.value) {
      return {
        ...result,
        value: mapUserApiResponseToUserDTO(result.value as any),
      };
    }
    return result as Result<UserDTO>;
  };

  const updateUserProfile = async (user: UpdateUserDTO, avatar?: string): Promise<Result<UserDTO>> => {
    const result = await updateProfile(user, avatar);
    if (result.success && result.value) {
      return {
        ...result,
        value: mapUserApiResponseToUserDTO(result.value as any),
      };
    }
    return result as Result<UserDTO>;
  };

  useEffect(() => {}, []);
  const value = { userDb, updateUser, getUser, registerUser, updateUserProfile };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};
