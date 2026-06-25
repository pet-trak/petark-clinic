"use client";

import { useState, useRef, useEffect } from "react";
import {
    CheckCircle, X, Stethoscope, ClipboardList,
    ChevronDown, Sparkles, AlertTriangle
} from "lucide-react";
import { completeVisit, completeVisitWithAI } from "@/lib/visit";
import type { Visit } from "@/lib/visit";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useStore";

interface CompleteVisitBtnProps {
    visit: Visit;
    onComplete: (updated: Visit) => void;
}

interface SOAPFormData {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

type Mode = "manual" | "ai";

export default function CompleteVisitBtn({ visit, onComplete }: Readonly<CompleteVisitBtnProps>) {
    const { profile } = useAuthStore();
    const isPro = profile?.subscription?.plan === "pro";

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("manual");
    const [roughNotes, setRoughNotes] = useState("");
    const [formData, setFormData] = useState<SOAPFormData>({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
    });
    const [errors, setErrors] = useState<Partial<SOAPFormData & { roughNotes: string }>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (visit.status !== "in-progress") return null;

    const validateManual = (): boolean => {
        const newErrors: Partial<SOAPFormData> = {};
        if (!formData.objective.trim())  newErrors.objective  = "Objective is required";
        if (!formData.assessment.trim()) newErrors.assessment = "Assessment is required";
        if (!formData.plan.trim())       newErrors.plan       = "Plan is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateAI = (): boolean => {
        if (!roughNotes.trim()) {
            setErrors({ roughNotes: "Rough notes are required" });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof SOAPFormData]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateManual()) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            const updated = await completeVisit(visit._id, {
                soap: {
                    subjective: formData.subjective || undefined,
                    objective:  formData.objective,
                    assessment: formData.assessment,
                    plan:       formData.plan,
                }
            });
            onComplete({ ...visit, ...updated });
            toast.success("Visit marked as completed");
            setIsOpen(false);
            setFormData({ subjective: "", objective: "", assessment: "", plan: "" });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete visit");
        } finally {
            setLoading(false);
        }
    };

    const handleAISubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAI()) return;

        try {
            setLoading(true);
            const updated = await completeVisitWithAI(visit._id, { roughNotes });
            onComplete({ ...visit, ...updated });
            toast.success("Visit completed with AI SOAP formatting ✨");
            setIsOpen(false);
            setRoughNotes("");
        } catch (err: unknown) {
            if (err && typeof err === "object" && "isUpgradeRequired" in err) {
                toast.error("This feature requires a Pro subscription. Upgrade to unlock it.");
            } else {
                toast.error(err instanceof Error ? err.message : "AI formatting failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger buttons */}
            <div className="flex items-center gap-1.5">
                {/* Manual complete */}
                <button
                    onClick={() => { setMode("manual"); setIsOpen(!isOpen); }}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                    <CheckCircle size={13} />
                    Complete Visit
                    <ChevronDown size={13} className={`transition-transform ${isOpen && mode === "manual" ? "rotate-180" : ""}`} />
                </button>

                {/* AI complete — Pro only */}
                {isPro ? (
                    <button
                        onClick={() => { setMode("ai"); setIsOpen(!isOpen); }}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-xs text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                        <Sparkles size={13} />
                        Complete with AI
                        <ChevronDown size={13} className={`transition-transform ${isOpen && mode === "ai" ? "rotate-180" : ""}`} />
                    </button>
                ) : (
                    <button
                        onClick={() => toast.info("Upgrade to Pro to use AI SOAP formatting")}
                        className="flex items-center gap-1.5 text-xs text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                        <Sparkles size={13} />
                        Complete with AI
                        <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full ml-0.5">Pro</span>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${mode === "ai" ? "bg-violet-50" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-2">
                            {mode === "ai" ? (
                                <Sparkles className="w-4 h-4 text-violet-600" />
                            ) : (
                                <ClipboardList className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-sm font-semibold text-gray-900">
                                {mode === "ai" ? "Complete with AI ✨" : "Complete Visit"}
                            </span>
                            {mode === "ai" && (
                                <span className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded-full">Pro</span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Pet info */}
                    <div className={`px-4 py-3 border-b ${mode === "ai" ? "bg-violet-50 border-violet-100" : "bg-green-50 border-green-100"}`}>
                        <div className="flex items-center gap-2">
                            <Stethoscope className={`w-4 h-4 ${mode === "ai" ? "text-violet-600" : "text-green-600"}`} />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {visit.pet?.name || "Unknown Pet"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {visit.pet?.breed || "Unknown"} • {visit.pet?.species || "Unknown"} • {visit.pet?.age || "N/A"} yrs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Manual form ── */}
                    {mode === "manual" && (
                        <form onSubmit={handleManualSubmit} className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    S — Subjective <span className="font-normal text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    name="subjective"
                                    value={formData.subjective}
                                    onChange={handleInputChange}
                                    placeholder="Chief complaint, patient history, symptoms reported by owner..."
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    O — Objective <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="objective"
                                    value={formData.objective}
                                    onChange={handleInputChange}
                                    placeholder="Clinical findings, vitals, examination results..."
                                    rows={2}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none ${
                                        errors.objective ? "border-red-300 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                                {errors.objective && <p className="text-xs text-red-500 mt-1">{errors.objective}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    A — Assessment <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="assessment"
                                    value={formData.assessment}
                                    onChange={handleInputChange}
                                    placeholder="Diagnosis, differential diagnoses, clinical impressions..."
                                    rows={2}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none ${
                                        errors.assessment ? "border-red-300 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                                {errors.assessment && <p className="text-xs text-red-500 mt-1">{errors.assessment}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    P — Plan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleInputChange}
                                    placeholder="Treatment plan, medications, follow-up schedule..."
                                    rows={2}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow resize-none ${
                                        errors.plan ? "border-red-300 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                                {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan}</p>}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    {loading ? "Completing..." : <><CheckCircle size={13} /> Complete Visit</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ── AI form ── */}
                    {mode === "ai" && (
                        <form onSubmit={handleAISubmit} className="p-4 space-y-4">
                            {/* AI info banner */}
                            <div className="flex items-start gap-2 p-3 bg-violet-50 border border-violet-100 rounded-lg">
                                <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-violet-700">
                                    Type your rough clinical notes below. AI will structure them into a professional SOAP note automatically.
                                </p>
                            </div>

                            {/* Chief complaint context */}
                            {visit.soap?.subjective && (
                                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Chief Complaint (from visit)</p>
                                    <p className="text-xs text-gray-700">{visit.soap.subjective}</p>
                                </div>
                            )}

                            {/* Rough notes */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Rough Notes <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={roughNotes}
                                    onChange={(e) => {
                                        setRoughNotes(e.target.value);
                                        if (errors.roughNotes) setErrors({});
                                    }}
                                    placeholder="e.g. swelling around knee, pain on palpation, no fracture found, likely soft tissue injury, prescribe meloxicam, rest 2 weeks, return if no improvement..."
                                    rows={5}
                                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow resize-none ${
                                        errors.roughNotes ? "border-red-300 bg-red-50" : "border-gray-200"
                                    }`}
                                />
                                {errors.roughNotes && <p className="text-xs text-red-500 mt-1">{errors.roughNotes}</p>}
                                <p className="text-xs text-gray-400 mt-1">
                                    Just type what you found — AI handles the structure.
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    Review the AI-generated SOAP notes after completion. AI may not capture all clinical nuances.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-1.5">
                                            <Sparkles size={13} className="animate-pulse" />
                                            AI is formatting...
                                        </span>
                                    ) : (
                                        <><Sparkles size={13} /> Complete with AI</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}