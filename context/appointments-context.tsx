"use client";

// context/appointments-context.tsx

import { createContext, useContext, useState, type ReactNode } from "react";
import { type AppointmentStats, type Appointment } from "@/lib/appointment";

interface AppointmentsContextValue {
    stats: AppointmentStats | null;
    appointments: Appointment[];
    setStats: (s: AppointmentStats) => void;
    setAppointments: (a: Appointment[]) => void;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [stats, setStats]             = useState<AppointmentStats | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    return (
        <AppointmentsContext.Provider value={{ stats, appointments, setStats, setAppointments }}>
            {children}
        </AppointmentsContext.Provider>
    );
}

export function useAppointmentsContext() {
    const ctx = useContext(AppointmentsContext);
    if (!ctx) throw new Error("useAppointmentsContext must be used within AppointmentsProvider");
    return ctx;
}