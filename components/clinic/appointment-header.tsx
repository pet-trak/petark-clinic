"use client";

// components/clinic/appointment-header.tsx

import { Download } from "lucide-react";
import { useAppointmentsContext } from "@/context/appointments-context";

function exportToCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function AppointmentHeader() {
    const { stats, appointments } = useAppointmentsContext();

    function handleExport() {
        const today = new Date().toLocaleDateString("en-GB");

        // --- Summary section ---
        const summaryRows = [
            ["Clinic Overview Export", today],
            [],
            ["SUMMARY"],
            ["Metric", "Value"],
            ["Appointments today",    stats?.today    ?? "—"],
            ["Patients this week",    stats?.thisWeek ?? "—"],
            ["Week change (%)",       stats?.weekChange != null ? `${stats.weekChange}%` : "—"],
            ["Pending records",       stats?.pending   ?? "—"],
            ["Pending (%)",           stats?.pendingPct != null ? `${stats.pendingPct}%` : "—"],
            [],
            ["APPOINTMENTS"],
            ["Date", "Time", "Owner", "Email", "Pet", "Breed", "Species", "Notes", "Status"],
        ];

        // --- Appointments rows ---
        const apptRows = appointments.map((a) => {
            const date  = new Date(a.date).toLocaleDateString("en-GB");
            const time  = new Date(a.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
            return [
                date,
                time,
                a.user?.fullname  ?? "—",
                a.user?.email     ?? "—",
                a.pet?.name       ?? "—",
                a.pet?.breed      ?? "—",
                a.pet?.species    ?? "—",
                `"${(a.notes ?? "").replace(/"/g, '""')}"`,  // escape quotes in notes
                a.status,
            ];
        });

        const allRows = [...summaryRows, ...apptRows];
        const csv     = allRows.map((r) => r.join(",")).join("\n");

        exportToCSV(csv, `clinic-appointments-${today.replace(/\//g, "-")}.csv`);
    }

    return (
        <section className="flex items-start md:items-center justify-between gap-4 pry-ff">
            <div>
                <h1 className="text-2xl font-bold text-sec-clr">Clinic Overview</h1>
                <p className="text-gray-400">Welcome back, here is your clinic status for today</p>
            </div>

            <div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr border border-acc-clr text-xs font-medium hover:bg-acc-clr/80 transition-colors whitespace-nowrap"
                >
                    <Download size={13} />
                    Export Data
                </button>
            </div>
        </section>
    );
}