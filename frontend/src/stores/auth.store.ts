import { create } from "zustand";

import { authApi } from "../api/auth.api";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isLoading: false,
  isAuthenticated: Boolean(localStorage.getItem("access_token")),

  login: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await authApi.login(payload);

      localStorage.setItem("access_token", data.access_token);

      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });

    try {
      const data = await authApi.register(payload);

      localStorage.setItem("access_token", data.access_token);

      set({
        token: data.access_token,
        user: data.user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    set({ isLoading: true });

    try {
      const user = await authApi.me();

      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem("access_token");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));