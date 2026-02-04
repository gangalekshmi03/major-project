import React, { createContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loginUser, getMe } from "../api/auth";
import { router } from "expo-router";

export type User = {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const data = await loginUser(email, password);
      
      if (data.access_token) {
        await AsyncStorage.setItem("token", data.access_token);
      }

      // Create user object from login response
      const userData = {
        id: data.user_id,
        email: email,
        username: data.username,
        full_name: data.name,
      };
      
      setUser(userData);
      
      // Attempt to get full user details, but don't fail if it doesn't work
      try {
        const meResponse = await getMe();
        if (meResponse.user) {
          setUser({
            id: meResponse.user._id || data.user_id,
            email: meResponse.user.email || email,
            username: meResponse.user.username,
            full_name: meResponse.user.full_name,
          });
        }
      } catch (err) {
        console.log("Could not fetch full user details, but login successful");
      }
      
      // Redirect to home
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUser(null);
      setError(null);
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (token) {
          try {
            const meResponse = await getMe();
            if (meResponse.user) {
              setUser({
                id: meResponse.user._id,
                email: meResponse.user.email,
                username: meResponse.user.username,
                full_name: meResponse.user.full_name,
              });
            }
          } catch (err) {
            // Token might be expired, clear it
            await AsyncStorage.removeItem("token");
            setUser(null);
          }
        }
      } catch (err) {
        console.log("Auth load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
