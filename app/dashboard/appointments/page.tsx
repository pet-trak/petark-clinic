// app/dashboard/appointments/page.tsx
import { Metadata } from "next";
import { AppointmentsProvider } from "@/context/appointments-context";
import AppointmentHeader from "@/components/clinic/appointment-header";
import AppointmentStats from "@/components/clinic/appointment-stats";
import GetAppointments from "@/components/clinic/get-appointments";

export const metadata: Metadata = {
    title: "Appointments",
    description: "Manage your appointments",
};

export default function AppointmentsPage() {
    return (
        <AppointmentsProvider>
            <div className="px-8 py-8 space-y-10">
                <AppointmentHeader />
                <AppointmentStats />
                <GetAppointments />
            </div>
        </AppointmentsProvider>
    );
}