"use client";

import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Staff } from "@/lib/staff";
import InviteStaffBtn from "./invite-staff-btn";

interface StaffListProps {
  staffList: Staff[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onInvite: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  vet: "vet",
  receptionist: "receptionist",
  clinic: "clinic",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  invited: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-500",
};

export default function StaffList({
  staffList,
  searchQuery,
  onSearchChange,
  onInvite,
}: StaffListProps) {
  const router = useRouter();

  const filtered = staffList.filter(
    (s) =>
      s.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 pry-ff">
            Staff Members
          </h2>
          <p className="text-sm text-gray-500 sec-ff">
            Total: {staffList.length} staff member{staffList.length !== 1 ? "s" : ""}
          </p>
        </div>
        <InviteStaffBtn onClick={onInvite} variant="ghost" />
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acc-clr/30 focus:border-acc-clr transition-colors sec-ff"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 pry-ff">
              {searchQuery
                ? "No staff members match your search"
                : "No staff members found for this store."}
            </p>
            {!searchQuery && (
              <p className="text-xs text-gray-400 mt-1 sec-ff">
                Invite your team to get started.
              </p>
            )}
          </div>
          {!searchQuery && (
            <InviteStaffBtn onClick={onInvite} variant="default" />
          )}
        </div>
      )}

      {/* Staff rows */}
      {filtered.length > 0 && (
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {filtered.map((staff) => (
            <div
              key={staff._id}
              onClick={() => {
                const params = new URLSearchParams({
                  fullname: staff.fullname,
                  email: staff.email,
                  role: staff.role,
                  status: staff.status,
                  isEmailVerified: String(staff.isEmailVerified),
                  createdAt: staff.createdAt,
                });
                router.push(
                  `/dashboard/profile/staffs/${staff._id}?${params.toString()}`
                );
              }}
              className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Avatar + name + email */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-acc-clr/10 flex items-center justify-center text-sm font-semibold text-acc-clr pry-ff flex-shrink-0">
                  {staff.fullname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 pry-ff">
                    {staff.fullname}
                  </p>
                  <p className="text-xs text-gray-500 sec-ff">{staff.email}</p>
                </div>
              </div>

              {/* Role + status */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 sec-ff hidden sm:block">
                  {ROLE_LABELS[staff.role] ?? staff.role}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    STATUS_STYLES[staff.status] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {staff.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}