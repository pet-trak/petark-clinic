// app/dashboard/profile/staffs/[id]/page.tsx

import { Metadata } from "next";
import { Suspense } from "react";
import StaffDetail from "@/components/clinic/staff-detail";

export const metadata: Metadata = {
  title: "Staff Details | PetArk",
  description: "Manage team members for this store",
};

export default function StaffDetailPage({
  params,
}: Readonly<{
  params: { id: string };
}>) {
  return (
    <Suspense fallback={
      <div className="max-w-5xl px-4 py-6 space-y-4">
        <div className="h-8 w-32 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    }>
      <StaffDetail id={params.id} />
    </Suspense>
  );
}