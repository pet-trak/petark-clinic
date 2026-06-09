// src/lib/auth.ts

import api from "./api";
import { AxiosError } from "axios";

interface Address {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
}

interface RegisterData {
    clinicName: string;
    email: string;
    password: string;
    address: Address;
    phoneNumber: string;
    licenseNumber: string;
    licenseDocument: File;
    registrationCertificate: File;
    additionalDocuments?: File[];
}

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    message?: string;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}

export async function registerClinic(data: RegisterData) {
    try {
        const response = await api.post("/auth/clinic/register", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return response.data;
    }
    catch (error) {
        if (error instanceof AxiosError) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            
            if (axiosError.response) {
                console.error("Server error:", axiosError.response.status);
                console.error("Error data:", axiosError.response.data);
                
                throw {
                    status: axiosError.response.status,
                    message: axiosError.response.data?.message || axiosError.response.data?.error || "Registration failed",
                    errors: axiosError.response.data?.errors,
                };
            } 
            else if (axiosError.request) {
                console.error("No response from server:", axiosError.request);
                throw {
                    status: 0,
                    message: "Unable to connect to server. Please check your internet connection.",
                };
            }
            else {
                console.error("Error setting up request:", axiosError.message);
                throw {
                    status: 0,
                    message: axiosError.message || "An unexpected error occurred",
                };
            }
        }
        
        console.error("Non-Axios error:", error);
        throw {
            status: 500,
            message: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

export async function loginClinic(data: LoginData) {
    try {
        const response = await api.post<LoginResponse>("/auth/clinic/login", data);
        
        // Store the token in localStorage
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }
        
        return response.data;
    }
    catch (error) {
        if (error instanceof AxiosError) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            
            if (axiosError.response) {
                console.error("Server error:", axiosError.response.status);
                console.error("Error data:", axiosError.response.data);
                
                throw {
                    status: axiosError.response.status,
                    message: axiosError.response.data?.message || axiosError.response.data?.error || "Login failed",
                    errors: axiosError.response.data?.errors,
                };
            } 
            else if (axiosError.request) {
                console.error("No response from server:", axiosError.request);
                throw {
                    status: 0,
                    message: "Unable to connect to server. Please check your internet connection.",
                };
            }
            else {
                console.error("Error setting up request:", axiosError.message);
                throw {
                    status: 0,
                    message: axiosError.message || "An unexpected error occurred",
                };
            }
        }
        
        console.error("Non-Axios error:", error);
        throw {
            status: 500,
            message: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
}

// Optional: Create a logout function
export function logoutClinic() {
    localStorage.removeItem("token");
    // Optional: redirect to login page
    // window.location.href = "/login";
}

// Optional: Get current token
export function getToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}

// Optional: Check if user is logged in
export function isAuthenticated(): boolean {
    return !!getToken();
}

export function handleApiError(error: unknown): { message: string; status: number; errors?: Record<string, string[]> } {
    if (error instanceof AxiosError) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        
        if (axiosError.response) {
            return {
                status: axiosError.response.status,
                message: axiosError.response.data?.message || axiosError.response.data?.error || "Request failed",
                errors: axiosError.response.data?.errors,
            };
        } else if (axiosError.request) {
            return {
                status: 0,
                message: "Unable to connect to server. Please check your connection.",
            };
        } else {
            return {
                status: 0,
                message: axiosError.message || "Request failed",
            };
        }
    }
    
    return {
        status: 500,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
}