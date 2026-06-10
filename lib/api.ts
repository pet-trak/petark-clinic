// lib/api.ts (or wherever your axios instance is configured)
import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add a request interceptor to add the clinic_token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("clinic_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;