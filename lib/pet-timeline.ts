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

export interface TimelineClinic {
    _id?: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
}

export interface TimelineVet {
    _id?: string;
    name?: string;
    email?: string;
    specialization?: string;
}

export interface TimelineSOAP {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
}

export interface TimelineService {
    _id: string;
    name: string;
    price?: number;
}

export interface TimelineFollowUp {
    serviceId: string | null;
    serviceName: string;
    date: string | null;
    time: string | null;
    notes: string;
    createdAt: string;
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
    soap?: TimelineSOAP;
    billing: { professionalFee: number; vat: number; total: number };
    paymentStatus: string;
    servicesProvided?: string[];
    selectedServices?: TimelineService[];
    followUps?: TimelineFollowUp[];
    createdAt: string;
    completedAt: string | null;
    paidAt?: string | null;
    pet: TimelinePet;
    clinic?: TimelineClinic;
    vet?: TimelineVet;
}

export interface PetTimelineSummary {
    totalVisits: number;
    clinics: string[];
    lastVisit: string;
    firstVisit: string;
}

export interface PetTimelineResponse {
    status: string;
    results: number;
    data: {
        timeline: TimelineVisit[];
        summary?: PetTimelineSummary;
        visitsByClinic?: Array<{
            clinicId: string;
            clinicName: string;
            clinic: TimelineClinic;
            visits: TimelineVisit[];
        }>;
        clinicCount?: number;
        pet?: TimelinePet;
    };
}

export interface GetPetTimelineParams {
    userId: string;
    page?: number;
    limit?: number;
}

export async function getPetTimeline(
    petId: string, 
    params: GetPetTimelineParams
): Promise<PetTimelineResponse> {
    try {
        // Validate petId before making the request
        if (!petId || petId.trim() === '') {
            throw new Error('Pet ID is required');
        }

        // Check if petId is a valid MongoDB ObjectId (24 hex characters)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(petId);
        if (!isValidObjectId) {
            throw new Error('Invalid pet ID format');
        }

        const res = await api.get<PetTimelineResponse>(`/visit/pet/${petId}`, { 
            params: {
                userId: params.userId,
                page: params.page || 1,
                limit: params.limit || 10,
            } 
        });
        return res.data;
    } catch (err: unknown) {
        let msg = "Failed to fetch pet timeline";
        if (err instanceof AxiosError) {
            // Check if it's a 400 error with HTML response
            if (err.response?.status === 400 && typeof err.response?.data === 'string' && err.response.data.includes('Invalid petId')) {
                msg = "Invalid pet ID. Please go back and try again.";
            } else {
                msg = (err.response?.data as { message?: string })?.message ?? msg;
            }
        } else if (err instanceof Error) {
            msg = err.message;
        }
        throw new Error(msg);
    }
}

// Helper function to group visits by clinic
export function groupVisitsByClinic(visits: TimelineVisit[]): Map<string, TimelineVisit[]> {
    const grouped = new Map<string, TimelineVisit[]>();
    
    visits.forEach(visit => {
        const clinicName = visit.clinic?.name || 'Unknown Clinic';
        if (!grouped.has(clinicName)) {
            grouped.set(clinicName, []);
        }
        grouped.get(clinicName)!.push(visit);
    });
    
    return grouped;
}

// Helper function to get unique clinics from visits
export function getUniqueClinics(visits: TimelineVisit[]): TimelineClinic[] {
    const clinicMap = new Map<string, TimelineClinic>();
    
    visits.forEach(visit => {
        if (visit.clinic) {
            const key = visit.clinicId;
            if (!clinicMap.has(key)) {
                clinicMap.set(key, visit.clinic);
            }
        }
    });
    
    return Array.from(clinicMap.values());
}

// Helper function to format visit date
export function formatVisitDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Helper function to get visit status color
export function getVisitStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
        'in-progress': 'bg-yellow-100 text-yellow-700',
        'completed': 'bg-green-100 text-green-700',
        'cancelled': 'bg-red-100 text-red-700',
        'missed': 'bg-gray-100 text-gray-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-500';
}

// Helper function to get payment status color
export function getPaymentStatusColor(paymentStatus: string): string {
    const paymentColors: Record<string, string> = {
        'unpaid': 'bg-red-100 text-red-600',
        'paid': 'bg-green-100 text-green-700',
        'failed': 'bg-gray-100 text-gray-500',
        'refunded': 'bg-blue-100 text-blue-600',
    };
    return paymentColors[paymentStatus] || 'bg-gray-100 text-gray-500';
}

// Helper function to calculate total spent across all clinics
export function calculateTotalSpent(visits: TimelineVisit[]): number {
    return visits.reduce((total, visit) => total + (visit.billing?.total || 0), 0);
}

// Helper function to get visits by date range
export function getVisitsByDateRange(
    visits: TimelineVisit[], 
    startDate: Date, 
    endDate: Date
): TimelineVisit[] {
    return visits.filter(visit => {
        const visitDate = new Date(visit.createdAt);
        return visitDate >= startDate && visitDate <= endDate;
    });
}