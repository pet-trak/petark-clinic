// components/clinic/complete-visit-btn.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, X, FileText, Stethoscope, ClipboardList, ChevronDown } from "lucide-react";
import { completeVisit } from "@/lib/visit";
import type { Visit } from "@/lib/visit";
import { toast } from "sonner";

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

export default function CompleteVisitBtn({ visit, onComplete }: Readonly<CompleteVisitBtnProps>) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<SOAPFormData>({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
    });
    const [errors, setErrors] = useState<Partial<SOAPFormData>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Move useEffect before any conditional returns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Now we can have conditional returns after all hooks
    if (visit.status !== "in-progress") return null;

    const validateForm = (): boolean => {
        const newErrors: Partial<SOAPFormData> = {};
        
        if (!formData.objective.trim()) {
            newErrors.objective = "Objective is required";
        }
        if (!formData.assessment.trim()) {
            newErrors.assessment = "Assessment is required";
        }
        if (!formData.plan.trim()) {
            newErrors.plan = "Plan is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof SOAPFormData]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            
            const payload = {
                soap: {
                    subjective: formData.subjective || undefined,
                    objective: formData.objective,
                    assessment: formData.assessment,
                    plan: formData.plan,
                }
            };
            
            const updated = await completeVisit(visit._id, payload);
            onComplete({ ...visit, ...updated });
            toast.success("Visit marked as completed");
            setIsOpen(false);
            setFormData({
                subjective: "",
                objective: "",
                assessment: "",
                plan: "",
            });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to complete visit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
                <CheckCircle size={13} />
                Complete Visit
                <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-gray-900">Complete Visit</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Pet info */}
                    <div className="px-4 py-3 bg-green-50 border-b border-green-100">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-green-600" />
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                        {/* Subjective (Optional) */}
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

                        {/* Objective (Required) */}
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
                            {errors.objective && (
                                <p className="text-xs text-red-500 mt-1">{errors.objective}</p>
                            )}
                        </div>

                        {/* Assessment (Required) */}
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
                            {errors.assessment && (
                                <p className="text-xs text-red-500 mt-1">{errors.assessment}</p>
                            )}
                        </div>

                        {/* Plan (Required) */}
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
                            {errors.plan && (
                                <p className="text-xs text-red-500 mt-1">{errors.plan}</p>
                            )}
                        </div>

                        {/* Actions */}
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
                                {loading ? (
                                    "Completing..."
                                ) : (
                                    <>
                                        <CheckCircle size={13} />
                                        Complete Visit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}