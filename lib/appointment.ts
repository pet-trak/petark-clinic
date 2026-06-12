// lib/appointment.ts

import api from "./api";
import axiosError from "axios";

export type DateRange = "today" | "7days" | "1month" | "last_month" | "all";

export interface AppointmentPet {
    _id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    photo?: string;
}

export interface AppointmentUser {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
}

export interface Appointment {
    _id: string;
    userId: string;
    petId: string;
    clinicId: string;
    vetId: string | null;
    date: string;
    notes: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    createdAt: string;
    updatedAt: string;
    confirmedBy?: string;
    confirmedAt?: string;
    notificationsSent?: string[];
    user?: AppointmentUser;
    pet?: AppointmentPet;
}

export interface AppointmentsPage {
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
    count: number;
}

interface AppointmentsResponse {
    status: "success" | "error";
    count: number;
    total: number;
    page: number;
    totalPages: number;
    appointments: Appointment[];
}

export interface GetAppointmentsParams {
    page?: number;
    range?: DateRange;
    status?: Appointment["status"];
}

export interface AppointmentStats {
    today: number;
    thisWeek: number;
    weekChange: number;   // % change vs last week, can be negative
    pending: number;
    pendingPct: number;   // pending as % of total
    total: number;
}

export async function getAppointmentStats(): Promise<AppointmentStats> {
    try {
        const response = await api.get<{ status: string; stats: AppointmentStats }>("/appointment/stats");
        return response.data.stats;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            console.error("Error fetching appointment stats:", error.response?.data || error.message);
        } else {
            console.error("Error fetching appointment stats:", error);
        }
        throw error;
    }
}

export async function getAppointments(params: GetAppointmentsParams): Promise<AppointmentsPage> {
    try {
        const query: Record<string, string> = {};
        if (params.page != null)                          query.page   = String(params.page);
        if (params.range != null && params.range !== "all") query.range  = params.range;
        if (params.status != null)                        query.status = params.status;

        const response = await api.get<AppointmentsResponse>("/appointment/clinics", { params: query });
        const { appointments, total, page, totalPages, count } = response.data;
        return { appointments, total, page, totalPages, count };
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            console.error("Error fetching appointments:", error.response?.data || error.message);
        } else {
            console.error("Error fetching appointments:", error);
        }
        throw error;
    }
}