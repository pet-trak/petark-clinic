"use client";

// components/clinic/appointment-stats.tsx

import { useEffect, useState } from "react";
import { getAppointmentStats, type AppointmentStats } from "@/lib/appointment";
import { CalendarDays, Users, Clock, TrendingUp, TrendingDown } from "lucide-react";

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
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    sub: React.ReactNode;
}

function StatCard({ icon, label, value, sub }: StatCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wide">
                {icon}
                {label}
            </div>
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            <div className="text-xs text-gray-500">{sub}</div>
        </div>
    );
}

interface TrendBadgeProps {
    pct: number;
    positiveIsGood?: boolean;
}

function TrendBadge({ pct, positiveIsGood = true }: TrendBadgeProps) {
    const isUp = pct >= 0;
    const isGood = positiveIsGood ? isUp : !isUp;

    const colorClass = isGood
        ? "text-green-600 bg-green-50 border-green-200"
        : "text-red-600 bg-red-50 border-red-200";

    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-xs font-medium ${colorClass}`}>
            {isUp
                ? <TrendingUp size={11} />
                : <TrendingDown size={11} />
            }
            {Math.abs(pct)}%
        </span>
    );
}

export default function AppointmentStats() {
    const [stats, setStats]     = useState<AppointmentStats>(EMPTY_STATS);
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
                // stats are non-critical — fail silently, show zeros
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchStats();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                icon={<CalendarDays size={13} />}
                label="Today"
                value={stats.today}
                sub="Appointments scheduled for today"
            />
            <StatCard
                icon={<Users size={13} />}
                label="Patients this week"
                value={stats.thisWeek}
                sub={
                    <span className="flex items-center gap-1.5">
                        <TrendBadge pct={stats.weekChange} positiveIsGood={true} />
                        <span>vs last week</span>
                    </span>
                }
            />
            <StatCard
                icon={<Clock size={13} />}
                label="Pending records"
                value={stats.pending}
                sub={
                    <span className="flex items-center gap-1.5">
                        <TrendBadge pct={stats.pendingPct} positiveIsGood={false} />
                        <span>of all appointments</span>
                    </span>
                }
            />
        </div>
    );
}