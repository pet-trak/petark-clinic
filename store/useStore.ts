// @/store/useStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUser } from "@/lib/user";
import type { User } from "@/lib/user";

interface AuthState {
    clinic_token: string | null;
    profile: User | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setClinicToken: (clinic_token: string | null) => void;
    setProfile: (profile: User | null) => void;
    fetchProfile: () => Promise<void>;
    logout: () => void;
    clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            clinic_token: null,
            profile: null,
            isLoading: false,
            error: null,

            setClinicToken: (clinic_token) => set({ clinic_token }),
            
            setProfile: (profile) => set({ profile }),
            
            fetchProfile: async () => {
                try {
                    set({ isLoading: true, error: null });
                    const profile = await getUser();
                    set({ profile, isLoading: false });
                } catch (error) {
                    set({ 
                        error: error instanceof Error ? error.message : "Failed to fetch profile",
                        isLoading: false 
                    });
                    throw error;
                }
            },
            
            logout: () => {
                // Clear localStorage
                if (typeof window !== "undefined") {
                    localStorage.removeItem("clinic_token");
                    localStorage.removeItem("auth-storage");
                }
                // Reset store state
                set({ 
                    clinic_token: null, 
                    profile: null, 
                    isLoading: false, 
                    error: null 
                });
            },
            
            clearAuth: () => {
                set({ 
                    clinic_token: null, 
                    profile: null, 
                    error: null 
                });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({ 
                clinic_token: state.clinic_token, 
                profile: state.profile 
            }),
        }
    )
);