"use client";

import { useEffect, useState } from "react";
import { getVisit, getAdministeredByDisplay } from "@/lib/visit";
import type { Visit } from "@/lib/visit";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/appointment-types";
import {
    AlertCircle,
    Loader2,
    Stethoscope,
    Heart,
    Thermometer,
    Activity,
    Scale,
    Calendar,
    Clock,
    User,
    PawPrint,
    Syringe,
    Pill,
    FileText,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

interface RecordDetailsProps {
    visitId: string;
}

// Skeleton loading component
function RecordDetailsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Pet Profile Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-3">
                        <div className="h-7 bg-gray-200 rounded-lg w-48" />
                        <div className="h-4 bg-gray-200 rounded w-64" />
                        <div className="flex gap-4 mt-2">
                            <div className="h-6 bg-gray-200 rounded-full w-24" />
                            <div className="h-6 bg-gray-200 rounded-full w-28" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20" />
                            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        </div>
                        <div className="mt-3 h-8 bg-gray-200 rounded w-24" />
                        <div className="mt-2 h-3 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>

            {/* Two Column Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-4 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getTrendIcon(value?: number) {
    if (!value) return null;
    if (value > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
    return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

export default function RecordDetails({ visitId }: RecordDetailsProps) {
    const [visit, setVisit] = useState<Visit | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVisitRecord() {
            if (!visitId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                const visits = await getVisit();
                const foundVisit = visits.find((v) => v._id === visitId);
                
                if (foundVisit) {
                    setVisit(foundVisit);
                } else {
                    setError("Visit record not found");
                }
            } catch (err) {
                setError("Failed to load visit record details");
                console.error("Error fetching visit:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchVisitRecord();
    }, [visitId]);

    if (loading) {
        return <RecordDetailsSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (!visit) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Stethoscope size={56} className="mx-auto mb-3 opacity-20" />
                <p className="text-gray-400">No visit record found</p>
            </div>
        );
    }

    const vitals = visit.vitals;
    const appetiteWidth = vitals?.appetite === "good" ? "90%" : vitals?.appetite === "fair" ? "60%" : "30%";

    return (
        <div className="space-y-6">
            {/* Pet Profile Header */}
            {visit.pet && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                        {visit.pet.photo ? (
                            <img
                                src={visit.pet.photo}
                                alt={visit.pet.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center">
                                <PawPrint className="w-8 h-8 text-pry-clr" />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h2 className="text-2xl font-bold text-sec-clr capitalize">{visit.pet.name}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    visit.status === "completed" 
                                        ? "bg-green-100 text-acc-clr" 
                                        : "bg-yellow-100 text-yellow-700"
                                }`}>
                                    {visit.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-3">
                                {visit.pet.breed} • {visit.pet.gender === "male" ? "Male" : "Female"} • {visit.pet.age} years
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <Calendar size={12} />
                                    <span>Patient since {new Date(visit.createdAt).getFullYear()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                    <User size={12} />
                                    <span>{getAdministeredByDisplay(visit)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards - Vitals Summary */}
            {vitals && (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Weight</span>
                            <Scale className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitals.weight} <span className="text-sm font-normal text-gray-400">kg</span></p>
                        <p className="text-xs text-gray-400 mt-1">Current measurement</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Heart Rate</span>
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitals.pulse} <span className="text-sm font-normal text-gray-400">bpm</span></p>
                        <p className="text-xs text-gray-400 mt-1">Resting rate</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Temperature</span>
                            <Thermometer className="w-4 h-4 text-orange-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitals.temp} <span className="text-sm font-normal text-gray-400">°C</span></p>
                        <p className="text-xs text-gray-400 mt-1">Normal: 38-39°C</p>
                    </div>

                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Respiration</span>
                            <Activity className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{vitals.respiration} <span className="text-sm font-normal text-gray-400">/min</span></p>
                        <p className="text-xs text-gray-400 mt-1">Breaths per minute</p>
                    </div>
                </div>
            )}

            {/* Two Column Layout for Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visit Information */}
                <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">Visit Information</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Visit ID</span>
                            <span className="text-sm font-mono text-gray-700">{visit._id.slice(-8)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Date & Time</span>
                            <span className="text-sm text-gray-700">
                                {new Date(visit.createdAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Time</span>
                            <span className="text-sm text-gray-700">
                                {new Date(visit.createdAt).toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        {visit.appointmentType && (
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Service Type</span>
                                <span className="text-sm text-gray-700">
                                    {APPOINTMENT_TYPE_LABELS[visit.appointmentType] || visit.appointmentType}
                                </span>
                            </div>
                        )}
                        {visit.completedAt && (
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-500">Completed</span>
                                <span className="text-sm text-acc-clr flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    {new Date(visit.completedAt).toLocaleDateString("en-GB")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Information */}
                {visit.billing && (
                    <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-900">Payment Details</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Professional Fee</span>
                                <span className="text-sm text-gray-700">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                    }).format(visit.billing.professionalFee)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">VAT (7.5%)</span>
                                <span className="text-sm text-gray-700">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                    }).format(visit.billing.vat)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 pt-2">
                                <span className="text-sm font-semibold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                    }).format(visit.billing.total)}
                                </span>
                            </div>
                            <div className="mt-3 pt-2">
                                <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                    visit.paymentStatus === "paid" 
                                        ? "bg-green-50" 
                                        : visit.paymentStatus === "unpaid"
                                        ? "bg-red-50"
                                        : "bg-gray-50"
                                }`}>
                                    <span className="text-sm font-medium text-gray-700">Payment Status</span>
                                    <span className={`flex items-center gap-1.5 text-sm font-medium capitalize ${
                                        visit.paymentStatus === "paid" 
                                            ? "text-green-700" 
                                            : visit.paymentStatus === "unpaid"
                                            ? "text-red-600"
                                            : "text-gray-500"
                                    }`}>
                                        {visit.paymentStatus === "paid" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {visit.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Vitals Details - Activity & Appetite */}
            {vitals && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-sec-clr">Clinical Assessment</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Activity Level</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-acc-clr rounded-full"
                                        style={{ 
                                            width: vitals.activity === "high" ? "90%" : vitals.activity === "medium" ? "60%" : "30%" 
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 capitalize">{vitals.activity}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Appetite</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: appetiteWidth }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700 capitalize">{vitals.appetite}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Section */}
            {visit.notes && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">Clinical Notes</h3>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{visit.notes}</p>
                    </div>
                </div>
            )}
        </div>
    );
}