import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as Google from "expo-auth-session/providers/google";
import { AuthResponse, User, UserResponse } from "../interfaces";
import { GOOGLE_ANDROID_CLIENT_ID,GOOGLE_IOS_CLIENT_ID,GOOGLE_WEB_CLIENT_ID,GOOGLE_WEB_CLIENT_SECRET } from "@env";
import AuthService, { getAuthToken } from "../services/AuthService";
import * as Linking from "expo-linking";
import * as WebBrowser from 'expo-web-browser'
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession()

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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set up Google OAuth - COMMENTED OUT FOR NOW
  /*
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    // Define the redirect URI based on platform
    redirectUri: Platform.select({
      // For Android standalone app
      android: 'com.achandolar.app:/oauth2redirect',
      // For iOS standalone app
      ios: 'com.achandolar.app://oauth2redirect',
      // For web or Expo Go
      default: 'https://auth.expo.io/@your-expo-username/achando-lar'
    }),
    // Make sure to request the required scopes
    scopes: ['profile', 'email']
  })
  */

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true)
        const token = await getAuthToken()

        if (token) {
          // We have a token, let's validate it with the server
          try {
            const userData = await getUserDataFromToken()
            if (userData) {
              setUser(userData)
            } else {
              // If we couldn't get user data, clear the token
              await AuthService.logout()
            }
          } catch (error) {
            console.error("Error validating token:", error)
            // Token is invalid or expired, clear it
            await AuthService.logout()
          }
        }
      } catch (err) {
        console.error("Error checking login status:", err)
        setError("Failed to restore login session")
      } finally {
        setIsLoading(false)
      }
    }

    checkLoginStatus()
  }, [])

  // Handle Google Auth response - COMMENTED OUT FOR NOW
  /*
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response
      if (authentication?.idToken) {
        handleGoogleLogin(authentication.idToken)
      }
    } else if (response?.type === "error") {
      console.error("Google auth error:", response.error)
      setError(`Google login failed: ${response.error?.message || 'Unknown error'}`)
    }
  }, [response])
  */

  // Helper function to extract user data from auth response
  const processAuthResponse = (data: AuthResponse): User => {
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    }
  }

  // Helper function to process user response
  const processUserResponse = (data: UserResponse): User => {
    return {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    }
  }

  // Helper function to get user data from token using the /auth/me endpoint
  const getUserDataFromToken = async (): Promise<User | null> => {
    try {
      const response = await AuthService.getCurrentUser()

      if (response.success) {
        return processUserResponse(response)
      }

      return null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await AuthService.login({ email, password })

      if (response.success) {
        setUser(processAuthResponse(response))
      } else {
        setError("Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Register a new user
  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await AuthService.register({ name, email, password, phone })

      if (response.success) {
        setUser(processAuthResponse(response))
      } else {
        setError("Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google login with idToken - COMMENTED OUT FOR NOW
  const handleGoogleLogin = async (idToken: string) => {
    // Placeholder function for now
    console.log("Google login not implemented yet")
    setError("Google login not implemented yet")

    /* Original implementation:
    try {
      setIsLoading(true)
      setError(null)

      const response = await AuthService.googleLogin({ idToken })

      if (response.success) {
        setUser(processAuthResponse(response))
      } else {
        setError("Google login failed")
      }
    } catch (err) {
      console.error("Google login error:", err)
      setError(err instanceof Error ? err.message : "Google login failed")
    } finally {
      setIsLoading(false)
    }
    */
  }

  // Initiate Google login flow - COMMENTED OUT FOR NOW
  const googleLogin = async () => {
    // Placeholder function for now
    console.log("Google login not implemented yet")
    setError("Google login not implemented yet")

    /* Original implementation:
    try {
      setError(null)
      if (!request) {
        setError("Google OAuth is not configured properly")
        return
      }
      await promptAsync()
    } catch (err) {
      console.error("Google auth error:", err)
      setError("Failed to start Google login")
    }
    */
  }

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthService.logout()
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
      setError("Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Create the context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

