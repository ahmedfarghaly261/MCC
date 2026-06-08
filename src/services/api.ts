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
