// app/dashboard/profile/page.tsx
import { Metadata } from "next";
import ProfileCard from "@/components/clinic/profile-card";

export const metadata: Metadata = {
    title: "Profile Settings",
    description: "Manage your clinic profile",
};

export default function ProfilePage() {
    return <ProfileCard />;
}