// app/dashboard/clinical/records/create-visit/page.tsx
// app/dashboard/clinical/records/create-visit/page.tsx
import { Metadata } from "next";
import CreateVisitWalkInCard from "@/components/clinic/create-visit-walkin-card";

export const metadata: Metadata = {
    title: "Create Visit",
    description: "Start a new visit for this patient",
};

export default function CreateVisitWalkInPage() {
    return (
        <main className="py-6">
            <CreateVisitWalkInCard />
        </main>
    );
}