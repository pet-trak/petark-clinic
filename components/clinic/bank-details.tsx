// components/clinic/bank-details.tsx

"use client";

import { useEffect, useState } from "react";
import { getSubaccountByCode } from "@/lib/payment";
import type { SubaccountDetails } from "@/lib/payment";
import { AlertCircle, Loader2, Building2, CreditCard, Hash, Percent, User } from "lucide-react";

interface BankDetailsProps {
    subaccount_code: string;
}

export default function BankDetails({ subaccount_code }: Readonly<BankDetailsProps>) {
    const [details, setDetails] = useState<SubaccountDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchDetails() {
            try {
                const data = await getSubaccountByCode(subaccount_code);
                // temporarily in bank-details.tsx
console.log("subaccount details:", details);
                if (!cancelled) setDetails(data);
            } catch (err) {
                if (!cancelled)
                    setError(err instanceof Error ? err.message : "Failed to load bank details");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchDetails();
        return () => { cancelled = true; };
    }, [subaccount_code]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 size={15} className="animate-spin" />
                Loading bank details…
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
            </div>
        );
    }

    if (!details) return null;

const rows = [
    {
        icon: <Building2 size={14} />,
        label: "Business Name",
        value: details.clinicName || details.business_name || "—",
    },
    { icon: <CreditCard size={14} />, label: "Bank", value: details.settlement_bank },
    { icon: <Hash size={14} />, label: "Account Number", value: details.account_number },
    {
        icon: <User size={14} />,
        label: "Account Name",
        value: details.account_name,
    },
    // {
    //     icon: <Hash size={14} />,
    //     label: "Subaccount Code",
    //     value: (
    //         <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
    //             {details.subaccount_code}
    //         </span>
    //     ),
    // },
    // {
    //     icon: <Percent size={14} />,
    //     label: "Charge",
    //     value: `${details.percentage_charge}%`,
    // },
];

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        details.active ? "bg-green-100 text-acc-clr" : "bg-gray-100 text-gray-500"
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            details.active ? "bg-acc-clr" : "bg-gray-400"
                        }`}
                    />
                    {details.active ? "Active" : "Inactive"}
                </span>
            </div>
            <div className="divide-y divide-gray-50">
                {rows.map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            {icon}
                            <span>{label}</span>
                        </div>
                        <span className="text-sm text-gray-700">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}