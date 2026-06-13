"use client";

// components/clinic/visit-btn.tsx

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { type Appointment, updateAppointmentStatus } from "@/lib/appointment";

interface VisitBtnProps {
    appointmentId: string;
    status: Appointment["status"];
    hasActiveVisit?: boolean;
    onConfirmed?: () => void;
}

const VISIT_ACTION_LABELS: Partial<Record<Appointment["status"], { label: string; className: string }>> = {
    completed: { label: "Visit closed",   className: "text-blue-500"  },
    cancelled: { label: "Cancelled",      className: "text-red-400"   },
};

export default function VisitBtn({
    appointmentId,
    status,
    hasActiveVisit = false,
    onConfirmed,
}: Readonly<VisitBtnProps>) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleConfirm() {
        setLoading(true);
        try {
            await updateAppointmentStatus(appointmentId, "confirmed");
            onConfirmed?.();
        } finally {
            setLoading(false);
        }
    }

    function handleCreateVisit() {
        router.push(`/dashboard/appointments/${appointmentId}/create-visit`);
    }

    // pending → "Confirm" button
    if (status === "pending") {
        return (
            <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap hover:bg-yellow-500 cursor-pointer"
            >
                {loading ? <Loader2 size={13} className="animate-spin text-yellow-900" /> : "Confirm"}
            </button>
        );
    }

    // completed / cancelled → static label
    if (status !== "confirmed") {
        const fallback = VISIT_ACTION_LABELS[status];
        return fallback
            ? <span className={`text-xs italic ${fallback.className}`}>{fallback.label}</span>
            : null;
    }

    // confirmed but visit already exists → show in-progress label
    if (hasActiveVisit) {
        return <span className="text-xs italic text-orange-500">Visit in progress</span>;
    }

    // confirmed + no active visit → "Create Visit"
    return (
        <button
            onClick={handleCreateVisit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-pry-clr text-xs font-medium transition-colors whitespace-nowrap hover:bg-acc-clr/90 cursor-pointer"
        >
            Create Visit
        </button>
    );
}