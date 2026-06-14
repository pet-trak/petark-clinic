// components/clinic/account-card.tsx

"use client";

import { useEffect, useState } from "react";
import { getUserSubaccount } from "@/lib/payment";
import type { SubaccountStatus } from "@/lib/payment";
import BankDetails from "./bank-details";
import BankForm from "./bank-form";
import {
    AlertCircle,
    Loader2,
    Landmark,
    Plus,
    X,
    Banknote,
} from "lucide-react";

export default function AccountCard() {
    const [status, setStatus] = useState<SubaccountStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchStatus() {
            setLoading(true);
            setError(null);
            try {
                const data = await getUserSubaccount();
                if (!cancelled) setStatus(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Failed to load account info");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchStatus();
        return () => { cancelled = true; };
    }, [refetchTrigger]);

    function handleCreated() {
        setModalOpen(false);
        setRefetchTrigger((n) => n + 1);
    }

    return (
        <>
            <div className="bg-pry-clr rounded-2xl border border-gray-100 p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-bg-clr flex items-center justify-center shrink-0">
                        <Landmark size={17} className="text-acc-clr" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-sec-clr">Bank Account</h3>
                        <p className="text-xs text-gray-400">
                            {status?.has_subaccount
                                ? "Your payout account is connected"
                                : "Connect a bank account to receive payouts"}
                        </p>
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
                        <Loader2 size={15} className="animate-spin" />
                        Loading…
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle size={15} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : status?.has_subaccount && status.subaccount_code ? (
                    <BankDetails subaccount_code={status.subaccount_code} />
                ) : (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                            <Banknote size={28} className="text-gray-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-sec-clr">No bank account linked</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Add your clinic&apos;s bank account to start receiving payouts from appointments.
                            </p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 bg-acc-clr text-pry-clr text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Plus size={15} />
                            Add Bank Account
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-semibold text-sec-clr">
                                    Add Bank Account
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Your account details are secured via Paystack.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <BankForm onCreated={handleCreated} />
                    </div>
                </div>
            )}
        </>
    );
}