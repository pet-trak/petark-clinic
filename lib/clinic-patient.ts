// lib/clinic-patient.ts
import api from "@/lib/api";
import { AxiosError } from "axios";

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface ReferredFrom {
    clinicId?: string;
    referralId?: string;
}

export interface PatientPet {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    ageUnit?: "years" | "months";
    color?: string;
    weight?: number;
    weightUnit?: "kg" | "lbs";
    gender?: "male" | "female";
}

export interface PatientOwner {
    _id?: string;
    fullname: string;
    phoneNumber: string;
}

export interface ClinicPatientRecord {
    _id: string;
    registrationNo: string;
    registrationStatus: string;
    registrationFee?: number;
    feeWaived?: boolean;
    clinicId: string;
    pet: PatientPet;
    owner?: PatientOwner;
}

// ─── Register: covers both existing pet (petId) and new pet (raw details) ──

export interface RegisterPatientPayload {
    // Present → existing pet path. Absent → new pet path.
    petId?: string;

    // New pet path fields (required if petId is absent)
    petName?: string;
    species?: string;
    breed?: string;
    age?: string;
    ageUnit?: "years" | "months";
    color?: string;
    weight?: number;
    weightUnit?: "kg" | "lbs";
    gender?: "male" | "female";
    ownerName?: string;
    ownerPhone?: string;

    // Shared, optional either way
    feeWaived?: boolean;
    waiverReason?: string;
    referredFrom?: ReferredFrom;
}

export async function registerPatient(
    payload: RegisterPatientPayload
): Promise<ClinicPatientRecord> {
    try {
        const response = await api.post("/patients/register", payload);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error registering patient:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error registering patient:", error);
        }
        throw error;
    }
}

// ─── Search: Find existing patients by reg no / name / phone ──────────────

export interface SearchClinicPatientsResult {
    count: number;
    data: ClinicPatientRecord[];
}

export async function searchClinicPatients(
    query: string
): Promise<SearchClinicPatientsResult> {
    try {
        const response = await api.get("/patients/search", {
            params: { q: query },
        });
        return {
            count: response.data.count,
            data: response.data.data,
        };
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error searching clinic patients:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error searching clinic patients:", error);
        }
        throw error;
    }
}

// ─── Get all patients registered at this clinic (paginated) ────────────────

export interface GetAllPatientsResult {
    count: number;
    total: number;
    page: number;
    totalPages: number;
    data: ClinicPatientRecord[];
}

export async function getAllPatients(
    page: number = 1,
    limit: number = 25
): Promise<GetAllPatientsResult> {
    try {
        const response = await api.get("/patients/all", {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(
                "Error fetching patients:",
                error.response?.data || error.message
            );
        } else {
            console.error("Error fetching patients:", error);
        }
        throw error;
    }
}