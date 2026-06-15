import { Metadata } from "next";
import StaffsClient from "@/components/clinic/staffs-client";

export const metadata: Metadata = {
  title: "Staff | PetArk",
  description: "Manage team members for this store",
};

export default function StaffsPage() {
  return <StaffsClient />;
}