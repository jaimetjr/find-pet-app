import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe, register } from "@/services/authService";
import { UserDTO } from "@/dtos/user/userDto";
import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { Result } from "@/dtos/result";

export interface User {
  id?: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  notifications: boolean;
}

interface UserAuthContextType {
  userDb: User | null;
  updateUser: (user: User) => void;
  getUser: (clerkId: string) => Promise<UserDTO | null>;
  registerUser: (user: RegisterUserDTO) => Promise<Result<UserDTO>>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(
  undefined
);

interface UserAuthProviderProps {
  children: ReactNode;
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
  const [userDb, setUser] = useState<User | null>(null);

  const updateUser = (user: User) => {
    setUser((prev) => ({ ...prev, ...user }));
  };

  const getUser = async (clerkId: string) => {
    const user = await getMe(clerkId);
    return user;
  };

  const registerUser = async (user: RegisterUserDTO) : Promise<Result<UserDTO>> => {
    const result = await register(user);
    return result;
  };

  useEffect(() => {}, []);
  const value = { userDb, updateUser, getUser, registerUser };

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
