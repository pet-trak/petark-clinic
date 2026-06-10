import { Metadata } from "next";
import SupportCard from "@/components/clinic/support-card";

export const metadata: Metadata = {
    title: "Support",
    description: "Get help from our team"
};

export default function SupportPage() {
    return (
        <main className="px-8 py-8 space-y-10">
            <SupportCard />
        </main>
    )
}