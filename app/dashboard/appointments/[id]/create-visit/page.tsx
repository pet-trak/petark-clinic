"use client";

// app/dashboard/appointments/[id]/create-visit/page.tsx

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { getAppointmentById, type Appointment } from "@/lib/appointment";
import { createVisit, type CreateVisitPayload } from "@/lib/visit";
import { APPOINTMENT_TYPE_GROUPS, APPOINTMENT_TYPE_LABELS, type AppointmentType } from "@/lib/appointment-types";

const EMPTY_VITALS: CreateVisitPayload["vitals"] = {
    weight: 0,
    temp: 0,
    pulse: 0,
    respiration: 0,
    appetite: "",
    activity: "",
};

export default function CreateVisitPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loadingAppt, setLoadingAppt] = useState(true);

    const [vitals, setVitals] = useState(EMPTY_VITALS);
    const [notes, setNotes] = useState("");
    const [vetId, setVetId] = useState("");
    const [appointmentType, setAppointmentType] = useState<AppointmentType | "">("");
    const [submitting, setSubmitting] = useState(false);

    // track which numeric fields have been blurred with a bad value
    const [vitalErrors, setVitalErrors] = useState<Partial<Record<keyof CreateVisitPayload["vitals"], string>>>({});

    useEffect(() => {
        async function load() {
            try {
                const appt = await getAppointmentById(id);
                setAppointment(appt);
                setNotes(appt.notes ?? "");
            } catch {
                toast.error("Failed to load appointment.");
            } finally {
                setLoadingAppt(false);
            }
        }
        load();
    }, [id]);

    function handleVitalChange(field: keyof CreateVisitPayload["vitals"], value: string) {
        // clear error as soon as user starts correcting
        if (vitalErrors[field]) {
            setVitalErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        setVitals((prev) => ({
            ...prev,
            [field]: ["weight", "temp", "pulse", "respiration"].includes(field)
                ? parseFloat(value) || 0
                : value,
        }));
    }

    function handleVitalBlur(field: keyof CreateVisitPayload["vitals"], value: string | number) {
        const numericFields = ["weight", "temp", "pulse", "respiration"] as const;
        if (numericFields.includes(field as typeof numericFields[number])) {
            const num = typeof value === "string" ? parseFloat(value) : value;
            if (isNaN(num) || num < 0) {
                setVitalErrors((prev) => ({
                    ...prev,
                    [field]: "Value must be a positive number.",
                }));
            }
        }
    }

    async function handleSubmit() {
        if (!appointment) return;

        // guard: block submit if any numeric vital is still invalid
        const numericFields = ["weight", "temp", "pulse", "respiration"] as const;
        const newErrors: typeof vitalErrors = {};
        for (const field of numericFields) {
            if (vitals[field] < 0) {
                newErrors[field] = "Value must be a positive number.";
            }
        }
        if (Object.keys(newErrors).length > 0) {
            setVitalErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            await createVisit({
                appointmentId: appointment._id,
                petId: appointment.petId,
                ...(vetId.trim() ? { vetId: vetId.trim() } : {}),
                ...(appointmentType ? { appointmentType } : {}),
                vitals,
                notes: notes.trim() || undefined,
            });
            toast.success("Visit created successfully.");
            router.push(`/dashboard/appointments/${id}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create visit.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingAppt) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={24} className="animate-spin text-acc-clr" />
            </div>
        );
    }

    if (!appointment) return null;

    const pet = appointment.pet;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 pry-ff">

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sec-clr transition-colors"
            >
                <ArrowLeft size={15} />
                Back
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-acc-clr/10">
                    <Stethoscope size={20} className="text-acc-clr" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-sec-clr">Create Visit</h1>
                    {pet && (
                        <p className="text-sm text-gray-500 mt-0.5 capitalize">
                            {pet.name} &middot; {pet.species} &middot; {pet.breed}
                        </p>
                    )}
                </div>
            </div>

            {/* Appointment Type */}
            <section className="space-y-2">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">
                    Appointment Type <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </h2>
                <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as AppointmentType | "")}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition"
                >
                    <option value="">Select appointment type</option>
                    {APPOINTMENT_TYPE_GROUPS.map(({ label, types }) => (
                        <optgroup key={label} label={label}>
                            {types.map((type) => (
                                <option key={type} value={type}>
                                    {APPOINTMENT_TYPE_LABELS[type]}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </section>

            {/* Vitals */}
            <section className="space-y-4">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">Vitals</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Field
                        label="Weight (kg)"
                        type="number"
                        value={vitals.weight || ""}
                        onChange={(v) => handleVitalChange("weight", v)}
                        onBlur={() => handleVitalBlur("weight", vitals.weight)}
                        error={vitalErrors.weight}
                        min={0}
                    />
                    <Field
                        label="Temperature (°C)"
                        type="number"
                        value={vitals.temp || ""}
                        onChange={(v) => handleVitalChange("temp", v)}
                        onBlur={() => handleVitalBlur("temp", vitals.temp)}
                        error={vitalErrors.temp}
                        min={0}
                    />
                    <Field
                        label="Pulse (bpm)"
                        type="number"
                        value={vitals.pulse || ""}
                        onChange={(v) => handleVitalChange("pulse", v)}
                        onBlur={() => handleVitalBlur("pulse", vitals.pulse)}
                        error={vitalErrors.pulse}
                        min={0}
                    />
                    <Field
                        label="Respiration (breaths/min)"
                        type="number"
                        value={vitals.respiration || ""}
                        onChange={(v) => handleVitalChange("respiration", v)}
                        onBlur={() => handleVitalBlur("respiration", vitals.respiration)}
                        error={vitalErrors.respiration}
                        min={0}
                    />
                </div>
                <Field
                    label="Appetite"
                    value={vitals.appetite}
                    onChange={(v) => handleVitalChange("appetite", v)}
                    placeholder="e.g. appetite is normal"
                />
                <Field
                    label="Activity"
                    value={vitals.activity}
                    onChange={(v) => handleVitalChange("activity", v)}
                    placeholder="e.g. the pet has a very high fever"
                />
            </section>

            {/* Notes */}
            <section className="space-y-2">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">Notes</h2>
                <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this visit..."
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition resize-none"
                />
            </section>

            {/* Optional vet ID */}
            <section className="space-y-2">
                <h2 className="text-sm font-semibold text-sec-clr uppercase tracking-wide">
                    Vet <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </h2>
                <Field
                    label="Vet ID"
                    value={vetId}
                    onChange={setVetId}
                    placeholder="Leave blank if no vet assigned"
                />
            </section>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-gray-400 disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-acc-clr text-pry-clr text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-acc-clr/90 transition-colors"
                >
                    {submitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Visit"
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

interface FieldProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    onBlur?: () => void;
    type?: "text" | "number";
    placeholder?: string;
    min?: number;
    error?: string;
}

function Field({ label, value, onChange, onBlur, type = "text", placeholder, min, error }: Readonly<FieldProps>) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                min={min}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-acc-clr transition ${
                    error ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
            />
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}