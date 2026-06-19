// src/app/(owner)/dashboard/records/pet/[petId]/timeline/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, Heart, Loader2, Weight,
    Thermometer, Activity, Zap, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getPetTimeline, TimelineVisit } from "@/lib/pet-timeline";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
}

function formatShortDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric"
    });
}

const VITAL_LINES = [
    { key: "weight",      label: "Weight (kg)",   color: "#10b981" },
    { key: "temp",        label: "Temp (°C)",      color: "#f59e0b" },
    { key: "pulse",       label: "Pulse (bpm)",    color: "#3b82f6" },
    { key: "respiration", label: "Resp (brpm)",    color: "#8b5cf6" },
];

interface VisitCardProps {
    visit: TimelineVisit;
    index: number;
    total: number;
}

function VisitCard({ visit, index, total }: VisitCardProps) {
    const [expanded, setExpanded] = useState(false);
    const isLatest = index === total - 1;

    return (
        <div className={`relative pl-8 pb-6 last:pb-0`}>
            {/* Timeline spine */}
            {index < total - 1 && (
                <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-slate-100" />
            )}

            {/* Dot */}
            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isLatest ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                <span className={`w-2 h-2 rounded-full ${isLatest ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-[13px] font-bold text-slate-700">{formatDate(visit.createdAt)}</p>
                                {isLatest && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                        Latest
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                                {visit.appointmentType ?? "General visit"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full
                            ${visit.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                              visit.status === "in-progress" ? "bg-blue-50 text-blue-600" :
                              "bg-red-50 text-red-500"}`}>
                            {visit.status}
                        </span>
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            {expanded
                                ? <ChevronUp size={13} className="text-slate-500" />
                                : <ChevronDown size={13} className="text-slate-500" />}
                        </button>
                    </div>
                </div>

                {/* Vitals strip — always visible */}
                <div className="grid grid-cols-4 border-t border-slate-50">
                    {[
                        { label: "Weight", value: visit.vitals.weight, unit: "kg",   icon: <Weight size={11} /> },
                        { label: "Temp",   value: visit.vitals.temp,   unit: "°C",   icon: <Thermometer size={11} /> },
                        { label: "Pulse",  value: visit.vitals.pulse,  unit: "bpm",  icon: <Activity size={11} /> },
                        { label: "Resp",   value: visit.vitals.respiration, unit: "brpm", icon: <Zap size={11} /> },
                    ].map((v) => (
                        <div key={v.label} className="px-3 py-2.5 border-r border-slate-50 last:border-0 text-center">
                            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                                {v.icon}
                                <span className="text-[9px] font-semibold">{v.label}</span>
                            </div>
                            <p className="text-[13px] font-black text-slate-700 leading-none">
                                {v.value}
                                <span className="text-[9px] font-semibold text-slate-400 ml-0.5">{v.unit}</span>
                            </p>
                        </div>
                    ))}
                </div>

                {/* Expanded details */}
                {expanded && (
                    <div className="border-t border-slate-50 px-4 py-3 space-y-3">
                        {visit.vitals.appetite && (
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Appetite</p>
                                <p className="text-[12px] text-slate-600 capitalize">{visit.vitals.appetite}</p>
                            </div>
                        )}
                        {visit.vitals.activity && (
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity</p>
                                <p className="text-[12px] text-slate-600">{visit.vitals.activity}</p>
                            </div>
                        )}
                        {visit.notes && (
                            <div className="flex gap-2 p-3 bg-slate-50 rounded-xl">
                                <FileText size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vet Notes</p>
                                    <p className="text-[12px] text-slate-600 leading-relaxed">{visit.notes}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                            <span className={`text-[10px] font-bold capitalize px-2.5 py-1 rounded-full border
                                ${visit.paymentStatus === "paid"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                                {visit.paymentStatus}
                            </span>
                            {visit.billing.total > 0 && (
                                <span className="text-[12px] font-extrabold text-emerald-600">
                                    ₦{visit.billing.total.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PetTimelinePage() {
    const { petId } = useParams<{ petId: string }>();
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") ?? "";
    const router = useRouter();

    const [timeline, setTimeline] = useState<TimelineVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeVitals, setActiveVitals] = useState<string[]>(["weight", "temp", "pulse", "respiration"]);

    const fetchTimeline = useCallback(async () => {
        try {
            const data = await getPetTimeline(petId, userId);
            setTimeline(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load timeline");
        } finally {
            setLoading(false);
        }
    }, [petId, userId]);

useEffect(() => {
    if (!petId || !userId) return;

    let cancelled = false;

    getPetTimeline(petId, userId)
        .then((data) => {
            if (!cancelled) setTimeline(data);
        })
        .catch((err: unknown) => {
            if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load timeline");
        })
        .finally(() => {
            if (!cancelled) setLoading(false);
        });

    return () => { cancelled = true; };
}, [petId, userId]);

    const pet = timeline[0]?.pet ?? null;

    const chartData = timeline.map((v) => ({
        date: formatShortDate(v.createdAt),
        weight: v.vitals.weight,
        temp: v.vitals.temp,
        pulse: v.vitals.pulse,
        respiration: v.vitals.respiration,
    }));

    const toggleVital = (key: string) => {
        setActiveVitals(prev =>
            prev.includes(key)
                ? prev.length > 1 ? prev.filter(k => k !== key) : prev
                : [...prev, key]
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen text-red-400 text-sm">{error}</div>
    );

    return (
        <div className="min-h-screen bg-pry-clr sec-ff">

            {/* Header */}
            <header className="bg-pry-clr border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0">
                    <ArrowLeft size={14} className="text-slate-600" />
                </button>
                {pet && (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-100 shrink-0 bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                            {pet.photo
                                ? <Image src={pet.photo} alt={pet.name} width={36} height={36} className="w-full h-full object-cover" />
                                : <Heart size={14} className="text-amber-400" />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Health Timeline</p>
                            </div>
                            <h1 className="text-base font-black text-slate-800 leading-tight truncate">{pet.name}</h1>
                        </div>
                    </div>
                )}
                <div className="ml-auto flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400">{timeline.length} visit{timeline.length !== 1 ? "s" : ""}</span>
                </div>
            </header>

            <div className="px-4 sm:px-6 py-5 sm:py-7 space-y-6 max-w-6xl mx-auto">

                {/* Pet info strip */}
                {pet && (
                    <div className="bg-pry-clr rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-4 flex-wrap">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-emerald-100 shrink-0 bg-linear-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                            {pet.photo
                                ? <Image src={pet.photo} alt={pet.name} width={56} height={56} className="w-full h-full object-cover" />
                                : <Heart size={20} className="text-amber-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-black text-slate-800">{pet.name}</p>
                            <p className="text-[12px] text-slate-400">{pet.breed} · {pet.species} · {pet.age} yrs · {pet.gender}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { label: "Starting weight", value: `${timeline[0]?.vitals.weight}kg` },
                                { label: "Current weight",  value: `${timeline[timeline.length - 1]?.vitals.weight}kg` },
                            ].map(({ label, value }) => (
                                <div key={label} className="px-3 py-2 bg-slate-50 rounded-xl text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                    <p className="text-[13px] font-black text-slate-700 mt-0.5">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chart */}
                <section className="bg-pry-clr rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-6 py-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Vitals Over Time</p>
                        {/* Toggle buttons */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {VITAL_LINES.map(({ key, label, color }) => (
                                <button
                                    key={key}
                                    onClick={() => toggleVital(key)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors
                                        ${activeVitals.includes(key)
                                            ? "border-transparent text-pry-clr"
                                            : "border-slate-100 bg-slate-50 text-slate-400"}`}
                                    style={activeVitals.includes(key) ? { backgroundColor: color } : {}}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: activeVitals.includes(key) ? "white" : color }}
                                    />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {chartData.length < 2 ? (
                        <p className="text-[12px] text-slate-400 text-center py-8">Need at least 2 visits to show a trend.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 12,
                                        border: "1px solid #f1f5f9",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                                />
                                {VITAL_LINES.filter(v => activeVitals.includes(v.key)).map(({ key, label, color }) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        name={label}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: color, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </section>

                {/* Visit timeline */}
                <section>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Visit History</p>
                    <div>
                        {[...timeline].reverse().map((visit, i) => (
                            <VisitCard
                                key={visit._id}
                                visit={visit}
                                index={timeline.length - 1 - i}
                                total={timeline.length}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}