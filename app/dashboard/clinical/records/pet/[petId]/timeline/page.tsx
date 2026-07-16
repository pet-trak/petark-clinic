// src/app/(owner)/dashboard/records/pet/[petId]/timeline/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, Heart, Loader2, Weight,
    Thermometer, Activity, Zap, FileText, ChevronDown, ChevronUp,
    Building2, User, DollarSign, AlertCircle
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { 
    getPetTimeline, 
    type TimelineVisit, 
    type PetTimelineResponse,
    type TimelineClinic,
    getUniqueClinics,
    calculateTotalSpent,
    getVisitStatusColor,
    getPaymentStatusColor
} from "@/lib/pet-timeline";

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

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);
}

const VITAL_LINES = [
    { key: "weight" as const,      label: "Weight (kg)",   color: "#10b981" },
    { key: "temp" as const,        label: "Temp (°C)",      color: "#f59e0b" },
    { key: "pulse" as const,       label: "Pulse (bpm)",    color: "#3b82f6" },
    { key: "respiration" as const, label: "Resp (brpm)",    color: "#8b5cf6" },
];

type VitalKey = typeof VITAL_LINES[number]['key'];

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
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[13px] font-bold text-slate-700">{formatDate(visit.createdAt)}</p>
                                {isLatest && (
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                        Latest
                                    </span>
                                )}
                                {/* Clinic badge */}
                                {visit.clinic && (
                                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                                        <Building2 size={9} />
                                        {visit.clinic.name}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[11px] text-slate-400 capitalize">
                                    {visit.appointmentType ?? "General visit"}
                                </p>
                                {visit.vet?.name && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <User size={10} />
                                            Dr. {visit.vet.name}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${getVisitStatusColor(visit.status)}`}>
                            {visit.status}
                        </span>
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors"
                            aria-label={expanded ? "Collapse details" : "Expand details"}
                        >
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
                        {/* SOAP notes */}
                        {visit.soap && (
                            <div className="space-y-2">
                                {visit.soap.subjective && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chief Complaint</p>
                                        <p className="text-[12px] text-slate-600">{visit.soap.subjective}</p>
                                    </div>
                                )}
                                {visit.soap.objective && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Findings</p>
                                        <p className="text-[12px] text-slate-600">{visit.soap.objective}</p>
                                    </div>
                                )}
                                {visit.soap.assessment && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment</p>
                                        <p className="text-[12px] text-slate-600">{visit.soap.assessment}</p>
                                    </div>
                                )}
                                {visit.soap.plan && (
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Treatment Plan</p>
                                        <p className="text-[12px] text-slate-600">{visit.soap.plan}</p>
                                    </div>
                                )}
                            </div>
                        )}

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

                        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                            <span className={`text-[10px] font-bold capitalize px-2.5 py-1 rounded-full border ${getPaymentStatusColor(visit.paymentStatus)}`}>
                                {visit.paymentStatus}
                            </span>
                            {visit.billing.total > 0 && (
                                <span className="text-[12px] font-extrabold text-emerald-600 flex items-center gap-1">
                                    <DollarSign size={12} />
                                    {formatCurrency(visit.billing.total)}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ClinicStatsProps {
    clinics: TimelineClinic[];
    visits: TimelineVisit[];
    totalSpent: number;
}

function ClinicStats({ clinics, visits, totalSpent }: ClinicStatsProps) {
    if (clinics.length === 0) return null;

    return (
        <div className="bg-pry-clr rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">
                Clinics Visited ({clinics.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {clinics.map((clinic) => {
                    const clinicVisits = visits.filter(v => v.clinicId === clinic._id);
                    const visitCount = clinicVisits.length;
                    const clinicTotal = clinicVisits.reduce((sum, v) => sum + (v.billing?.total || 0), 0);

                    return (
                        <div key={clinic._id || clinic.name} className="bg-slate-50 rounded-xl px-3 py-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 size={14} className="text-slate-400" />
                                <p className="text-[13px] font-semibold text-slate-700 truncate">{clinic.name}</p>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-slate-500">
                                <span>{visitCount} visit{visitCount !== 1 ? 's' : ''}</span>
                                {clinicTotal > 0 && (
                                    <span className="font-medium text-emerald-600">{formatCurrency(clinicTotal)}</span>
                                )}
                            </div>
                            {clinic.address && (
                                <p className="text-[10px] text-slate-400 mt-1 truncate">{clinic.address}</p>
                            )}
                        </div>
                    );
                })}
                <div className="bg-emerald-50 rounded-xl px-3 py-3 border border-emerald-100">
                    <p className="text-[11px] font-semibold text-emerald-700">Total Spent</p>
                    <p className="text-[15px] font-black text-emerald-600">{formatCurrency(totalSpent)}</p>
                    <p className="text-[10px] text-emerald-500">{visits.length} total visits</p>
                </div>
            </div>
        </div>
    );
}

export default function PetTimelinePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Get petId from params with fallback
    const petId = params?.petId as string || '';
    const userId = searchParams?.get("userId") || '';

    const [response, setResponse] = useState<PetTimelineResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeVitals, setActiveVitals] = useState<VitalKey[]>(["weight", "temp", "pulse", "respiration"]);

    // Fetch data directly in the effect
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            // Check if we have the required params
            if (!petId || petId === 'undefined' || petId === '') {
                if (isMounted) {
                    setLoading(false);
                    setError("Missing pet ID. Please go back and try again.");
                }
                return;
            }

            if (!userId || userId === 'undefined' || userId === '') {
                if (isMounted) {
                    setLoading(false);
                    setError("Missing user ID. Please go back and try again.");
                }
                return;
            }

            // Validate ObjectId format (24 hex characters)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(petId);
            if (!isValidObjectId) {
                if (isMounted) {
                    setLoading(false);
                    setError("Invalid pet ID format. Please go back and try again.");
                }
                return;
            }

            try {
                const data = await getPetTimeline(petId, { userId });
                if (isMounted) {
                    setResponse(data);
                    setError(null);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to load timeline";
                    if (errorMessage.includes("Invalid pet ID") || errorMessage.includes("Invalid petId")) {
                        setError("The pet ID is invalid. Please go back and try again.");
                    } else {
                        setError(errorMessage);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [petId, userId]);

    const timeline = response?.data?.timeline ?? [];
    const pet = response?.data?.pet ?? timeline[0]?.pet ?? null;
    const clinics = getUniqueClinics(timeline);
    const totalSpent = calculateTotalSpent(timeline);

    const chartData = timeline.map((v) => ({
        date: formatShortDate(v.createdAt),
        weight: v.vitals.weight,
        temp: v.vitals.temp,
        pulse: v.vitals.pulse,
        respiration: v.vitals.respiration,
    }));

    const toggleVital = (key: VitalKey) => {
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
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">Unable to Load Timeline</h2>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => {
                            setLoading(true);
                            setError(null);
                            setTimeout(() => {
                                setLoading(false);
                            }, 100);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    if (!timeline.length) return (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
            <Heart size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No visit records found for this pet</p>
            <button
                onClick={() => router.back()}
                className="mt-4 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
                Go back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-pry-clr sec-ff">

            {/* Header */}
            <header className="bg-pry-clr border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
                    aria-label="Go back"
                >
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
                            <p className="text-[12px] text-slate-400">
                                {pet.breed || "Unknown"} · {pet.species || "Unknown"} · {pet.age || "N/A"} yrs · {pet.gender || "N/A"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {timeline.length > 0 && (
                                <>
                                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">First Visit</p>
                                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                                            {formatDate(timeline[timeline.length - 1]?.createdAt)}
                                        </p>
                                    </div>
                                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Visit</p>
                                        <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                                            {formatDate(timeline[0]?.createdAt)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Clinic stats */}
                {clinics.length > 0 && (
                    <ClinicStats clinics={clinics} visits={timeline} totalSpent={totalSpent} />
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
                                            ? "border-transparent text-white"
                                            : "border-slate-100 bg-slate-50 text-slate-400"}`}
                                    style={activeVitals.includes(key) ? { backgroundColor: color } : undefined}
                                    aria-label={`Toggle ${label}`}
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
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Visit History</p>
                        {response?.data?.summary && (
                            <p className="text-[11px] text-slate-400">
                                {response.data.summary.clinics.length} clinics · {response.data.summary.totalVisits} visits
                            </p>
                        )}
                    </div>
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