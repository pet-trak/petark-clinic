// lib/user.ts

import api from "@/lib/api";
import { AxiosError } from "axios";

interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
}

interface Vet {
    _id: string; 
    fullname: string;
    email: string;
    role: string;
    clinicId: string;
    status: string;
    isEmailVerified: boolean;
}

export interface User {
    id: string;
    clinicName: string;
    email: string;
    phoneNumber: string;
    address: Address;
    additionalDocuments: string[];
    servicesProvided: string[];
    animalsHandled: string[];
    status: string;
    startingTime: string;
    closingTime: string;
    daysOpen: string[];
    vets: Vet[];
}

export async function getUser(): Promise<User> {
    try {
        const response = await api.get("/clinic/profile");
        const clinicData = response.data.data.clinic;
        return clinicData;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error fetching user profile:", error.response?.data || error.message);
        } else {
            console.error("Error fetching user profile:", error);
        }
        throw error;
    }
}