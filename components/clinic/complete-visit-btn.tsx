// components/clinic/complete-visit-btn.tsx

"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { completeVisit } from "@/lib/visit";
import type { Visit } from "@/lib/visit";
import { toast } from "sonner";

interface CompleteVisitBtnProps {
    visit: Visit;
    onComplete: (updated: Visit) => void;
}

export default function CompleteVisitBtn({ visit, onComplete }: Readonly<CompleteVisitBtnProps>) {
    const [loading, setLoading] = useState(false);

    if (visit.status !== "in-progress") return null;

    async function handleComplete() {
        try {
            setLoading(true);
            const updated = await completeVisit(visit._id);
            onComplete({ ...visit, ...updated });
            toast.success("Visit marked as completed");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete visit");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleComplete}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
            <CheckCircle size={13} />
            {loading ? "Completing..." : "Complete Visit"}
        </button>
    );
}