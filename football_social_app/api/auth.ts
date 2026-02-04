import API from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============= SIGNUP =============
export const signupUser = async (data: {
  email: string;
  password: string;
  username: string;
  full_name: string;
  bio?: string;
  profile_pic?: string;
  position?: string;
  preferred_foot?: string;
  jersey_number?: number;
}) => {
  try {
    const res = await API.post("/auth/signup", data);
    // Backend returns access_token, not token
    if (res.data.access_token) {
      await AsyncStorage.setItem("token", res.data.access_token);
    }
    return res.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// ============= LOGIN =============
export const loginUser = async (email: string, password: string) => {
  try {
    const res = await API.post("/auth/login", {
      email,
      password,
    });
    
    // Store token from response
    if (res.data.access_token) {
      await AsyncStorage.setItem("token", res.data.access_token);
    }
    
    return res.data;
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
};

// ============= GET CURRENT USER =============
export const getMe = async () => {
  try {
    const res = await API.get("/users/me");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    throw error;
  }
};

// ============= LOGOUT =============
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("token");
    return { status: "success", message: "Logged out" };
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// ============= VERIFY TOKEN =============
export const verifyToken = async (token: string) => {
  try {
    const res = await API.post("/auth/verify", { token });
    return res.data;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
};

// ============= REFRESH TOKEN =============
export const refreshToken = async () => {
  try {
    const res = await API.post("/auth/refresh");
    if (res.data.token) {
      await AsyncStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};
