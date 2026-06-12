// app/dashboard/records/page.tsx

import { Metadata } from "next";
import GetVisitRecords from "@/components/clinic/get-visit-records";

export const metadata: Metadata = {
    title: "Medical Records",
    description: "Manage your medical records",
};

export default function RecordsPage() {
    return (
        <main className="px-8 py-8 space-y-10 pry-ff">
            <GetVisitRecords />
        </main>
    )
}