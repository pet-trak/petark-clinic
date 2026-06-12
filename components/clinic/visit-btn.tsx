"use client";

// components/clinic/visit-btn.tsx

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { type Appointment } from "@/lib/appointment";

interface VisitBtnProps {
    appointmentId: string;
    status: Appointment["status"];
}

const VISIT_ACTION_LABELS: Partial<Record<VisitBtnProps["status"], { label: string; className: string }>> = {
    pending:   { label: "Awaiting confirmation", className: "text-yellow-600" },
    completed: { label: "Visit closed",          className: "text-blue-500"   },
    cancelled: { label: "Cancelled",             className: "text-red-400"    },
};

export default function VisitBtn({ appointmentId, status }: Readonly<VisitBtnProps>) {
    const [loading, setLoading] = useState(false);

    if (status !== "confirmed") {
        const fallback = VISIT_ACTION_LABELS[status];
        return fallback
            ? <span className={`text-xs italic ${fallback.className}`}>{fallback.label}</span>
            : null;
    }

    async function handleCreateVisit() {
        setLoading(true);
        try {
            // TODO: wire up to your create visit API call
            console.log("Creating visit for appointment:", appointmentId);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleCreateVisit}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
            {loading ? "Creating..." : "Create Visit"}
        </button>
    );
}