import { API_URL, AUTH_TOKEN_KEY } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthResponse, GoogleLoginRequest, LoginRequest, RegisterRequest, UserResponse } from "../interfaces";

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  return data;
};

export const getAuthToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = async (token: string): Promise<void> => {
  return AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = async (): Promise<void> => {
  return AsyncStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return headers
}

const AuthService = {
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);
    if (data.success && data.token) {
      await setAuthToken(data.token);
    }
    return data;
  },
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleResponse(response);
    if (data.success && data.token) {
      await setAuthToken(data.token);
    }

    return data;
  },
  googleLogin: async (googleData: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(googleData),
    })

    const data = await handleResponse(response)

    if (data.success && data.token) {
      await setAuthToken(data.token)
    }

    return data
  },
  getCurrentUser: async (): Promise<UserResponse> => {
    const headers = await getAuthHeaders()
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers,
    })

    return handleResponse(response)
  },
  logout: async (): Promise<void> => {
    await removeAuthToken();
  },
  isAuthenticated: async() : Promise<boolean> => {
    const token = await getAuthToken();
    return !!token;
  }
};

export default AuthService;
