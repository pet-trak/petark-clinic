"use client";

// components/clinic/appointment-stats.tsx

import { useEffect, useState } from "react";
import {
    Users,
    CalendarDays,
    FileText,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

import {
    getAppointmentStats,
    type AppointmentStats,
} from "@/lib/appointment";

import { useAppointmentsContext } from "@/context/appointments-context";

const EMPTY_STATS: AppointmentStats = {
    today: 0,
    thisWeek: 0,
    weekChange: 0,
    pending: 0,
    pendingPct: 0,
    total: 0,
};

function SkeletonCard() {
    return (
        <div className="flex items-center gap-4 rounded-xl bg-white border border-gray-100 px-6 py-5 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-gray-100" />
            <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-100 rounded" />
                <div className="h-7 w-20 bg-gray-100 rounded" />
            </div>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: number;
    trend: number;
}

function StatCard({
    icon,
    iconBg,
    label,
    value,
    trend,
}: Readonly<StatCardProps>) {
    const isPositive = trend >= 0;

    return (
        <div className="flex items-center gap-4 rounded-xl bg-pry-clr border border-gray-100 px-6 py-8 shadow-sm pry-ff">
            {/* Icon */}
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
            >
                {icon}
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-wide text-gray-500">
                    {label}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {value.toLocaleString()}
                    </span>
                    <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                            isPositive ? "text-green-600" : "text-red-500"
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp size={13} />
                        ) : (
                            <TrendingDown size={13} />
                        )}
                        {Math.abs(trend)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function AppointmentStats() {
    const [stats, setStats] = useState<AppointmentStats>(EMPTY_STATS);
    const [loading, setLoading] = useState(true);
    const { setStats: setCtxStats } = useAppointmentsContext();

    useEffect(() => {
        let cancelled = false;
        
        async function fetchStats() {
            setLoading(true);
            try {
                const data = await getAppointmentStats();
                if (!cancelled) {
                    setStats(data);
                    setCtxStats(data);
                }
            } catch {
                // fallback to empty stats
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchStats();
        return () => {
            cancelled = true;
        };
    }, [setCtxStats]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
                icon={<Users size={20} className="text-green-600" />}
                iconBg="bg-green-100"
                label="TOTAL PATIENTS"
                value={stats.total}
                trend={stats.weekChange}
            />
            <StatCard
                icon={<CalendarDays size={20} className="text-blue-600" />}
                iconBg="bg-blue-100"
                label="APPOINTMENTS TODAY"
                value={stats.today}
                trend={stats.weekChange}
            />
            <StatCard
                icon={<FileText size={20} className="text-orange-600" />}
                iconBg="bg-orange-100"
                label="PENDING RECORDS"
                value={stats.pending}
                trend={stats.pendingPct}
            />
        </div>
    );
}