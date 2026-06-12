// app/dashboard/layout.tsx
import { Metadata } from "next";
import DashboardClientLayout from "./client-layout";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "PetArk Dashboard",
};

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <DashboardClientLayout>{children}</DashboardClientLayout>;
}