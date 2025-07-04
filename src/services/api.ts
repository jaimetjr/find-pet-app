import axios from "axios";
import { getClerkInstance } from "@clerk/clerk-expo";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
console.log("API_URL", API_URL);

export const authApi = axios.create({ baseURL: API_URL });
export const authenticatedApi = axios.create({ baseURL: API_URL });

authenticatedApi.interceptors.request.use(
  async (config) => {
    try {
      const clerk = getClerkInstance(); // ✅ correct method
      const token = await clerk.session?.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Failed to retrieve Clerk token:", error);
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default authenticatedApi;
