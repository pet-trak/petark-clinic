// lib/treatment.ts

import api from "./api";
import { AxiosError } from "axios";

export type TreatmentType = "vaccination" | "medication" | "deworming" | "supplement" | "surgery" | "other";
export type TreatmentStatus = "active" | "completed" | "overdue" | "upcoming";

export interface Treatment {
    _id: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    visitId: string | null;
    type: TreatmentType;
    name: string;
    dosage: string | null;
    frequency: string | null;
    administeredAt: string;
    nextDueAt: string | null;
    notes: string | null;
    status: TreatmentStatus;
    reminderSent1Day?: boolean;
    reminderSent7Day?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TreatmentSummary {
    total: number;
    upcoming: number;
    overdue: number;
    upcomingItems: Treatment[];
    overdueItems: Treatment[];
}

export interface TreatmentTimelineResponse {
    status: string;
    results: number;
    data: {
        timeline: Treatment[];
        grouped: {
            vaccination: Treatment[];
            medication: Treatment[];
            deworming: Treatment[];
            supplement: Treatment[];
        };
        summary: TreatmentSummary;
    };
}

export interface AddTreatmentPayload {
    petId: string;
    visitId?: string;
    type: TreatmentType;
    name: string;
    dosage?: string;
    frequency?: string;
    administeredAt?: string;
    nextDueAt?: string;
    notes?: string;
}

export async function getPetTreatmentTimeline(
    petId: string,
    type?: TreatmentType
): Promise<TreatmentTimelineResponse['data']> {
    try {
        const url = type
            ? `/treatments/pet/${petId}?type=${type}`
            : `/treatments/pet/${petId}`;
        const response = await api.get<TreatmentTimelineResponse>(url);
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to fetch treatments");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function addTreatment(payload: AddTreatmentPayload): Promise<Treatment> {
    try {
        const response = await api.post<{ status: string; data: Treatment }>(
            "/treatments",
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to add treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function updateTreatment(
    treatmentId: string,
    payload: Partial<AddTreatmentPayload> & { status?: TreatmentStatus }
): Promise<Treatment> {
    try {
        const response = await api.patch<{ status: string; data: Treatment }>(
            `/treatments/${treatmentId}`,
            payload
        );
        return response.data.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to update treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}

export async function deleteTreatment(treatmentId: string): Promise<void> {
    try {
        await api.delete(`/treatments/${treatmentId}`);
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Failed to delete treatment");
        }
        throw new Error("An unexpected error occurred");
    }
}