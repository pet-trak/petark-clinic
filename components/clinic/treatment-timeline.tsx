// components/clinic/treatment-timeline.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useStore";
import {
    getPetTreatmentTimeline,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    type Treatment,
    type TreatmentType,
    type AddTreatmentPayload,
} from "@/lib/treatment";
import {
    Syringe, Pill, Shield, Leaf, Plus, Lock, Sparkles,
    Loader2, AlertTriangle, CheckCircle, Clock, X,
    ChevronDown, Trash2, FolderPlus
} from "lucide-react";
import { toast } from "sonner";

interface TreatmentTimelineProps {
    petId: string;
    visitId?: string;
}

const TYPE_CONFIG: Record<TreatmentType, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
}> = {
    vaccination: {
        label: "Vaccination",
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-100",
        icon: <Syringe size={14} />,
    },
    medication: {
        label: "Medication",
        color: "text-violet-700",
        bg: "bg-violet-50",
        border: "border-violet-100",
        icon: <Pill size={14} />,
    },
    deworming: {
        label: "Deworming",
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-100",
        icon: <Shield size={14} />,
    },
    supplement: {
        label: "Supplement",
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-100",
        icon: <Leaf size={14} />,
    },
    surgery: {
        label: "Surgery",
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-100",
        icon: <Sparkles size={14} />,
    },
    other: {
        label: "Other",
        color: "text-gray-700",
        bg: "bg-gray-50",
        border: "border-gray-100",
        icon: <FolderPlus size={14} />,
    }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active:    { label: "Active",    color: "text-blue-600 bg-blue-50",   icon: <Clock size={11} /> },
    upcoming:  { label: "Upcoming",  color: "text-amber-600 bg-amber-50", icon: <Clock size={11} /> },
    overdue:   { label: "Overdue",   color: "text-red-600 bg-red-50",     icon: <AlertTriangle size={11} /> },
    completed: { label: "Completed", color: "text-green-600 bg-green-50", icon: <CheckCircle size={11} /> },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

function getDaysUntil(iso: string): string {
    const diff = new Date(iso).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days}d`;
}

interface AddTreatmentFormProps {
    petId: string;
    visitId?: string;
    onAdded: (t: Treatment) => void;
    onCancel: () => void;
}

function AddTreatmentForm({ petId, visitId, onAdded, onCancel }: AddTreatmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<AddTreatmentPayload>({
        petId,
        visitId,
        type: "vaccination",
        name: "",
        dosage: "",
        frequency: "",
        administeredAt: new Date().toISOString().split("T")[0],
        nextDueAt: "",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Treatment name is required");
            return;
        }

        try {
            setLoading(true);
            const payload: AddTreatmentPayload = {
                petId: form.petId,
                type: form.type,
                name: form.name,
                ...(visitId && { visitId }),
                ...(form.dosage && { dosage: form.dosage }),
                ...(form.frequency && { frequency: form.frequency }),
                ...(form.administeredAt && { administeredAt: form.administeredAt }),
                ...(form.nextDueAt && { nextDueAt: form.nextDueAt }),
                ...(form.notes && { notes: form.notes }),
            };
            const added = await addTreatment(payload);
            onAdded(added);
            toast.success("Treatment added successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add treatment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Add Treatment</p>
                <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-200 rounded-lg">
                    <X size={14} className="text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <div className="relative">
                        <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value as TreatmentType }))}
                            className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr bg-white pr-7"
                        >
                            <option value="vaccination">Vaccination</option>
                            <option value="medication">Medication</option>
                            <option value="deworming">Deworming</option>
                            <option value="supplement">Supplement</option>
                            <option value="surgery">Surgery</option>
                            <option value="other">Others</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Rabies Vaccine"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Dosage */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Dosage</label>
                    <input
                        type="text"
                        value={form.dosage}
                        onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                        placeholder="e.g. 1ml"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Frequency */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                    <input
                        type="text"
                        value={form.frequency}
                        onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                        placeholder="e.g. Annually"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Administered At */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Administered</label>
                    <input
                        type="date"
                        value={form.administeredAt}
                        onChange={e => setForm(f => ({ ...f, administeredAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>

                {/* Next Due */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Next Due</label>
                    <input
                        type="date"
                        value={form.nextDueAt}
                        onChange={e => setForm(f => ({ ...f, nextDueAt: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr"
                    />
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr resize-none"
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-acc-clr hover:opacity-90 disabled:opacity-60 rounded-lg transition-colors"
                >
                    {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                    Add Treatment
                </button>
            </div>
        </form>
    );
}

interface TreatmentCardProps {
    treatment: Treatment;
    onUpdate: (t: Treatment) => void;
    onDelete: (id: string) => void;
}

function TreatmentCard({ treatment, onUpdate, onDelete }: Readonly<TreatmentCardProps>) {
    const [deleting, setDeleting] = useState(false);
    const [marking, setMarking] = useState(false);
    const config = TYPE_CONFIG[treatment.type];
    const statusConfig = STATUS_CONFIG[treatment.status] || STATUS_CONFIG.active;

    const handleMarkComplete = async () => {
        try {
            setMarking(true);
            const updated = await updateTreatment(treatment._id, { status: "completed" });
            onUpdate(updated);
            toast.success("Marked as completed");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setMarking(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this treatment record?")) return;
        try {
            setDeleting(true);
            await deleteTreatment(treatment._id);
            onDelete(treatment._id);
            toast.success("Treatment deleted");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <div>
                        <p className={`text-sm font-semibold ${config.color}`}>{treatment.name}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-wide">Administered</p>
                    <p className="font-medium mt-0.5">{formatDate(treatment.administeredAt)}</p>
                </div>
                {treatment.nextDueAt && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Next Due</p>
                        <p className={`font-medium mt-0.5 ${treatment.status === "overdue" ? "text-red-600" : ""}`}>
                            {formatDate(treatment.nextDueAt)}
                            <span className="text-[10px] text-gray-400 ml-1">
                                ({getDaysUntil(treatment.nextDueAt)})
                            </span>
                        </p>
                    </div>
                )}
                {treatment.dosage && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Dosage</p>
                        <p className="font-medium mt-0.5">{treatment.dosage}</p>
                    </div>
                )}
                {treatment.frequency && (
                    <div>
                        <p className="text-gray-400 text-[10px] uppercase tracking-wide">Frequency</p>
                        <p className="font-medium mt-0.5">{treatment.frequency}</p>
                    </div>
                )}
            </div>

            {treatment.notes && (
                <p className="mt-2 text-xs text-gray-500 italic">{treatment.notes}</p>
            )}

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/50">
                {treatment.status !== "completed" && (
                    <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="flex items-center gap-1 text-[11px] font-medium text-green-700 hover:text-green-800 transition-colors"
                    >
                        {marking ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                        Mark Complete
                    </button>
                )}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1 text-[11px] font-medium text-red-500 hover:text-red-700 transition-colors ml-auto"
                >
                    {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function TreatmentTimeline({ petId, visitId }: Readonly<TreatmentTimelineProps>) {
    const { profile } = useAuthStore();
    const isPro = profile?.subscription?.plan === "pro";

    const [timeline, setTimeline] = useState<Treatment[]>([]);
    const [summary, setSummary] = useState<{ upcoming: number; overdue: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [activeFilter, setActiveFilter] = useState<TreatmentType | "all">("all");

    useEffect(() => {
        if (!isPro || !petId) return;

        async function fetch() {
            setLoading(true);
            setError(null);
            try {
                const data = await getPetTreatmentTimeline(petId);
                setTimeline(data.timeline);
                setSummary({
                    upcoming: data.summary.upcoming,
                    overdue: data.summary.overdue,
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load treatments");
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, [petId, isPro]);

    const handleAdded = (t: Treatment) => {
        setTimeline(prev => [t, ...prev]);
        setShowAdd(false);
    };

    const handleUpdate = (updated: Treatment) => {
        setTimeline(prev => prev.map(t => t._id === updated._id ? updated : t));
    };

    const handleDelete = (id: string) => {
        setTimeline(prev => prev.filter(t => t._id !== id));
    };

    const filtered = activeFilter === "all"
        ? timeline
        : timeline.filter(t => t.type === activeFilter);

    // ── Free plan ─────────────────────────────────────────────────
    if (!isPro) {
        return (
            <div className="bg-pry-clr rounded-xl border border-violet-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Syringe className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                    <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">Pro</span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-3">
                        <Lock className="w-5 h-5 text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Track Vaccinations & Medications</p>
                    <p className="text-xs text-gray-400 max-w-xs mb-4">
                        Log treatments, set due dates, and get automatic reminders when vaccinations or medications are due.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium">
                        <Sparkles size={13} />
                        Available on Pro plan
                    </div>
                </div>
            </div>
        );
    }

    // ── Loading ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Syringe className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-pry-clr rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-violet-500" />
                <h3 className="font-semibold text-sec-clr">Vaccination & Medication Timeline</h3>
                <span className="text-[10px] font-semibold bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-auto">
                    Pro ✦
                </span>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-1 text-xs font-medium text-acc-clr hover:opacity-80 transition-opacity"
                >
                    <Plus size={13} />
                    Add
                </button>
            </div>

            {/* Summary pills */}
            {summary && (summary.overdue > 0 || summary.upcoming > 0) && (
                <div className="flex items-center gap-2 flex-wrap">
                    {summary.overdue > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            <AlertTriangle size={11} />
                            {summary.overdue} overdue
                        </span>
                    )}
                    {summary.upcoming > 0 && (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                            <Clock size={11} />
                            {summary.upcoming} upcoming
                        </span>
                    )}
                </div>
            )}

            {/* Add form */}
            {showAdd && (
                <AddTreatmentForm
                    petId={petId}
                    visitId={visitId}
                    onAdded={handleAdded}
                    onCancel={() => setShowAdd(false)}
                />
            )}

            {/* Filter tabs */}
            {timeline.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {(["all", "vaccination", "medication", "deworming", "supplement", "surgery", "other"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors capitalize ${
                                activeFilter === f
                                    ? "bg-sec-clr text-white border-sec-clr"
                                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Empty state */}
            {!error && filtered.length === 0 && !showAdd && (
                <div className="text-center py-8">
                    <Syringe size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-400">No treatments recorded yet</p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="mt-3 text-xs text-acc-clr font-medium hover:opacity-80"
                    >
                        Add the first treatment
                    </button>
                </div>
            )}

            {/* Treatment cards */}
            <div className="space-y-3">
                {filtered.map(treatment => (
                    <TreatmentCard
                        key={treatment._id}
                        treatment={treatment}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}