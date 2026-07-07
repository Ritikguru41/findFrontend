import axios from "axios";
import toast from "react-hot-toast";

// Read API URL from Vite environment
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

console.log("✅ API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// Request Interceptor
// =========================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("findseat_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// Response Interceptor
// =========================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error("API Error:", error);

    if (error.code === "ECONNABORTED") {
      toast.error("Server timeout. Please try again.");
    }

    if (!error.response) {
      toast.error("Cannot connect to the server.");
      return Promise.reject(error);
    }

    switch (error.response.status) {
      case 400:
        toast.error(error.response.data?.message || "Bad Request");
        break;

      case 401:
        localStorage.removeItem("findseat_token");
        localStorage.removeItem("findseat_user");

        toast.error("Session expired. Please login again.");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);

        break;

      case 403:
        toast.error("Access Denied");
        break;

      case 404:
        toast.error("API Not Found");
        break;

      case 429:
        toast.error("Too many requests. Please wait.");
        break;

      case 500:
        toast.error("Internal Server Error");
        break;

      default:
        toast.error(error.response.data?.message || "Something went wrong");
    }

    return Promise.reject(error);
  }
);

export default api;
