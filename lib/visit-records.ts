// lib/visit-records.ts

import api from "./api";
import axiosError from "axios";

export interface VisitRecordPet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    weight: string;
    gender: "male" | "female";
    photo?: string;
}

export interface VisitRecordVet {
    _id: string;
    name?: string;
    fullname?: string;
    email?: string;
}

export interface VisitRecordVitals {
    weight: number;
    temp: number;
    pulse: number;
    respiration: number;
    appetite: string;
    activity: string;
}

export interface VisitRecordBilling {
    professionalFee: number;
    vat: number;
    total: number;
}

export interface VisitRecord {
    _id: string;
    appointmentId: string;
    petId: string;
    userId: string;
    clinicId: string;
    vetId: string | null;
    status: "in-progress" | "completed";
    vitals: VisitRecordVitals;
    notes?: string;
    billing: VisitRecordBilling;
    paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
    createdAt: string;
    completedAt: string | null;
    pet?: VisitRecordPet;
    vet?: VisitRecordVet;
}

export interface VisitRecordsPage {
    data: VisitRecord[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
}

interface VisitRecordsResponse {
    status: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    results: number;
    data: VisitRecord[];
}

export interface GetVisitRecordsParams {
    page?: number;
    status?: VisitRecord["status"];
}

export async function getVisitRecords(params: GetVisitRecordsParams = {}): Promise<VisitRecordsPage> {
    try {
        const query: Record<string, string> = {};
        if (params.page != null)   query.page   = String(params.page);
        if (params.status != null) query.status = params.status;

        const response = await api.get<VisitRecordsResponse>("/visit/clinic", { params: query });
        const { data, page, limit, total, totalPages, results } = response.data;
        return { data, page, limit, total, totalPages, results };
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch visit records");
        }
        throw new Error("An unexpected error occurred while fetching visit records");
    }
}

export function getAdministeredBy(visit: VisitRecord): string {
    if (visit.vet?.fullname) return visit.vet.fullname;
    if (visit.vet?.name)     return `Dr. ${visit.vet.name}`;
    if (visit.vetId)         return "Veterinarian";
    return "Clinic Staff";
}