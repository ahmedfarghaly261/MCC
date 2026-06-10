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

export function setAuthToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return;
  }

  sessionStorage.removeItem(TOKEN_KEY);
  delete apiClient.defaults.headers.common["Authorization"];
}

export async function ensureCsrfCookie(): Promise<void> {
  await axios.get(SANCTUM_CSRF_URL, { withCredentials: true });
}

export async function clearAuthSession(): Promise<void> {
  setAuthToken(null);
  sessionStorage.removeItem("mcc_is_authenticated");

  try {
    await ensureCsrfCookie();
    await apiClient.post("auth/logout");
  } catch {
    // Missing logout route or no active session is acceptable before auth starts.
  } finally {
    setAuthToken(null);
  }
}

export function setAuthTokenFromResponse(value: unknown): boolean {
  const token = findAuthToken(value);
  setAuthToken(token);
  return Boolean(token);
}

function findAuthToken(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directToken =
    record["token"] ??
    record["access_token"] ??
    record["accessToken"] ??
    record["plainTextToken"];

  if (typeof directToken === "string") {
    return directToken;
  }

  for (const nestedValue of Object.values(record)) {
    const nestedToken = findAuthToken(nestedValue);
    if (nestedToken) {
      return nestedToken;
    }
  }

  return null;
}

const storedToken = sessionStorage.getItem(TOKEN_KEY);
if (storedToken) {
  apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}
