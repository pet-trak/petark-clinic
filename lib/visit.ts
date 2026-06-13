// lib/visit.ts

import api from "./api";
import axiosError from "axios";
import { type AppointmentType } from "@/lib/appointment-types";

interface Vitals {
    weight: number;      // in kg
    temp: number;        // in °C
    pulse: number;       // in bpm
    respiration: number; // in breaths per minute
    appetite: string;
    activity: string;
}

interface Billing {
    professionalFee: number;
    vat: number;
    total: number;
}

interface Pet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string; // in kg
    gender: "male" | "female";
    photo?: string;
}

interface Vet {
    _id: string;
    name?: string;
}

interface ApiVisitResponse {
    _id: string;
    appointmentId: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    status: "in-progress" | "completed";
    vitals: Vitals;
    appointmentType?: AppointmentType;
    notes?: string;
    billing: Billing;
    paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
    createdAt: string;
    completedAt: string | null;
    pet: Pet;
    vet?: Vet;
}

export interface Visit extends ApiVisitResponse {
    administeredBy: string;
}

interface GetVisitResponse {
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
    data: ApiVisitResponse[];
}

export interface CreateVisitPayload {
    appointmentId: string;
    petId: string;
    vetId?: string;
    appointmentType?: AppointmentType;
    vitals: Vitals;
    notes?: string;
}

interface CreateVisitResponse {
    status: string;
    data: {
        visit: ApiVisitResponse;
    };
}

export interface UpdateVisitVitalsPayload {
    vitals?: Partial<Vitals>;
    appointmentType?: AppointmentType;
    notes?: string;
}

interface UpdateVisitVitalsResponse {
    status: string;
    data: {
        visit: ApiVisitResponse;
    };
}

export async function createVisit(payload: CreateVisitPayload): Promise<ApiVisitResponse> {
    try {
        const response = await api.post<CreateVisitResponse>("/visit", payload);
        return response.data.data.visit;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to create visit");
        }
        throw new Error("An unexpected error occurred while creating visit");
    }
}

export async function updateVisitVitals(
    visitId: string,
    payload: UpdateVisitVitalsPayload
): Promise<ApiVisitResponse> {
    try {
        const response = await api.patch<UpdateVisitVitalsResponse>(
            `/visit/vitals/${visitId}`,
            payload
        );
        return response.data.data.visit;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to update visit");
        }
        throw new Error("An unexpected error occurred while updating visit");
    }
}

export async function getVisit(): Promise<Visit[]> {
    try {
        const response = await api.get<GetVisitResponse>("/visit/clinic");

        const visits: Visit[] = response.data.data.map((visit: ApiVisitResponse) => ({
            ...visit,
            administeredBy: visit.vetId ? "Vet" : "Clinic",
        }));

        return visits;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch visit");
        }
        throw new Error("An unexpected error occurred while fetching visit");
    }
}

export function getAdministeredByDisplay(visit: Visit): string {
    if (visit.vetId && visit.vet?.name) {
        return `Dr. ${visit.vet.name}`;
    }
    if (visit.vetId) {
        return "Veterinarian";
    }
    return "Clinic Staff";
}