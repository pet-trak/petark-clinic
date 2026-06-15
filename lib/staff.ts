import api from "@/lib/api";
import axiosError from "axios";

export type StaffRole = "vet" | "receptionist" | "clinic";
export type StaffStatus = "invited" | "active" | "inactive";

export interface Staff {
  _id: string;
  fullname: string;
  email: string;
  role: StaffRole;
  clinicId: string;
  status: StaffStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
 
export interface StaffListResponse {
  status: string;
  count: number;
  data: Staff[];
}
 
export async function getStaff(): Promise<StaffListResponse> {
  try {
    const res = await api.get<StaffListResponse>("/staff");
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch staff");
    }
    throw new Error("An unexpected error occurred while fetching staff");
  }
}
 
export interface InviteStaffPayload {
  fullname: string;
  email: string;
  role: StaffRole;
}
 
export interface InviteStaffResponse {
  status: string;
  message: string;
}
 
export async function inviteStaff(
  payload: InviteStaffPayload
): Promise<InviteStaffResponse> {
  try {
    const res = await api.post<InviteStaffResponse>(
      "/staff/invite",
      payload
    );
    return res.data;
  } catch (error) {
    if (axiosError.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to invite staff");
    }
    throw new Error("An unexpected error occurred while inviting staff");
  }
}