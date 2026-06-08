import axios from "axios";

export const API_BASE_URL = "/api/";
export const SANCTUM_CSRF_URL = "/sanctum/csrf-cookie";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_KEY = "mcc_auth_token";

/** Attach (or clear) a Bearer token on every apiClient request. */
export function setAuthToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

// Restore token if the user navigates between /register → /2fa-setup
const storedToken = sessionStorage.getItem(TOKEN_KEY);
if (storedToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

