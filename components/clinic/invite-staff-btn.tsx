"use client";

import { UserPlus } from "lucide-react";

interface InviteStaffBtnProps {
  onClick: () => void;
  variant?: "default" | "ghost";
}

export default function InviteStaffBtn({
  onClick,
  variant = "default",
}: Readonly<InviteStaffBtnProps>) {
  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Invite Staff"
      >
        <UserPlus className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      Invite Staff
    </button>
  );
}