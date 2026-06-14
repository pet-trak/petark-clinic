// components/clinic/bank-form.tsx

"use client";

import { useEffect, useState } from "react";
import { getBanks, resolveAccount, createSubaccount } from "@/lib/payment";
import type { Bank } from "@/lib/payment";
import { AlertCircle, Loader2, ChevronDown, CheckCircle } from "lucide-react";

interface BankFormProps {
    onCreated: () => void;
}

const inputCls =
    "w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-acc-clr focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";

export default function BankForm({ onCreated }: Readonly<BankFormProps>) {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(true);

    const [clinicName, setClinicName] = useState("");
    const [bankCode, setBankCode] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const [resolving, setResolving] = useState(false);
    const [resolvedName, setResolvedName] = useState<string | null>(null);
    const [resolveError, setResolveError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchBanks() {
            try {
                const data = await getBanks();
                if (!cancelled) setBanks(data);
            } catch {
                // silently fail — select stays empty
            } finally {
                if (!cancelled) setLoadingBanks(false);
            }
        }

        fetchBanks();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (accountNumber.length !== 10 || !bankCode) return;

        let cancelled = false;

        async function doResolve() {
            setResolving(true);
            setResolvedName(null);
            setResolveError(null);

            try {
                const data = await resolveAccount(accountNumber, bankCode);
                if (!cancelled) setResolvedName(data.account_name);
            } catch (err) {
                if (!cancelled)
                    setResolveError(err instanceof Error ? err.message : "Could not verify account");
            } finally {
                if (!cancelled) setResolving(false);
            }
        }

        doResolve();
        return () => { cancelled = true; };
    }, [accountNumber, bankCode]);

    async function handleSubmit() {
        if (!clinicName || !bankCode || !accountNumber || !resolvedName) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            await createSubaccount({ clinicName, bank_code: bankCode, account_number: accountNumber });
            onCreated();
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Failed to add bank account");
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit =
        !!clinicName && !!bankCode && accountNumber.length === 10 && !!resolvedName && !submitting;

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Business Name
                </label>
                <input
                    type="text"
                    placeholder="e.g. Paws & Care Veterinary Clinic"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className={inputCls}
                />
            </div>

            <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Bank
                </label>
                <div className="relative">
                    <select
                        value={bankCode}
                        onChange={(e) => {
                            setBankCode(e.target.value);
                            setResolvedName(null);
                            setResolveError(null);
                        }}
                        disabled={loadingBanks}
                        className={`${inputCls} appearance-none pr-8`}
                    >
                        <option value="">
                            {loadingBanks ? "Loading banks…" : "— select bank —"}
                        </option>
                        {banks.map((b) => (
                            <option key={b.code} value={b.code}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Account Number
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => {
                        setAccountNumber(e.target.value.replace(/\D/g, ""));
                        setResolvedName(null);
                        setResolveError(null);
                    }}
                    className={inputCls}
                />
                {resolving && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        Verifying account…
                    </p>
                )}
                {resolvedName && !resolving && (
                    <p className="flex items-center gap-1.5 text-xs text-acc-clr mt-1.5">
                        <CheckCircle size={12} />
                        {resolvedName}
                    </p>
                )}
                {resolveError && !resolving && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5">
                        <AlertCircle size={12} />
                        {resolveError}
                    </p>
                )}
            </div>

            {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-acc-clr text-pry-clr text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {submitting ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Adding account...
                    </>
                ) : (
                    "Add Bank Account"
                )}
            </button>
        </div>
    );
}