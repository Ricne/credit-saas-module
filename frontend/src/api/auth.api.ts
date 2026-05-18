import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const response = await apiClient.post<AuthResponse>("/auth/register", payload);
    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<AuthResponse>("/auth/login", payload);
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};