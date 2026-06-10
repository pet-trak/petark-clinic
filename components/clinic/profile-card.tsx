// components/clinic/profile-card.tsx

"use client";

import { useEffect, useState } from "react";
import { getUser, User } from "@/lib/user";
import { Loader2, MapPin, Phone, Mail, Building2, Clock, PawPrint } from "lucide-react";

export default function ProfileCard() {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await getUser();
                setProfile(data);
            } catch (err) {
                setError("Failed to load profile");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-acc-clr" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="text-center text-red-600 p-4">
                {error || "Failed to load profile"}
            </div>
        );
    }

    return (
        <div className="w-full p-10">    
            
            {/* Clinic Info Card */}
            <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-acc-clr flex items-center justify-center text-pry-clr font-bold text-xl pry-ff">
                            {profile.clinicName.charAt(0)}
                        </div>
                        <div className="pry-ff">
                            <h2 className="text-xl font-bold text-sec-clr">{profile.clinicName}</h2>
                            <p className="text-gray-500">{profile.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 pry-ff">
                    {/* Contact Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-acc-clr" />
                            <div>
                                <p className="text-sm text-gray-500 pry-ff">Email</p>
                                <p className="font-medium text-sec-clr ">{profile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-acc-clr" />
                            <div>
                                <p className="text-sm text-gray-500 pry-ff">Phone</p>
                                <p className="font-medium text-sec-clr">{profile.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-acc-clr" />
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-medium text-sec-clr">
                                    {profile.address.street}, {profile.address.city}, {profile.address.state}, {profile.address.country}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-acc-clr" />
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium text-sec-clr capitalize">{profile.status}</p>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-sec-clr mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-acc-clr" />
                            Business Hours
                        </h3>
                        <div className="grid gap-2 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Opening Time</p>
                                <p className="font-medium text-sec-clr">{profile.startingTime}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Closing Time</p>
                                <p className="font-medium text-sec-clr">{profile.closingTime}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Days Open</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile.daysOpen.map((day) => (
                                        <span key={day} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services & Animals */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-sec-clr mb-3 flex items-center gap-2">
                            <PawPrint className="w-5 h-5 text-acc-clr" />
                            Services & Animals
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Services Provided</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.servicesProvided.map((service) => (
                                        <span key={service} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md capitalize">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Animals Handled</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.animalsHandled.map((animal) => (
                                        <span key={animal} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md capitalize">
                                            {animal}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}