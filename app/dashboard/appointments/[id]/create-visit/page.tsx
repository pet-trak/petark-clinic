// app/dashboard/appointments/[id]/create-visit/page.tsx
import { Metadata } from "next";
import CreateVisitCard from "@/components/clinic/create-visit-card";

export const metadata: Metadata = {
    title: "Create Visit",
    description: "Start a new visit for this appointment",
};
export default function CreateVisitPage() {
    return (
        <main className="py-6">
            <CreateVisitCard />
        </main>
    )
}