import { Metadata } from "next";
import AccountCard from "@/components/clinic/account-card";

export const metadata: Metadata = {
    title: "Account Settings",
    description: "Manage your account settings and preferences.",
};

export default function AccountPage() {
    return (
        <main className="max-w-5xl mx-auto py-8 px-4 space-y-6 pry-ff">
            <div>
                <h1 className="text-2xl font-bold text-sec-clr">Account Settings</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Manage your payout details and billing preferences.
                </p>
            </div>
            <AccountCard />
        </main>
    );
}