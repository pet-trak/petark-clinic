// app/dashboard/appointments/[id]/page.tsx

import { Metadata } from "next";
import AppointmentDetails from "@/components/clinic/appointment-details";

export const metadata: Metadata = {
    title: "Appointment Details",
    description: "View details of your appointment",
};

export default function AppointmentDetailsPage() {
    return (
        <main>
            <AppointmentDetails />
        </main>
    )
}