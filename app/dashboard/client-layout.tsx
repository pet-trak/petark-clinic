"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useStore";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { Sidebar } from "@/components/clinic/sidebar";
import { MobileTopBar, MobileBottomNav } from "@/components/clinic/sidebar";
import { Loader2 } from "lucide-react";

function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <MobileTopBar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { clinic_token, profile, fetchProfile, isLoading } = useAuthStore();

  useEffect(() => {
    if (clinic_token && !profile && !isLoading) {
      fetchProfile().catch(console.error);
    }
  }, [clinic_token, profile, isLoading, fetchProfile]);

  if (clinic_token && !profile && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-acc-clr mx-auto" />
          <p className="mt-4 text-gray-600 pry-ff">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Layout>{children}</Layout>
    </SidebarProvider>
  );
}