import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://football-backend-staging.onrender.com"; // not localhost on mobile
const ANALYZER_BASE_URL = "http://192.168.1.13:5000"; // update to analyzer host/IP

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Analyzer service does not use auth by default
export const analyzerClient = axios.create({
  baseURL: ANALYZER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
