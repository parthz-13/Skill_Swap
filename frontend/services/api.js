import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.254.206.179:3000/api";
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
};

export const userAPI = {
  getMe: () => api.get("/users/me"),
  updateMe: (data) => api.put("/users/me", data),
  browse: () => api.get("/users/browse"),
  getUser: (id) => api.get(`/users/${id}`),
};


export default api;
