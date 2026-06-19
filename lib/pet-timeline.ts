// src/libs/api/pet-timeline.ts

import { AxiosError } from "axios";
import api from "./api";

export interface TimelineVitals {
    weight: number;
    temp: number;
    pulse: number;
    respiration: number;
    appetite?: string;
    activity?: string;
}

export interface TimelinePet {
    _id: string;
    name: string;
    species?: string;
    breed?: string;
    age?: string | number;
    weight?: string | number;
    gender?: string;
    photo?: string;
}

export interface TimelineVisit {
    _id: string;
    appointmentId: string;
    clinicId: string;
    vetId: string | null;
    status: string;
    appointmentType?: string;
    vitals: TimelineVitals;
    notes?: string;
    billing: { professionalFee: number; vat: number; total: number };
    paymentStatus: string;
    createdAt: string;
    completedAt: string | null;
    pet: TimelinePet;
}

export async function getPetTimeline(petId: string, userId: string): Promise<TimelineVisit[]> {
    try {
        const res = await api.get<{
            status: string;
            results: number;
            data: { timeline: TimelineVisit[] };
        }>(`/visit/pet/${petId}`, { params: { userId } });
        return res.data.data.timeline;
    } catch (err: unknown) {
        let msg = "Failed to fetch pet timeline";
        if (err instanceof AxiosError) {
            msg = (err.response?.data as { message?: string })?.message ?? msg;
        }
        throw new Error(msg);
    }
}