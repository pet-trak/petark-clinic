// components/clinic/support-card.tsx
import { Mail, Phone, Clock, MessageCircle } from "lucide-react";

export default function SupportCard() {
    return (
        <main>
            <h1 className="text-2xl font-bold text-sec-clr mb-6 pry-ff">Contact Support</h1>
            
            <div className="grid gap-6 md:grid-cols-2 pry-ff">
                {/* Email Support */}
                <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Mail className="w-6 h-6 text-acc-clr" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Email Support</h2>
                    </div>
                    <p className="text-gray-600 mb-4">Send us an email and we&apos;ll get back to you within 24 hours.</p>
                    <a 
                        href="mailto:hello@usepetark.com"
                        className="inline-flex items-center gap-2 text-acc-clr font-medium hover:underline"
                    >
                        <Mail className="w-4 h-4" />
                        hello@usepetark.com
                    </a>
                </div>

                {/* Phone Support */}
                <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="w-6 h-6 text-acc-clr" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Phone Support</h2>
                    </div>
                    <p className="text-gray-600 mb-4">Call us during business hours for immediate assistance.</p>
                    <a 
                        href="tel:08171851567"
                        className="inline-flex items-center gap-2 text-acc-clr font-medium hover:underline"
                    >
                        <Phone className="w-4 h-4" />
                        08171851567
                    </a>
                </div>

                {/* Support Hours */}
                <div className="bg-pry-clr rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Clock className="w-6 h-6 text-acc-clr" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Support Hours</h2>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                        <div>
                            <p className="font-medium text-gray-700">Monday - Friday</p>
                            <p className="text-gray-600">9:00 AM - 6:00 PM</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Saturday</p>
                            <p className="text-gray-600">10:00 AM - 4:00 PM</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="font-medium text-gray-700">Sunday</p>
                            <p className="text-red-500">Closed</p>
                        </div>
                    </div>
                </div>

                {/* Response Time Note */}
                <div className="bg-acc-clr/5 rounded-xl border border-acc-clr/20 p-6 md:col-span-2">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-acc-clr" />
                        <div>
                            <p className="font-semibold text-gray-900">Typical Response Time</p>
                            <p className="text-gray-600 text-sm">We aim to respond to all inquiries within 24 hours on business days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}