// lib/payment.ts

import api from "./api";
import axiosError from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Bank {
    name: string;
    code: string;
}

export interface ResolvedAccount {
    account_name: string;
    account_number: string;
}

export interface SubaccountStatus {
    subaccount_code: string | null;
    recipient_code: string | null;
    has_subaccount: boolean;
}

export interface SubaccountDetails {
    id: number;
    domain: string;
    subaccount_code: string;
    business_name: string;
    description: string | null;
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    percentage_charge: number;
    settlement_bank: string;
    account_number: string;
    account_name: string;
    active: boolean;
    currency: string;
    clinicName?: string;
    recipient_code: string | null;
}

export interface CreateSubaccountPayload {
    clinicName: string;
    bank_code: string;
    account_number: string;
}

export interface CreateSubaccountResponse {
    subaccount_code: string;
    recipient_code: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getBanks(): Promise<Bank[]> {
    try {
        const response = await api.get<{ status: string; data: Bank[] }>("/visit/pay/banks");
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch banks");
        }
        throw new Error("An unexpected error occurred while fetching banks");
    }
}

export async function resolveAccount(
    account_number: string,
    bank_code: string
): Promise<ResolvedAccount> {
    try {
        const response = await api.get<{ status: boolean; data: ResolvedAccount }>(
            "/visit/pay/resolve-account",
            { params: { account_number, bank_code } }
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to resolve account");
        }
        throw new Error("An unexpected error occurred while resolving account");
    }
}

export async function createSubaccount(
    payload: CreateSubaccountPayload
): Promise<CreateSubaccountResponse> {
    try {
        const response = await api.post<{ status: boolean; data: CreateSubaccountResponse }>(
            "/visit/pay/create-subaccount",
            payload
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to create subaccount");
        }
        throw new Error("An unexpected error occurred while creating subaccount");
    }
}

export async function getUserSubaccount(): Promise<SubaccountStatus> {
    try {
        const response = await api.get<{ status: boolean; data: SubaccountStatus }>(
            "/visit/pay/subaccount"
        );
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch subaccount");
        }
        throw new Error("An unexpected error occurred while fetching subaccount");
    }
}

export async function getSubaccountByCode(subaccount_code: string): Promise<SubaccountDetails> {
    try {
        const response = await api.get<{ status: boolean; data: SubaccountDetails }>(
            `/visit/pay/subaccount/${subaccount_code}`
        );
        // console.log("getSubaccountByCode raw:", response.data);
        return response.data.data;
    } catch (error) {
        if (axiosError.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Failed to fetch subaccount details");
        }
        throw new Error("An unexpected error occurred while fetching subaccount details");
    }
}