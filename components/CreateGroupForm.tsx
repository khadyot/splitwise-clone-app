"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createGroup } from "@/app/actions";

const SUPPORTED_CURRENCIES = [
    { code: "INR", label: "INR – Indian Rupee" },
    { code: "USD", label: "USD – US Dollar" },
    { code: "EUR", label: "EUR – Euro" },
    { code: "GBP", label: "GBP – British Pound" },
    { code: "AUD", label: "AUD – Australian Dollar" },
    { code: "CAD", label: "CAD – Canadian Dollar" },
    { code: "SGD", label: "SGD – Singapore Dollar" },
    { code: "JPY", label: "JPY – Japanese Yen" },
    { code: "AED", label: "AED – UAE Dirham" },
];

function guessDefaultCurrency(): string {
    try {
        const locale = typeof navigator !== "undefined" ? navigator.language : "en-IN";
        const resolved = new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).resolvedOptions();
        const regionMap: Record<string, string> = {
            IN: "INR",
            US: "USD",
            GB: "GBP",
            AU: "AUD",
            CA: "CAD",
            SG: "SGD",
            JP: "JPY",
            AE: "AED",
            DE: "EUR",
            FR: "EUR",
            IT: "EUR",
            ES: "EUR",
        };
        const region = locale.split("-")[1]?.toUpperCase();
        return (region && regionMap[region]) ?? "INR";
    } catch {
        return "INR";
    }
}

export function CreateGroupForm() {
    const router = useRouter();
    const [currency, setCurrency] = useState("INR");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrency(guessDefaultCurrency());
    }, []);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await createGroup(formData);
            if (res?.error) {
                setError(res.error);
            } else if (res?.success && res.groupId) {
                if (typeof window !== "undefined") {
                    localStorage.setItem(`splitit_session_${res.groupId}`, res.sessionToken || "");
                    localStorage.setItem(`splitit_name_${res.groupId}`, res.name || "Organizer");
                }
                router.push(`/groups/${res.groupId}`);
            }
        } catch (err) {
            setError("Something went wrong creating the group. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="flex flex-col gap-3 pt-4 border-t mt-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Create New Group</h3>
            {error && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                    {error}
                </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
                <Input
                    name="name"
                    placeholder="Group name (e.g. Weekend Trip)"
                    required
                    className="flex-1 h-10 text-sm"
                />
                <Input
                    name="yourName"
                    placeholder="Your name (e.g. Alice)"
                    required
                    className="flex-1 h-10 text-sm"
                />
            </div>
            <div className="flex gap-2 items-center">
                <select
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black flex-1 sm:flex-none sm:min-w-[140px]"
                >
                    {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code}
                        </option>
                    ))}
                </select>
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-10 px-6 font-bold sm:ml-auto w-full sm:w-auto">
                    {isSubmitting ? "Creating..." : "Create Group"}
                </Button>
            </div>
            <p className="text-xs text-gray-400">
                Currency is set once at group creation and applies to all expenses in the group.
            </p>
        </form>
    );
}
