import { Shield } from "lucide-react";

const PERMISSION_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "Clinic Management",
    keys: [
      "all_permissions",
      "manage_clinic",
      "manage_staff",
      "assign_roles",
      "view_reports",
      "manage_finances",
      "manage_services",
      "manage_notifications",
      "view_all_patients",
      "view_all_visits",
      "view_own_clinic_data",
    ],
  },
  {
    label: "Appointments & Check-in",
    keys: ["manage_appointments", "checkin_patients"],
  },
  {
    label: "Visit Lifecycle",
    keys: ["create_visit", "edit_visit", "delete_visit"],
  },
  {
    label: "Clinical Actions",
    keys: [
      "record_vitals",
      "add_diagnosis",
      "prescribe_medication",
      "create_treatment_plan",
      "create_followup",
    ],
  },
  {
    label: "Patient Info",
    keys: [
      "view_patients",
      "view_pet_history",
      "view_basic_pet_info",
      "record_basic_info",
    ],
  },
  {
    label: "Billing",
    keys: ["generate_invoice", "confirm_payment"],
  },
];

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  clinic: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-400" },
  vet: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  receptionist: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
};

function formatPermission(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface RoleCardProps {
  roleKey: string;
  label: string;
  permissions: string[];
}

export default function RoleCard({ roleKey, label, permissions }: Readonly<RoleCardProps>) {
  const color = ROLE_COLORS[roleKey] ?? {
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-400",
  };
  const permSet = new Set(permissions);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Role header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div
          className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}
        >
          <Shield className={`w-4 h-4 ${color.text}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 pry-ff">{label}</p>
          <p className="text-xs text-gray-400 sec-ff">
            {permissions.length} permission{permissions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${color.bg} ${color.text}`}
        >
          {roleKey}
        </span>
      </div>

      {/* Permission groups */}
      <div className="divide-y divide-gray-50">
        {PERMISSION_GROUPS.map((group) => {
          const groupPerms = group.keys.filter((k) => permSet.has(k));
          if (groupPerms.length === 0) return null;

          return (
            <div key={group.label} className="px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide sec-ff">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {groupPerms.map((perm) => (
                  <span
                    key={perm}
                    className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full sec-ff"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
                    {formatPermission(perm)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}