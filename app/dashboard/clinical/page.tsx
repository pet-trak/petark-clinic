import { Metadata } from "next";
import ClinicalOverview from "@/components/clinic/clinical-overview";

export const metadata: Metadata = {
    title: "Clinical Dashboard",
    description: "Manage patients, visit records, and inventory.",
};

export default function ClinicalPage() {
    return (
        <main className="px-8 py-8 space-y-10 pry-ff">
            <ClinicalOverview />
        </main>
    );
}