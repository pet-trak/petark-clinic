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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc-clr text-black-clr  text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap hover:bg-acc-clr/90 hover:text-sec-clr cursor-pointer"
        >
            {loading ? "Creating..." : "Create Visit"}
        </button>
    );
}