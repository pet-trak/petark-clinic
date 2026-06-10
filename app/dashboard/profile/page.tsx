// app/dashboard/profile/page.tsx
import { Metadata } from "next";
import ProfilePreferences from "@/components/clinic/profile-pref";
import ProfileActions from "@/components/clinic/profile-actions";

export const metadata: Metadata = {
    title: "Profile",
    description: "Manage your profile preferences",
};

export default function ProfilePage() {
    return (
        <div className="px-8 py-8 space-y-10">
            <ProfilePreferences />
            <ProfileActions />
        </div>
    );
}