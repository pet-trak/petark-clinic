// app/dashboard/clinical/patients/page.tsx

import { Metadata } from "next";
import PatientPageClient from "@/components/clinic/patient-page-client";

export const metadata: Metadata = {
    title: "Patient Registration",
    description: "Register new patients or search for existing ones.",
};

export default function PatientPage() {
    return (
        <main>
            <PatientPageClient />
        </main>
    )
}