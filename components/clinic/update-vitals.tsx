// components/clinic/update-vitals.tsx

"use client";

import { useState } from "react";
import { updateVisitVitals } from "@/lib/visit";
import type { Visit, UpdateVisitVitalsPayload } from "@/lib/visit";
import { APPOINTMENT_TYPE_LABELS } from "@/lib/appointment-types";
import type { AppointmentType } from "@/lib/appointment-types";
import { AlertCircle, Loader2, X, Check } from "lucide-react";

interface UpdateVitalsProps {
    visit: Visit;
    onSaved: (updated: Visit) => void;
    onCancel: () => void;
}

interface FormState {
    weight: string;
    temp: string;
    pulse: string;
    respiration: string;
    appetite: string;
    activity: string;
    appointmentType: string;
    notes: string;
}

function initForm(visit: Visit): FormState {
    return {
        weight: String(visit.vitals?.weight ?? ""),
        temp: String(visit.vitals?.temp ?? ""),
        pulse: String(visit.vitals?.pulse ?? ""),
        respiration: String(visit.vitals?.respiration ?? ""),
        appetite: visit.vitals?.appetite ?? "",
        activity: visit.vitals?.activity ?? "",
        appointmentType: visit.appointmentType ?? "",
        notes: visit.notes ?? "",
    };
}

const inputCls =
    "w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent";

export default function UpdateVitals({ visit, onSaved, onCancel }: UpdateVitalsProps) {
    const [form, setForm] = useState<FormState>(() => initForm(visit));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSave() {
        setSaving(true);
        setError(null);

        const payload: UpdateVisitVitalsPayload = {};

        const hasVitalsChange =
            form.weight !== String(visit.vitals?.weight ?? "") ||
            form.temp !== String(visit.vitals?.temp ?? "") ||
            form.pulse !== String(visit.vitals?.pulse ?? "") ||
            form.respiration !== String(visit.vitals?.respiration ?? "") ||
            form.appetite !== (visit.vitals?.appetite ?? "") ||
            form.activity !== (visit.vitals?.activity ?? "");

        if (hasVitalsChange) {
            payload.vitals = {
                weight: parseFloat(form.weight),
                temp: parseFloat(form.temp),
                pulse: parseFloat(form.pulse),
                respiration: parseFloat(form.respiration),
                appetite: form.appetite,
                activity: form.activity,
            };
        }

        if (form.appointmentType && form.appointmentType !== visit.appointmentType) {
            payload.appointmentType = form.appointmentType as AppointmentType;
        }

        if (form.notes !== (visit.notes ?? "")) {
            payload.notes = form.notes;
        }

        try {
            const updated = await updateVisitVitals(visit._id, payload);
            onSaved({ ...visit, ...updated });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm">
                <p className="text-sm font-medium text-sec-clr">Editing visit record</p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={13} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 text-xs text-white bg-acc-clr hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Check size={13} />
                        )}
                        {saving ? "Saving…" : "Save changes"}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Vitals */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Vitals</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.weight}
                            onChange={(e) => handleChange("weight", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Temperature (°C)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.temp}
                            onChange={(e) => handleChange("temp", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Heart Rate (bpm)
                        </label>
                        <input
                            type="number"
                            value={form.pulse}
                            onChange={(e) => handleChange("pulse", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Respiration (/min)
                        </label>
                        <input
                            type="number"
                            value={form.respiration}
                            onChange={(e) => handleChange("respiration", e.target.value)}
                            className={inputCls}
                        />
                    </div>
                </div>
            </div>

            {/* Clinical Assessment */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Clinical Assessment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Activity Level
                        </label>
                        <select
                            value={form.activity}
                            onChange={(e) => handleChange("activity", e.target.value)}
                            className={inputCls}
                        >
                            <option value="">— select —</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                            Appetite
                        </label>
                        <select
                            value={form.appetite}
                            onChange={(e) => handleChange("appetite", e.target.value)}
                            className={inputCls}
                        >
                            <option value="">— select —</option>
                            <option value="poor">Poor</option>
                            <option value="fair">Fair</option>
                            <option value="good">Good</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Visit Info */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Visit Information</h3>
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">
                        Service Type
                    </label>
                    <select
                        value={form.appointmentType}
                        onChange={(e) => handleChange("appointmentType", e.target.value)}
                        className={inputCls}
                    >
                        <option value="">— select —</option>
                        {Object.entries(APPOINTMENT_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-sec-clr mb-4">Clinical Notes</h3>
                <textarea
                    rows={5}
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Add clinical notes…"
                    className={`${inputCls} resize-none`}
                />
            </div>
        </div>
    );
}