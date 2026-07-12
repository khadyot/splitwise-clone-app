"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createGroup } from "@/app/actions";
import { GroupInviteHeader } from "@/components/GroupInviteHeader";
import { CheckCircle2 } from "lucide-react";

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
    const [createdGroup, setCreatedGroup] = useState<{ groupId: string; joinCode: string; name: string } | null>(null);

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
            } else if (res?.success && res.groupId && res.joinCode) {
                if (typeof window !== "undefined") {
                    localStorage.setItem(`splitit_session_${res.groupId}`, res.sessionToken || "");
                    localStorage.setItem(`splitit_name_${res.groupId}`, res.name || "Organizer");
                }
                setCreatedGroup({
                    groupId: res.groupId,
                    joinCode: res.joinCode,
                    name: (formData.get("name") as string)?.trim() || "New Group",
                });
            }
        } catch (err) {
            setError("Something went wrong creating the group. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (createdGroup) {
        return (
            <div className="flex flex-col gap-4 pt-5 border-t mt-4 animate-fade-in bg-pastel-green/10 p-5 rounded-3xl border border-pastel-green/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pastel-green text-pastel-greenText flex items-center justify-center font-extrabold shadow-2xs shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-gray-900">Group Created Successfully!</h3>
                        <p className="text-xs font-medium text-gray-600">
                            Share this code so everyone can enter their expenses without signing up.
                        </p>
                    </div>
                </div>

                <GroupInviteHeader joinCode={createdGroup.joinCode} />

                <div className="flex justify-end pt-1">
                    <Button
                        onClick={() => router.push(`/groups/${createdGroup.groupId}`)}
                        className="bg-black text-white hover:bg-gray-800 font-bold px-6 h-11 rounded-full shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        Go to Group Dashboard →
                    </Button>
                </div>
            </div>
        );
    }

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
