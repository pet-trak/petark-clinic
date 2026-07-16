// components/clinic/update-services.tsx

"use client";

import { useState } from "react";
import { updateServices, User, UpdateServicesPayload, PricingEntry } from "@/lib/user";
import { X, Loader2, Plus, Trash2, Pencil } from "lucide-react";

const DAY_OPTIONS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

interface ServiceEntry {
    name: string;
    fee: string;
}

interface UpdateServicesProps {
  profile: User;
  onSuccess: (updated: Partial<User>) => void;
}

export default function UpdateServices({ profile, onSuccess }: Readonly<UpdateServicesProps>) {
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Address
    const [street, setStreet] = useState(profile.address?.street ?? "");
    const [city, setCity] = useState(profile.address?.city ?? "");
    const [state, setState] = useState(profile.address?.state ?? "");
    const [country, setCountry] = useState(profile.address?.country ?? "");
    const [zipCode, setZipCode] = useState(profile.address?.zipCode ?? "");
    const [phone, setPhone] = useState(profile.phoneNumber ?? "");

    // Hours
    const [startingTime, setStartingTime] = useState(profile.startingTime ?? "");
    const [closingTime, setClosingTime] = useState(profile.closingTime ?? "");
    const [daysOpen, setDaysOpen] = useState<string[]>(profile.daysOpen ?? []);

    // Animals — free text, user-created
    const [animalsHandled, setAnimalsHandled] = useState<string[]>(profile.animalsHandled ?? []);
    const [newAnimal, setNewAnimal] = useState("");

    // Services — free text + fee, user-created
    const [services, setServices] = useState<ServiceEntry[]>(
        (profile.servicesProvided ?? []).map((s) => ({
            name: s.name,
            fee: String(s.price ?? ""),
        }))
    );
    const [newServiceName, setNewServiceName] = useState("");
    const [newServiceFee, setNewServiceFee] = useState("");

    // Registration fee — separate from services
    const [registrationEnabled, setRegistrationEnabled] = useState(
        profile.registration?.enabled ?? false
    );
    const [registrationFee, setRegistrationFee] = useState(
        profile.registration?.fee !== undefined ? String(profile.registration.fee) : ""
    );

    const toggleDay = (day: string) => {
        setDaysOpen((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const addAnimal = () => {
        const trimmed = newAnimal.trim().toLowerCase();
        if (!trimmed || animalsHandled.includes(trimmed)) return;
        setAnimalsHandled([...animalsHandled, trimmed]);
        setNewAnimal("");
    };

    const removeAnimal = (animal: string) => {
        setAnimalsHandled(animalsHandled.filter((a) => a !== animal));
    };

    const addService = () => {
        const trimmedName = newServiceName.trim().toLowerCase();
        const fee = Number(newServiceFee);
        if (!trimmedName || !newServiceFee || Number.isNaN(fee) || fee <= 0) {
            setError("Enter a valid service name and fee");
            return;
        }
        if (services.some((s) => s.name === trimmedName)) {
            setError(`"${trimmedName}" already added`);
            return;
        }
        setError(null);
        setServices([...services, { name: trimmedName, fee: newServiceFee }]);
        setNewServiceName("");
        setNewServiceFee("");
    };

    const removeService = (name: string) => {
        setServices(services.filter((s) => s.name !== name));
    };

const buildPayload = (): UpdateServicesPayload => {
    const payload: UpdateServicesPayload = {};

    if (street || city || state || country || zipCode) {
        payload.address = { street, city, state, country, zipCode };
    }

    if (phone) payload.phone = phone;
    if (startingTime) payload.startingTime = startingTime;
    if (closingTime) payload.closingTime = closingTime;
    if (daysOpen.length > 0) payload.daysOpen = daysOpen;
    if (animalsHandled.length > 0) payload.animalsHandled = animalsHandled;

    if (services.length > 0) {
        payload.servicesProvided = services.map((s) => s.name);
        payload.pricing = services.map(
            (s): PricingEntry => ({ type: s.name, fee: Number(s.fee) })
        );
    }

    payload.registration = {
        enabled: registrationEnabled,
        fee: registrationEnabled ? Number(registrationFee) || 0 : 0,
    };

    return payload;
};

const handleSubmit = async () => {
    setError(null);

    if (registrationEnabled && (!registrationFee || Number(registrationFee) < 0)) {
        setError("Enter a valid registration fee");
        return;
    }

    setSaving(true);
    try {
        const payload = buildPayload();
        const updatedData = await updateServices(payload);
        onSuccess(updatedData);
        setIsOpen(false);
    } catch (err) {
        setError("Failed to update. Please try again.");
        console.error(err);
    } finally {
        setSaving(false);
    }
};

    if (!isOpen) {
    return (
        <button
            onClick={() => setIsOpen(true)}
            aria-label="Edit Clinic Details"
            title="Edit Clinic Details"
            className="p-2 rounded-lg bg-acc-clr text-pry-clr hover:opacity-90 transition shrink-0"
        >
            <Pencil className="w-4 h-4" />
        </button>
    );
}

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 pry-ff mb-10">
            <div className="bg-pry-clr rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mb-10">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-sec-clr">Edit Clinic Details</h2>
                    <button onClick={() => setIsOpen(false)} disabled={saving}>
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    {/* Address */}
                    <div>
                        <h3 className="font-semibold text-sec-clr mb-3">Address & Contact</h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            <input
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="Street"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="City"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="State"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="Country"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="Zip Code"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Registration Fee — separate from Services & Pricing */}
<div>
    <h3 className="font-semibold text-sec-clr mb-3">New Patient Registration</h3>
    <p className="text-xs text-gray-500 mb-3">
        This fee is charged when staff register a new pet owner on your clinic, separate from treatment services.
    </p>
    <div className="flex items-center gap-3 mb-3">
        <button
            type="button"
            onClick={() => setRegistrationEnabled(!registrationEnabled)}
            className={`relative w-10 h-6 rounded-full transition ${
                registrationEnabled ? "bg-green-500" : "bg-gray-200"
            }`}
        >
            <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    registrationEnabled ? "translate-x-4" : ""
                }`}
            />
        </button>
        <span className="text-sm text-sec-clr">
            {registrationEnabled ? "Charging a registration fee" : "No registration fee"}
        </span>
    </div>
    {registrationEnabled && (
        <input
            type="number"
            min={0}
            value={registrationFee}
            onChange={(e) => setRegistrationFee(e.target.value)}
            placeholder="Registration fee (₦)"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full md:w-48"
        />
    )}
</div>

                    {/* Business Hours */}
                    <div>
                        <h3 className="font-semibold text-sec-clr mb-3">Business Hours</h3>
                        <div className="grid gap-3 md:grid-cols-2 mb-3">
                            <div>
                                <label className="text-xs text-gray-500">Opening Time</label>
                                <input
                                    type="time"
                                    value={startingTime}
                                    onChange={(e) => setStartingTime(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Closing Time</label>
                                <input
                                    type="time"
                                    value={closingTime}
                                    onChange={(e) => setClosingTime(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
                                />
                            </div>
                        </div>
                        <label className="text-xs text-gray-500">Days Open</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {DAY_OPTIONS.map((day) => {
                                const active = daysOpen.includes(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-1 rounded-full text-xs border transition ${
                                            active
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : "border-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Animals Handled — free text */}
                    <div>
                        <h3 className="font-semibold text-sec-clr mb-3">Animals Handled</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {animalsHandled.map((animal) => (
                                <span
                                    key={animal}
                                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700 capitalize"
                                >
                                    {animal}
                                    <button type="button" onClick={() => removeAnimal(animal)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newAnimal}
                                onChange={(e) => setNewAnimal(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAnimal())}
                                placeholder="e.g. dog"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                            />
                            <button
                                type="button"
                                onClick={addAnimal}
                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Services + Pricing — free text */}
                    <div>
                        <h3 className="font-semibold text-sec-clr mb-3">Services & Pricing</h3>
                        <div className="space-y-2 mb-3">
                            {services.map((service) => (
                                <div
                                    key={service.name}
                                    className="flex items-center gap-3 border border-gray-100 rounded-lg p-2"
                                >
                                    <span className="text-sm text-sec-clr capitalize flex-1">
                                        {service.name}
                                    </span>
                                    <span className="text-xs text-gray-400">₦{service.fee}</span>
                                    <button type="button" onClick={() => removeService(service.name)}>
                                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                placeholder="Service name"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                            />
                            <input
                                type="number"
                                min={0}
                                value={newServiceFee}
                                onChange={(e) => setNewServiceFee(e.target.value)}
                                placeholder="Fee"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28"
                            />
                            <button
                                type="button"
                                onClick={addService}
                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                        onClick={() => setIsOpen(false)}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-acc-clr text-pry-clr rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}