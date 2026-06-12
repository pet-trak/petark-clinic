"use client";

// components/clinic/get-visit-records.tsx

import { useEffect, useState } from "react";
import {
    getVisitRecords,
    getAdministeredBy,
    type VisitRecord,
    type VisitRecordsPage,
} from "@/lib/visit-records";
import {
    Stethoscope,
    AlertCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ExternalLink,
    SlidersHorizontal,
} from "lucide-react";

const STATUS_STYLES: Record<VisitRecord["status"], string> = {
    "in-progress": "bg-yellow-100 text-yellow-700",
    "completed":   "bg-green-100 text-green-700",
};

const PAYMENT_STYLES: Record<VisitRecord["paymentStatus"], string> = {
    unpaid:   "bg-red-100 text-red-600",
    paid:     "bg-green-100 text-green-700",
    failed:   "bg-gray-100 text-gray-500",
    refunded: "bg-blue-100 text-blue-600",
};

const STATUS_FILTERS: { label: string; value: VisitRecord["status"] | "all" }[] = [
    { label: "All",         value: "all"         },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed",   value: "completed"   },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency", currency: "NGN", maximumFractionDigits: 0,
    }).format(amount);
}

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: 9 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                </td>
            ))}
        </tr>
    );
}

const EMPTY_PAGE: VisitRecordsPage = {
    data: [], page: 1, limit: 8, total: 0, totalPages: 1, results: 0,
};

export default function GetVisitRecords() {
    const [data, setData]               = useState<VisitRecordsPage>(EMPTY_PAGE);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [page, setPage]               = useState(1);
    const [statusFilter, setStatusFilter] = useState<VisitRecord["status"] | "all">("all");
    const [refreshKey, setRefreshKey]   = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchRecords() {
            setLoading(true);
            setError(null);
            try {
                const result = await getVisitRecords({
                    page,
                    ...(statusFilter !== "all" && { status: statusFilter }),
                });
                if (!cancelled) setData(result);
            } catch {
                if (!cancelled) setError("Failed to load visit records. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchRecords();
        return () => { cancelled = true; };
    }, [page, statusFilter, refreshKey]);

    function handleStatusChange(next: VisitRecord["status"] | "all") {
        setPage(1);
        setStatusFilter(next);
    }

    const { data: visits, total, totalPages } = data;
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    // page window: show up to 5 page buttons
    const pageWindow = () => {
        const delta = 2;
        const range: number[] = [];
        for (
            let i = Math.max(1, page - delta);
            i <= Math.min(totalPages, page + delta);
            i++
        ) range.push(i);
        return range;
    };

    return (
        <section className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Visit Records</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Comprehensive list of all visits and medical activity
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status filter */}
                    <div className="relative">
                        <SlidersHorizontal size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value as VisitRecord["status"] | "all")}
                            className="appearance-none pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-colors cursor-pointer"
                        >
                            {STATUS_FILTERS.map(({ label, value }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-40 transition-colors"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

{/* Table with horizontal scroll */}
<div className="rounded-xl border border-gray-200 overflow-x-auto shadow-sm">
    <div className="min-w-200">
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-200 text-left bg-bg-clr text-xs font-semibold text-sec-clr uppercase tracking-wide">
                    <th className="px-4 py-3">Pet Name</th>
                    <th className="px-4 py-3">Breed / Species</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                            <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                            <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                        </tr>
                    ))
                ) : visits.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-4 py-14 text-center text-gray-400">
                            <Stethoscope size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No visit records found</p>
                        </td>
                    </tr>
                ) : (
                    visits.map((visit) => (
                        <tr
                            key={visit._id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                        >
                            {/* Pet Name */}
                            <td className="px-4 py-3">
                                {visit.pet ? (
                                    <div className="flex items-center gap-2">
                                        {visit.pet.photo ? (
                                            <img
                                                src={visit.pet.photo}
                                                alt={visit.pet.name}
                                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-green-50 shrink-0 flex items-center justify-center text-green-600 text-xs font-semibold border border-green-100">
                                                {visit.pet.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-800 font-medium capitalize leading-tight">{visit.pet.name}</p>
                                            <p className="text-gray-400 text-xs">Age {visit.pet.age} · {visit.pet.gender}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-gray-300 italic text-xs">Unknown</span>
                                )}
                            </td>

                            {/* Breed / Species */}
                            <td className="px-4 py-3 text-gray-600 text-xs capitalize">
                                {visit.pet ? (
                                    <span>{visit.pet.breed} / {visit.pet.species}</span>
                                ) : "—"}
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                                {formatDate(visit.createdAt)}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[visit.status]}`}>
                                    {visit.status}
                                </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                                <button className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800 transition-colors whitespace-nowrap">
                                    View Full Record
                                    <ExternalLink size={11} />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
</div>

            {/* Footer: count + pagination */}
            {!loading && (
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                        Showing {visits.length === 0 ? 0 : (page - 1) * data.limit + 1} to {Math.min(page * data.limit, total)} of {total} entries
                    </span>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={!hasPrev}
                                className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={13} />
                            </button>

                            {pageWindow().map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium border transition-colors ${
                                        p === page
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}

                            {page + 2 < totalPages && (
                                <span className="px-1 text-gray-300">...</span>
                            )}

                            {page + 2 < totalPages && (
                                <button
                                    onClick={() => setPage(totalPages)}
                                    className="w-7 h-7 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                                >
                                    {totalPages}
                                </button>
                            )}

                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasNext}
                                className="p-1.5 rounded-lg border border-gray-200 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}