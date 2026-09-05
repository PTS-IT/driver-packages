import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "daily.authToken";

const baseURL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:4000";

export const api = axios.create({ baseURL, timeout: 30000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function setAuthToken(token: string | null) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
