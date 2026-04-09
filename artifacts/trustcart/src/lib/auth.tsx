import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useGetMe, useLoginUser, useRegisterUser, useLogoutUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthUser {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const logoutMutation = useLogoutUser();

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ data: { email, password } });
    await queryClient.invalidateQueries();
  };

  const register = async (email: string, password: string, name: string) => {
    await registerMutation.mutateAsync({ data: { email, password, name } });
    await queryClient.invalidateQueries();
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    await queryClient.invalidateQueries();
  };

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isLoading,
      login,
      register,
      logout,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
