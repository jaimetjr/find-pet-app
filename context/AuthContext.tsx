import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as Google from "expo-auth-session/providers/google";
import { AuthResponse, User, UserResponse } from "../interfaces";
import { GOOGLE_CLIENT_ID } from "@env";
import AuthService, { getAuthToken } from "../services/AuthService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '951774527965-2b6e46klmf4f5bto7kvegvt0oi8cljbm.apps.googleusercontent.com',
    clientSecret: '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',
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const token = await getAuthToken();

        if (token) {
          try {
            const userData = await getUserDataFromToken();
            if (userData) {
              setUser(userData);
            } else {
              await AuthService.logout();
            }
          } catch (error) {
            console.error("Error validating token:", error);
            await AuthService.logout();
          }
        }
      } catch (err) {
        console.error("Error checking login status:", err);
        setError("Failed to restore login session");
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleLogin(authentication.idToken);
      }
    }
  }, [response]);

  const processAuthResponse = (data: AuthResponse): User => {
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  };

  const processUserResponse = (data: UserResponse): User => {
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    };
  };

  const getUserDataFromToken = async (): Promise<User | null> => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.success) {
        return processUserResponse(response);
      }
      return null;
    } catch (error) {
      console.error("Error getting the current user: ", error);
      return null;
    }
  };

  const login = async (email : string, password : string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.login({email, password});
      if (response.success) {
        setUser(processAuthResponse(response));
      } else {
        setError('Login failed')
      }
    } catch (error) {
      console.error('Login error', error);
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const register = async (name : string, email : string, password : string, phone : string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AuthService.register({name, email, password, phone});
      if (response.success) {
        setUser(processAuthResponse(response));
      } else {
        setError("Registration failed");
      }
    } catch (error) {
      console.log("Registration error: ", error);
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async (idToken : string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.googleLogin({idToken});
      if (response.success) {
        setUser(processAuthResponse(response));
      } else {
        setError("Google login failed");
      }
    } catch (err) {
      console.error("Google login error: ", err);
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const googleLogin = async () => {
    try {
      await promptAsync();
    } catch (err) {
      console.error("Google auth error: ", err);
      setError("Failed to start Google login");
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error: ", err);
      setError("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }
  
  const value = {
    user,
    isLoading,
    isAuthenticated : !!user,
    login,
    register,
    googleLogin,
    logout,
    error
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}