"use client";

import { useState, useEffect } from "react";
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
    const [currency, setCurrency] = useState("INR");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCurrency(guessDefaultCurrency());
    }, []);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await createGroup(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="flex flex-col gap-3 pt-4 border-t mt-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Create New Group</h3>
            <div className="flex gap-2">
                <Input
                    name="name"
                    placeholder="Group name (e.g. Weekend Trip)"
                    required
                    className="flex-1 h-9 text-sm"
                />
                <select
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[90px]"
                >
                    {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.code}
                        </option>
                    ))}
                </select>
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 px-4">
                    {isSubmitting ? "Creating..." : "Create"}
                </Button>
            </div>
            <p className="text-xs text-gray-400">
                Currency is set once at group creation and applies to all expenses in the group.
            </p>
        </form>
    );
}
