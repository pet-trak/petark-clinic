// components/clinic/get-visits.tsx

"use client";

import { useEffect, useState } from "react";
import { getVisit, type Visit, getAdministeredByDisplay } from "@/lib/visit";
import Link from "next/link";
import { CalendarDays, Activity, RefreshCw, PawPrint, User, Clock } from "lucide-react";

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
        </div>
    );
}

function StatusBadge({ status }: Readonly<{ status: Visit["status"] }>) {
    const styles = {
        "in-progress": "bg-blue-50 text-blue-700 p-1 rounded-md",
        "completed": "bg-green-50 text-green-700 p-1 rounded-md",
    };

    return (
        <span className={`text-xs font-medium ${styles[status]}`}>
            {status === "in-progress" ? "IN PROGRESS" : "COMPLETED"}
        </span>
    );
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit",
        hour12: true,
    });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric", month: "long",
    });
}

export default function GetVisits() {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchVisits() {
            setLoading(true);
            setError(null);
            try {
                const data = await getVisit();
                if (!cancelled) setVisits(data);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load visits");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchVisits();
        return () => { cancelled = true; };
    }, [refreshKey]);

    if (loading) {
        return (
            <section className="space-y-4 w-full max-w-md">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-sec-clr pry-ff">Recent Visits</h2>
                    <Link href="/dashboard/records" className="text-sm text-sec-clr pry-ff cursor-pointer">
                        View All
                    </Link>
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="space-y-4 w-full max-w-md pry-ff">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-sec-clr pry-ff">Recent Visits</h2>
                    <button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        className="flex items-center gap-1.5 text-sm text-sec-clr pry-ff hover:text-sec-hover transition-colors"
                    >
                        <RefreshCw size={14} />
                        Retry
                    </button>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
                    <Activity size={32} className="mx-auto mb-2 text-red-400 opacity-40" />
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </section>
        );
    }

    if (visits.length === 0) {
        return (
            <section className="space-y-4 w-full max-w-md">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-sec-clr">Recent Visits</h2>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-12 text-center">
                    <PawPrint size={32} className="mx-auto mb-2 text-gray-400 opacity-40" />
                    <p className="text-sm text-gray-400">No visit records available</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4 w-full max-w-md">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-sec-clr">Recent Visits</h2>
                <Link href="/dashboard/records" className="text-sm text-sec-clr hover:text-sec-hover transition-colors">
                    View All
                </Link>
            </div>

            <div className="space-y-3">
                {visits.map((visit) => {
                    const pet = visit.pet;

                    return (
                        <div
                            key={visit._id}
                            className="rounded-xl border border-gray-200 bg-pry-clr p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <StatusBadge status={visit.status} />
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <CalendarDays size={12} />
                                    <span>{formatDate(visit.createdAt)}</span>
                                    <span>·</span>
                                    <Clock size={12} />
                                    <span>{formatTime(visit.createdAt)}</span>
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            {visit.soap?.subjective ? (
                                <p className="text-sm font-medium text-sec-clr mb-1 line-clamp-1">
                                    {visit.soap.subjective}
                                </p>
                            ) : (
                                <h3 className="font-semibold text-sec-clr mb-1">
                                    Veterinary Consultation
                                </h3>
                            )}

                            <p className="text-sm text-gray-600 mb-3">
                                Patient: {pet?.name || "Unknown"} ({pet?.breed || "Unknown breed"} · {pet?.species || "Unknown species"})
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User size={12} />
                                <span>Administered by {getAdministeredByDisplay(visit)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}